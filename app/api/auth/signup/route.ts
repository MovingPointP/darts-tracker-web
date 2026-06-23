import { NextResponse } from "next/server";
import { callGoBackend } from "@/lib/server/go-backend";
import { setAuthCookies } from "@/lib/server/auth-cookies";

interface SupabaseSignupResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: unknown;
  msg?: string;
  error_description?: string;
  error?: string;
}

export async function POST(request: Request) {
  const body = await request.text();
  const goResponse = await callGoBackend("/api/v1/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const data = (await goResponse
    .json()
    .catch(() => ({}))) as SupabaseSignupResponse;

  if (!goResponse.ok) {
    return NextResponse.json(
      {
        error:
          data.error_description ?? data.msg ?? data.error ?? "サインアップに失敗しました",
      },
      { status: goResponse.status },
    );
  }

  if (data.access_token && data.refresh_token) {
    const response = NextResponse.json({
      requiresEmailConfirmation: false,
      user: data.user,
    });
    setAuthCookies(response, data.access_token, data.refresh_token, data.expires_in ?? 3600);
    return response;
  }

  // メール確認が有効なSupabaseプロジェクトでは、確認完了までセッションが発行されない
  return NextResponse.json({ requiresEmailConfirmation: true });
}
