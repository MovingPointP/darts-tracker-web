import "server-only";
import { NextResponse } from "next/server";
import { callGoBackend } from "./go-backend";
import { clearAuthCookies, getAccessToken, getRefreshToken, setAuthCookies } from "./auth-cookies";

interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  [key: string]: unknown;
}

async function buildResponse(goResponse: Response): Promise<NextResponse> {
  if (goResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  const body = await goResponse.text();
  return new NextResponse(body, {
    status: goResponse.status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * 認証必須のGoバックエンドAPIへ中継する。
 * アクセストークンが期限切れ(401)の場合、リフレッシュトークンで1回だけ
 * 自動的に再試行し、成功すれば新しいトークンをCookieに設定し直す。
 */
export async function proxyAuthenticated(
  path: string,
  init?: RequestInit,
): Promise<NextResponse> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const doFetch = (token: string) =>
    callGoBackend(path, {
      ...init,
      headers: { ...init?.headers, Authorization: `Bearer ${token}` },
    });

  let goResponse = await doFetch(accessToken);

  if (goResponse.status === 401) {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      const res = NextResponse.json({ error: "認証が必要です" }, { status: 401 });
      clearAuthCookies(res);
      return res;
    }

    const refreshResponse = await callGoBackend("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!refreshResponse.ok) {
      const res = NextResponse.json({ error: "認証が必要です" }, { status: 401 });
      clearAuthCookies(res);
      return res;
    }

    const session = (await refreshResponse.json()) as SupabaseSession;
    goResponse = await doFetch(session.access_token);

    const finalResponse = await buildResponse(goResponse);
    setAuthCookies(finalResponse, session.access_token, session.refresh_token, session.expires_in);
    return finalResponse;
  }

  return buildResponse(goResponse);
}
