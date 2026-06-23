"use client";

import { useCallback } from "react";
import { useAuth } from "./auth-context";

/**
 * Next.js自身のBFF(/api/...)へリクエストするフック。
 * 認証Cookieは同一オリジンなので自動送信される。トークンのリフレッシュは
 * BFF側(proxyAuthenticated)で完結するため、ここでは401時にログアウトするだけでよい。
 */
export function useApiClient() {
  const { logout } = useAuth();

  const request = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      // Headersインスタンスはプロパティが列挙不可能なため、スプレッド構文では
      // 中身が消えてしまう。Headersコンストラクタで安全にマージする。
      const headers = new Headers(init?.headers);
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      const res = await fetch(path, { ...init, headers });

      if (res.status === 401) {
        await logout();
        throw new Error("セッションの有効期限が切れました。再度ログインしてください。");
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}) as Record<string, unknown>);
        throw new Error((data.error as string) ?? "リクエストに失敗しました");
      }

      if (res.status === 204) {
        return undefined as T;
      }
      return (await res.json()) as T;
    },
    [logout],
  );

  return { request };
}
