import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE = "darts_access_token";
export const REFRESH_TOKEN_COOKIE = "darts_refresh_token";

// リフレッシュトークンの実際の有効期限はSupabase側の設定に依存するが、
// Cookie自体の寿命としては余裕を持って30日とする。
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

/** ログイン/サインアップ/リフレッシュ成功時に、レスポンスへ両Cookieを設定する。 */
export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions(),
    maxAge: expiresIn,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions(),
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

/** ログアウト時に両Cookieを削除する。 */
export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", { ...baseCookieOptions(), maxAge: 0 });
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", { ...baseCookieOptions(), maxAge: 0 });
}

export async function getAccessToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}
