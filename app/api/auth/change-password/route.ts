import { NextResponse } from "next/server";
import { callGoBackend } from "@/lib/server/go-backend";
import { setAuthCookies } from "@/lib/server/auth-cookies";
import { proxyAuthenticated } from "@/lib/server/proxy-authenticated";
import { translateSupabaseAuthError } from "@/lib/server/supabase-errors";

interface ChangePasswordBody {
  current_password?: string;
  new_password?: string;
}

interface SupabaseSession {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

/** proxyAuthenticatedがトークン更新時に付けたCookieを、最終的なレスポンスへ引き継ぐ。 */
function carryOverCookies(from: NextResponse, to: NextResponse): NextResponse {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
  return to;
}

/**
 * ログイン中ユーザーのパスワードを変更する。
 *
 * 現在のパスワードでの本人確認を必須にしている(セッションを奪われた場合に
 * パスワードを書き換えて締め出されることを防ぐため)。
 * 照合に使うメールアドレスは必ずサーバー側で取得する。クライアントから受け取ると、
 * 別アカウントのメール+パスワードを送ることで本人確認を迂回できてしまう。
 */
export async function POST(request: Request) {
  const { current_password, new_password } =
    (await request.json().catch(() => ({}))) as ChangePasswordBody;

  if (!current_password || !new_password) {
    return NextResponse.json(
      { error: "現在のパスワードと新しいパスワードを入力してください" },
      { status: 400 },
    );
  }

  // 1. ログイン中ユーザーのメールアドレスをサーバー側で確定させる。
  const meResponse = await proxyAuthenticated("/api/v1/auth/me");
  if (!meResponse.ok) {
    return meResponse;
  }
  const me = (await meResponse.json().catch(() => ({}))) as { email?: string };
  if (!me.email) {
    return carryOverCookies(
      meResponse,
      NextResponse.json({ error: "ユーザー情報を取得できませんでした" }, { status: 500 }),
    );
  }

  // 2. 現在のパスワードで本人確認する(ここで新しいセッションが発行される)。
  const loginResponse = await callGoBackend("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: me.email, password: current_password }),
  });
  const session = (await loginResponse.json().catch(() => ({}))) as SupabaseSession;

  if (!loginResponse.ok || !session.access_token || !session.refresh_token) {
    return carryOverCookies(
      meResponse,
      NextResponse.json(
        { error: "現在のパスワードが正しくありません" },
        { status: 400 },
      ),
    );
  }

  // 3. 本人確認で得た新しいアクセストークンでパスワードを更新する。
  const updateResponse = await callGoBackend("/api/v1/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: session.access_token, password: new_password }),
  });

  if (!updateResponse.ok) {
    const data = await updateResponse.json().catch(() => ({}));
    return carryOverCookies(
      meResponse,
      NextResponse.json(
        { error: translateSupabaseAuthError(data, "パスワードの変更に失敗しました") },
        { status: updateResponse.status },
      ),
    );
  }

  // 4. 変更を行ったセッションでCookieを差し替え、ログイン状態を維持する。
  const response = NextResponse.json({ success: true });
  setAuthCookies(response, session.access_token, session.refresh_token, session.expires_in ?? 3600);
  return response;
}
