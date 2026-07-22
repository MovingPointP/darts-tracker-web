"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  clearAuthenticatedFlag,
  getFlagSnapshot,
  getServerSnapshot,
  setAuthenticatedFlag,
  subscribe,
} from "./auth-flag-store";
import type { AuthHashSession } from "./auth-hash";

/** パスワードリセットのメールリンク経由で発行されるリカバリーセッション。 */
export type RecoverySession = AuthHashSession;

interface AuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
  ) => Promise<{ requiresEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (session: RecoverySession, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function extractErrorMessage(res: Response): Promise<string> {
  const data = await res.json().catch(() => ({}) as Record<string, unknown>);
  return (data.error as string) || "リクエストに失敗しました";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // ログイン済みかどうかの表示用フラグのみを購読する(実トークンはhttpOnly Cookie)。
  const isAuthenticated = useSyncExternalStore(
    subscribe,
    getFlagSnapshot,
    getServerSnapshot,
  );

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res));
    }
    setAuthenticatedFlag();
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res));
    }
    const data = (await res.json()) as { requiresEmailConfirmation: boolean };
    if (!data.requiresEmailConfirmation) {
      setAuthenticatedFlag();
    }
    return data;
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    clearAuthenticatedFlag();
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const res = await fetch("/api/auth/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res));
    }
  }, []);

  const resetPassword = useCallback(
    async (session: RecoverySession, password: string) => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: session.accessToken,
          refresh_token: session.refreshToken,
          expires_in: session.expiresIn,
          password,
        }),
      });
      if (!res.ok) {
        throw new Error(await extractErrorMessage(res));
      }
      // 再設定成功時はリカバリーセッションがそのままログインセッションになる。
      setAuthenticatedFlag();
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        signup,
        logout,
        requestPasswordReset,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
