import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/server/auth-cookies";
import { proxyAuthenticated } from "@/lib/server/proxy-authenticated";
import { carryOverCookies, reauthenticate } from "@/lib/server/reauthenticate";

interface DeleteAccountBody {
  current_password?: string;
  email?: string;
}

/**
 * ログイン中ユーザーのアカウントを削除する(退会・不可逆)。
 *
 * 二重の確認を行う:
 *   1. 現在のパスワードでの本人確認(reauthenticate)
 *   2. 入力されたメールアドレスがサーバー側で取得した本人のメールと一致すること
 *
 * バックエンドが記録の全削除とSupabase認証ユーザーの削除を行い、成功したらCookieを消してログアウトさせる。
 */
export async function DELETE(request: Request) {
  const { current_password, email } =
    (await request.json().catch(() => ({}))) as DeleteAccountBody;

  if (!current_password || !email) {
    return NextResponse.json(
      { error: "現在のパスワードとメールアドレスを入力してください" },
      { status: 400 },
    );
  }

  const verified = await reauthenticate(current_password);
  if (!verified.ok) {
    return verified.response;
  }

  if (email.trim().toLowerCase() !== verified.email.toLowerCase()) {
    return NextResponse.json(
      { error: "メールアドレスが一致しません" },
      { status: 400 },
    );
  }

  const deleteResponse = await proxyAuthenticated("/api/v1/auth/account", {
    method: "DELETE",
  });
  if (!deleteResponse.ok) {
    // proxyAuthenticatedがトークン更新でCookieを付けている場合があるので引き継ぐ。
    return carryOverCookies(
      deleteResponse,
      NextResponse.json(
        { error: "アカウントの削除に失敗しました" },
        { status: deleteResponse.status },
      ),
    );
  }

  const response = NextResponse.json({ success: true });
  clearAuthCookies(response);
  return response;
}
