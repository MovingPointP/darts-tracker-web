"use client";

/** Supabaseのメールリンク経由で発行されるセッション。 */
export interface AuthHashSession {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export type AuthHashResult =
  | { session: AuthHashSession }
  | { error: string }
  | null;

/**
 * Supabaseがリダイレクト時にURLフラグメント(#...)へ付与するトークン/エラーを解析する。
 * パスワードリセットとメールアドレス変更の確認リンクで共通して使う。
 * 解析できるトークンもエラーも無ければ null を返す。
 */
export function parseAuthHash(hash: string): AuthHashResult {
  const params = new URLSearchParams(hash.replace(/^#/, ""));

  const error = params.get("error_description") ?? params.get("error");
  if (error) {
    return { error: decodeURIComponent(error.replace(/\+/g, " ")) };
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken) {
    const expiresIn = Number(params.get("expires_in"));
    return {
      session: {
        accessToken,
        refreshToken,
        expiresIn: Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : undefined,
      },
    };
  }

  return null;
}
