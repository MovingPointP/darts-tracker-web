import { NextResponse } from "next/server";
import { callGoBackend } from "@/lib/server/go-backend";
import { setAuthCookies } from "@/lib/server/auth-cookies";
import { translateSupabaseAuthError } from "@/lib/server/supabase-errors";

interface ResetPasswordBody {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  password?: string;
}

/**
 * リカバリーセッションのアクセストークンで新しいパスワードを設定する。
 * access_token / refresh_token はメールのリンク経由で発行されたリカバリーセッションのもので、
 * ブラウザ側でURLフラグメントから読み取って渡ってくる。
 * 更新に成功したら、そのままログイン状態にするためにhttpOnly Cookieへセッションを設定する。
 */
export async function POST(request: Request) {
  const { access_token, refresh_token, expires_in, password } =
    (await request.json().catch(() => ({}))) as ResetPasswordBody;

  if (!access_token || !refresh_token || !password) {
    return NextResponse.json(
      { error: "リセットリンクが不正か、必要な情報が不足しています" },
      { status: 400 },
    );
  }

  const goResponse = await callGoBackend("/api/v1/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ access_token, password }),
  });

  if (!goResponse.ok) {
    const data = await goResponse.json().catch(() => ({}));
    return NextResponse.json(
      {
        error: translateSupabaseAuthError(
          data,
          "パスワードの再設定に失敗しました。リンクの有効期限が切れている可能性があります。",
        ),
      },
      { status: goResponse.status },
    );
  }

  // 再設定に成功したので、リカバリーセッションをそのままログインセッションとして確立する。
  const response = NextResponse.json({ success: true });
  setAuthCookies(response, access_token, refresh_token, expires_in ?? 3600);
  return response;
}
