import "server-only";
import { NextResponse } from "next/server";
import { callGoBackend } from "./go-backend";
import { clearAuthCookies, getAccessToken, getRefreshToken, setAuthCookies } from "./auth-cookies";

interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  [key: string]: unknown;
}

type RefreshResult =
  | { ok: true; session: SupabaseSession }
  | { ok: false; reason: "unauthorized" | "temporary"; status: number };

async function buildResponse(goResponse: Response): Promise<NextResponse> {
  if (goResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  const body = await goResponse.text();
  return new NextResponse(body, {
    status: goResponse.status,
    headers: { "Content-Type": "application/json" },
  });
}

function unauthorizedResponse(): NextResponse {
  const res = NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  clearAuthCookies(res);
  return res;
}

async function performRefresh(): Promise<RefreshResult> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return { ok: false, reason: "unauthorized", status: 401 };
  }

  const refreshResponse = await callGoBackend("/api/v1/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!refreshResponse.ok) {
    const reason =
      refreshResponse.status === 400 || refreshResponse.status === 401
        ? "unauthorized"
        : "temporary";
    return { ok: false, reason, status: refreshResponse.status };
  }

  const session = (await refreshResponse.json().catch(() => null)) as SupabaseSession | null;
  if (!session?.access_token || !session.refresh_token) {
    return { ok: false, reason: "unauthorized", status: 401 };
  }
  return { ok: true, session };
}

// 同一サーバーレスインスタンス内で進行中のリフレッシュ処理を共有するためのキャッシュ。
// Supabaseのリフレッシュトークンローテーションが有効な場合、1つのrefresh_tokenは
// 一度使うと無効化されるため、複数のAPIリクエストがほぼ同時に401を受け取ると、
// それぞれが個別にリフレッシュを試みて片方が失敗し、誤ってログアウトされてしまう
// (例: stats画面は01Game/クリケットの記録を2本同時にfetchする)。
// この変数で同時実行を1回のリフレッシュ呼び出しにまとめることで、その競合を防ぐ。
// ただし複数のサーバーレスインスタンスをまたぐ競合までは防げないため、根本対策としては
// Supabase側でRefresh Token RotationのGrace Period(再利用許容秒数)を設定することを推奨する。
let pendingRefresh: Promise<RefreshResult> | null = null;

async function refreshSession(): Promise<RefreshResult> {
  if (!pendingRefresh) {
    pendingRefresh = performRefresh().finally(() => {
      pendingRefresh = null;
    });
  }
  return pendingRefresh;
}

/**
 * リフレッシュトークンで新しいセッションを取得し、元のリクエストを再試行する。
 * 成功すれば新しいトークンをCookieに設定したレスポンスを返す。
 * リフレッシュトークン自体が無効(400/401)な場合のみCookieをクリアして認証エラーとする。
 * Goバックエンド側の一時的な障害(5xx等)ではCookieを保持したままエラーを返す。
 */
async function refreshAndRetry(
  doFetch: (token: string) => Promise<Response>,
): Promise<NextResponse> {
  const result = await refreshSession();

  if (!result.ok) {
    if (result.reason === "unauthorized") {
      return unauthorizedResponse();
    }
    return NextResponse.json(
      { error: "セッションの更新に一時的に失敗しました" },
      { status: result.status },
    );
  }

  const { session } = result;
  const goResponse = await doFetch(session.access_token);
  const finalResponse = await buildResponse(goResponse);
  setAuthCookies(finalResponse, session.access_token, session.refresh_token, session.expires_in ?? 3600);
  return finalResponse;
}

/**
 * 認証必須のGoバックエンドAPIへ中継する。
 * アクセストークンCookieが無い場合(ブラウザ側で1時間の期限切れにより自動削除された場合を含む)、
 * またはGoバックエンドが401を返した場合の両方で、リフレッシュトークンによる
 * 再試行を1回だけ行う。成功すれば新しいトークンをCookieに設定し直す。
 */
export async function proxyAuthenticated(
  path: string,
  init?: RequestInit,
): Promise<NextResponse> {
  const doFetch = (token: string) => {
    // Headersインスタンスはプロパティが列挙不可能なため、スプレッド構文では
    // 中身が消えてしまう。Headersコンストラクタで安全にマージする。
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return callGoBackend(path, { ...init, headers });
  };

  const accessToken = await getAccessToken();
  if (accessToken) {
    const goResponse = await doFetch(accessToken);
    if (goResponse.status !== 401) {
      return buildResponse(goResponse);
    }
  }

  return refreshAndRetry(doFetch);
}
