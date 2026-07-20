import "server-only";

/**
 * Supabase Auth(GoTrue)のエラーレスポンスを日本語メッセージへ変換する。
 * アプリ全体が日本語表示なので、Supabaseがそのまま返す英語メッセージを画面に出さないための共通処理。
 *
 * GoTrueのエラーボディはエンドポイントやバージョンで形が異なる:
 *   - 新: { code: 400, error_code: "invalid_credentials", msg: "Invalid login credentials" }
 *   - 旧/token: { error: "invalid_grant", error_description: "..." }
 * そのため error_code(コード)優先、無ければ生メッセージのパターンで判定する。
 */
interface SupabaseAuthError {
  error_code?: string;
  msg?: string;
  error?: string;
  error_description?: string;
}

// error_code(または error)ごとの日本語メッセージ。
const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: "メールアドレスまたはパスワードが正しくありません",
  email_not_confirmed:
    "メールアドレスが未確認です。確認メールのリンクから登録を完了してください",
  user_already_exists: "このメールアドレスは既に登録されています",
  email_exists: "このメールアドレスは既に登録されています",
  email_address_invalid: "メールアドレスの形式が正しくありません",
  weak_password: "パスワードが脆弱です。より長く複雑なパスワードを設定してください",
  same_password: "新しいパスワードは現在のものと異なるものを設定してください",
  over_email_send_rate_limit:
    "メール送信の回数制限に達しました。しばらく待ってから再度お試しください",
  over_request_rate_limit:
    "リクエストが多すぎます。しばらく待ってから再度お試しください",
  bad_jwt: "リンクが無効か、有効期限が切れています。もう一度お試しください",
  session_not_found: "セッションが見つかりません。もう一度お試しください",
  validation_failed: "入力内容に誤りがあります",
  signup_disabled: "現在サインアップは受け付けていません",
};

// error_codeが無い旧レスポンス向けに、生メッセージ(msg/error_description)のパターンで判定する。
const PATTERN_MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, CODE_MESSAGES.invalid_credentials],
  [/email not confirmed/i, CODE_MESSAGES.email_not_confirmed],
  [/already (registered|been registered)|user already/i, CODE_MESSAGES.user_already_exists],
  [/password should be at least/i, "パスワードが短すぎます。8文字以上で設定してください"],
  [/different from the old password/i, CODE_MESSAGES.same_password],
  [/rate limit|too many requests/i, CODE_MESSAGES.over_request_rate_limit],
  [/expired|invalid.*token|token.*(malformed|invalid)|bad_jwt/i, CODE_MESSAGES.bad_jwt],
];

/**
 * Supabaseのエラーレスポンス(パース済みJSON)を日本語メッセージへ変換する。
 * 該当が無ければ fallback を返す。
 */
export function translateSupabaseAuthError(body: unknown, fallback: string): string {
  const err = (body ?? {}) as SupabaseAuthError;

  const code = err.error_code ?? err.error;
  if (code && CODE_MESSAGES[code]) {
    return CODE_MESSAGES[code];
  }

  const raw = err.error_description ?? err.msg ?? err.error ?? "";
  for (const [pattern, message] of PATTERN_MESSAGES) {
    if (pattern.test(raw)) {
      return message;
    }
  }

  return fallback;
}
