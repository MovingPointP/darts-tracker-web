import "server-only";
import { NextResponse } from "next/server";
import { callGoBackend } from "./go-backend";
import { proxyAuthenticated } from "./proxy-authenticated";

export interface VerifiedSession {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
}

type ReauthenticateResult =
  | { ok: true; email: string; session: VerifiedSession }
  | { ok: false; response: NextResponse };

/** proxyAuthenticatedがトークン更新時に付けたCookieを、最終的なレスポンスへ引き継ぐ。 */
export function carryOverCookies(from: NextResponse, to: NextResponse): NextResponse {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
  return to;
}

/**
 * ログイン中ユーザーに現在のパスワードを入力させて本人確認する。
 *
 * メールアドレス・パスワードといった重要情報の変更前に呼ぶ。セッションだけで変更を
 * 許すと、セッションを奪われた際にアカウントごと乗っ取られてしまうため。
 *
 * 照合に使うメールアドレスは必ずサーバー側(GET /auth/me)で取得する。クライアントから
 * 受け取ると、別アカウントのメール+パスワードを送ることで本人確認を迂回できてしまう。
 *
 * 成功時は本人確認で新たに発行されたセッションを返す。呼び出し側はこのアクセストークンで
 * 変更処理を行い、最後にこのセッションでCookieを差し替えることでログイン状態を維持できる。
 */
export async function reauthenticate(
  currentPassword: string,
): Promise<ReauthenticateResult> {
  const meResponse = await proxyAuthenticated("/api/v1/auth/me");
  if (!meResponse.ok) {
    return { ok: false, response: meResponse };
  }

  const me = (await meResponse.json().catch(() => ({}))) as { email?: string };
  if (!me.email) {
    return {
      ok: false,
      response: carryOverCookies(
        meResponse,
        NextResponse.json(
          { error: "ユーザー情報を取得できませんでした" },
          { status: 500 },
        ),
      ),
    };
  }

  const loginResponse = await callGoBackend("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: me.email, password: currentPassword }),
  });
  const session = (await loginResponse.json().catch(() => ({}))) as Partial<VerifiedSession>;

  if (!loginResponse.ok || !session.access_token || !session.refresh_token) {
    return {
      ok: false,
      response: carryOverCookies(
        meResponse,
        NextResponse.json(
          { error: "現在のパスワードが正しくありません" },
          { status: 400 },
        ),
      ),
    };
  }

  return {
    ok: true,
    email: me.email,
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
    },
  };
}
