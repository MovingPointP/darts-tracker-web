import { NextResponse } from "next/server";
import { callGoBackend } from "@/lib/server/go-backend";
import { setAuthCookies } from "@/lib/server/auth-cookies";
import { translateSupabaseAuthError } from "@/lib/server/supabase-errors";

interface SupabaseLoginResponse {
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
  const goResponse = await callGoBackend("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const data = (await goResponse
    .json()
    .catch(() => ({}))) as SupabaseLoginResponse;

  if (!goResponse.ok || !data.access_token || !data.refresh_token) {
    return NextResponse.json(
      { error: translateSupabaseAuthError(data, "ログインに失敗しました") },
      { status: goResponse.ok ? 401 : goResponse.status },
    );
  }

  const response = NextResponse.json({ user: data.user });
  setAuthCookies(response, data.access_token, data.refresh_token, data.expires_in ?? 3600);
  return response;
}
