import { NextResponse } from "next/server";
import { callGoBackend } from "@/lib/server/go-backend";
import { setAuthCookies } from "@/lib/server/auth-cookies";
import { reauthenticate } from "@/lib/server/reauthenticate";
import { translateSupabaseAuthError } from "@/lib/server/supabase-errors";

interface ChangeEmailBody {
  current_password?: string;
  new_email?: string;
}

/**
 * ログイン中ユーザーのメールアドレス変更を申請する。
 * 現在のパスワードでの本人確認を必須にしている(詳細は reauthenticate を参照)。
 * この時点ではまだ変更されず、確認メールのリンクが踏まれて初めて反映される。
 */
export async function POST(request: Request) {
  const { current_password, new_email } =
    (await request.json().catch(() => ({}))) as ChangeEmailBody;

  if (!current_password || !new_email) {
    return NextResponse.json(
      { error: "現在のパスワードと新しいメールアドレスを入力してください" },
      { status: 400 },
    );
  }

  const verified = await reauthenticate(current_password);
  if (!verified.ok) {
    return verified.response;
  }
  const { session, email: currentEmail } = verified;

  if (new_email.toLowerCase() === currentEmail.toLowerCase()) {
    return NextResponse.json(
      { error: "現在のメールアドレスと同じです" },
      { status: 400 },
    );
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  const updateResponse = await callGoBackend("/api/v1/auth/change-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token: session.access_token,
      email: new_email,
      redirect_to: `${origin}/auth/confirm`,
    }),
  });

  if (!updateResponse.ok) {
    const data = await updateResponse.json().catch(() => ({}));
    return NextResponse.json(
      {
        error: translateSupabaseAuthError(
          data,
          "メールアドレスの変更申請に失敗しました",
        ),
      },
      { status: updateResponse.status },
    );
  }

  // 本人確認で発行されたセッションでCookieを差し替え、ログイン状態を維持する。
  const response = NextResponse.json({ success: true });
  setAuthCookies(response, session.access_token, session.refresh_token, session.expires_in ?? 3600);
  return response;
}
