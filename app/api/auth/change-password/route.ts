import { NextResponse } from "next/server";
import { callGoBackend } from "@/lib/server/go-backend";
import { setAuthCookies } from "@/lib/server/auth-cookies";
import { reauthenticate } from "@/lib/server/reauthenticate";
import { translateSupabaseAuthError } from "@/lib/server/supabase-errors";

interface ChangePasswordBody {
  current_password?: string;
  new_password?: string;
}

/**
 * ログイン中ユーザーのパスワードを変更する。
 * 現在のパスワードでの本人確認を必須にしている(詳細は reauthenticate を参照)。
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

  const verified = await reauthenticate(current_password);
  if (!verified.ok) {
    return verified.response;
  }
  const { session } = verified;

  // 本人確認で得た新しいアクセストークンでパスワードを更新する。
  const updateResponse = await callGoBackend("/api/v1/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token: session.access_token, password: new_password }),
  });

  if (!updateResponse.ok) {
    const data = await updateResponse.json().catch(() => ({}));
    return NextResponse.json(
      { error: translateSupabaseAuthError(data, "パスワードの変更に失敗しました") },
      { status: updateResponse.status },
    );
  }

  // 変更を行ったセッションでCookieを差し替え、ログイン状態を維持する。
  const response = NextResponse.json({ success: true });
  setAuthCookies(response, session.access_token, session.refresh_token, session.expires_in ?? 3600);
  return response;
}
