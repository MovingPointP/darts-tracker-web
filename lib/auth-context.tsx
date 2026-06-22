"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  clearSession,
  getAccessTokenSnapshot,
  getRefreshToken,
  getServerSnapshot,
  setSession,
  subscribe,
} from "./token-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  [key: string]: unknown;
}

interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
  ) => Promise<{ requiresEmailConfirmation: boolean }>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function extractErrorMessage(res: Response): Promise<string> {
  const data = await res.json().catch(() => ({}) as Record<string, unknown>);
  return (
    (data.error_description as string) ||
    (data.msg as string) ||
    (data.error as string) ||
    "リクエストに失敗しました"
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // localStorageを外部ストアとして購読する。SSR時はgetServerSnapshot(null)を返し、
  // ハイドレーション直後に実際の値へ同期される(useEffectでのsetStateより安全)。
  const accessToken = useSyncExternalStore(
    subscribe,
    getAccessTokenSnapshot,
    getServerSnapshot,
  );

  const logout = useCallback(() => {
    clearSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res));
    }
    const session = (await res.json()) as SupabaseSession;
    setSession(session.access_token, session.refresh_token);
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error(await extractErrorMessage(res));
    }
    const data = (await res.json()) as Partial<SupabaseSession>;
    if (data.access_token && data.refresh_token) {
      setSession(data.access_token, data.refresh_token);
      return { requiresEmailConfirmation: false };
    }
    // メール確認が有効なSupabaseプロジェクトでは、確認完了までセッションが発行されない
    return { requiresEmailConfirmation: true };
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return null;
    }
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      clearSession();
      return null;
    }
    const session = (await res.json()) as SupabaseSession;
    setSession(session.access_token, session.refresh_token);
    return session.access_token;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated: accessToken !== null,
        login,
        signup,
        logout,
        refreshAccessToken,
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
