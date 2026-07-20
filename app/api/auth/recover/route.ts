import { NextResponse } from "next/server";
import { callGoBackend } from "@/lib/server/go-backend";

/**
 * パスワードリセットメールの送信をGoバックエンド経由でSupabaseへ依頼する。
 * メール内リンクの遷移先(redirect_to)はこのBFFのオリジンから組み立てて渡す
 * (Supabaseのリダイレクト許可リストに <origin>/reset-password を登録しておく必要がある)。
 * メールアドレスの登録有無を漏らさないよう、バックエンドの結果によらず常に成功として応答する。
 */
export async function POST(request: Request) {
  const { email } = (await request.json().catch(() => ({}))) as { email?: string };
  if (!email) {
    return NextResponse.json({ error: "メールアドレスを入力してください" }, { status: 400 });
  }

  const origin =
    request.headers.get("origin") ?? new URL(request.url).origin;
  const redirectTo = `${origin}/reset-password`;

  await callGoBackend("/api/v1/auth/recover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, redirect_to: redirectTo }),
  }).catch(() => undefined);

  // 登録済みか否かに関わらず同じ応答を返す(メールアドレス列挙攻撃の防止)。
  return NextResponse.json({ success: true });
}
