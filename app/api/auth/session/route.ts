import { NextResponse } from "next/server";
import { setAuthCookies } from "@/lib/server/auth-cookies";

interface SessionBody {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

/**
 * 確認メールのリンク経由で発行されたセッションをCookieに確立する。
 * トークンはSupabaseのリダイレクト時にURLフラグメントへ付与され、ブラウザ側で読み取って渡ってくる。
 */
export async function POST(request: Request) {
  const { access_token, refresh_token, expires_in } =
    (await request.json().catch(() => ({}))) as SessionBody;

  if (!access_token || !refresh_token) {
    return NextResponse.json(
      { error: "リンクが不正か、必要な情報が不足しています" },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ success: true });
  setAuthCookies(response, access_token, refresh_token, expires_in ?? 3600);
  return response;
}
