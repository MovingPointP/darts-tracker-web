"use client";

import { useCallback } from "react";
import { useAuth } from "./auth-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/**
 * Goバックエンドへのリクエストを行うフック。
 * 401が返った場合は一度だけrefreshAccessTokenを試み、再リクエストする。
 */
export function useApiClient() {
  const { accessToken, refreshAccessToken, logout } = useAuth();

  const request = useCallback(
    async <T,>(path: string, init?: RequestInit): Promise<T> => {
      const doFetch = (token: string | null) =>
        fetch(`${API_BASE_URL}${path}`, {
          ...init,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...init?.headers,
          },
        });

      let res = await doFetch(accessToken);

      if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          logout();
          throw new Error("セッションの有効期限が切れました。再度ログインしてください。");
        }
        res = await doFetch(newToken);
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
    [accessToken, refreshAccessToken, logout],
  );

  return { request };
}
