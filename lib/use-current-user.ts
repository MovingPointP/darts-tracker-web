"use client";

import useSWR from "swr";
import { useApiClient } from "./api-client";
import { useAuth } from "./auth-context";

/** Supabase Authが返すユーザー情報のうち、画面で使う項目のみ。 */
export interface CurrentUser {
  id: string;
  email: string;
  created_at: string;
  /** メールアドレス変更を申請中の場合、確認待ちの新しいアドレスが入る。 */
  new_email?: string;
}

export function useCurrentUser() {
  const { request } = useApiClient();
  const { isAuthenticated } = useAuth();

  const { data, error, isLoading, mutate } = useSWR<CurrentUser>(
    isAuthenticated ? "/api/auth/me" : null,
    (path: string) => request<CurrentUser>(path),
  );

  return { user: data ?? null, error, isLoading, mutate };
}
