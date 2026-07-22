"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Alert, Anchor, Center, Loader, Paper, Text, Title } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { parseAuthHash } from "@/lib/auth-hash";
import { useHasMounted } from "@/lib/use-has-mounted";

type Outcome =
  | { status: "completed"; email: string }
  | { status: "pending"; newEmail: string }
  | { status: "error"; message: string };

const INVALID_LINK_MESSAGE = "リンクが無効です。もう一度お試しください。";

/**
 * メールアドレス変更の確認リンクの着地点。
 * URLフラグメントのトークンでセッションを確立し、変更が完了したかを判定して表示する。
 * Supabaseの Secure email change が有効な場合は新旧両方のアドレスでの確認が必要なため、
 * 片方だけ踏んだ段階ではまだ new_email が残る(=確認待ち)。
 */
export default function ConfirmPage() {
  useDocumentTitle("メールアドレスの確認 | DARTS TRACKER");
  const mounted = useHasMounted();
  // 非同期処理(セッション確立→me取得)の結果のみをstateで持つ。
  // フラグメント自体の不備(トークン無し/エラー付き)は同期的に導出する。
  const [asyncOutcome, setAsyncOutcome] = useState<Outcome | null>(null);

  const parsed = useMemo(
    () => (mounted ? parseAuthHash(window.location.hash) : null),
    [mounted],
  );
  const session = parsed && "session" in parsed ? parsed.session : null;

  useEffect(() => {
    if (!session) return;

    let cancelled = false;
    const confirm = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: session.accessToken,
            refresh_token: session.refreshToken,
            expires_in: session.expiresIn,
          }),
        });
        if (!sessionRes.ok) {
          const data = (await sessionRes.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? "確認処理に失敗しました");
        }

        // トークンをURLに残さないよう取り除く。
        window.history.replaceState(null, "", window.location.pathname);

        // new_email が残っていれば、もう一方のアドレスでの確認がまだ済んでいない。
        const meRes = await fetch("/api/auth/me");
        const me = (await meRes.json().catch(() => ({}))) as {
          email?: string;
          new_email?: string;
        };

        if (cancelled) return;
        setAsyncOutcome(
          me.new_email
            ? { status: "pending", newEmail: me.new_email }
            : { status: "completed", email: me.email ?? "" },
        );
      } catch (err) {
        if (!cancelled) {
          setAsyncOutcome({
            status: "error",
            message: err instanceof Error ? err.message : "確認処理に失敗しました",
          });
        }
      }
    };

    void confirm();
    return () => {
      cancelled = true;
    };
  }, [session]);

  // フラグメント不備は同期導出、非同期処理の結果はstateから。
  let outcome: Outcome | null = null;
  if (mounted && !session) {
    outcome =
      parsed && "error" in parsed
        ? { status: "error", message: parsed.error }
        : { status: "error", message: INVALID_LINK_MESSAGE };
  } else {
    outcome = asyncOutcome;
  }

  if (!outcome) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  return (
    <Center h="100vh">
      <Paper withBorder shadow="md" p="xl" radius="md" w={380}>
        <Title order={2} mb="md">
          メールアドレスの確認
        </Title>

        {outcome.status === "completed" && (
          <Alert color="teal" title="変更が完了しました">
            メールアドレスを {outcome.email} に変更しました。
          </Alert>
        )}
        {outcome.status === "pending" && (
          <Alert color="blue" title="確認を受け付けました">
            変更を完了するには、もう一方のメールアドレス({outcome.newEmail})宛に届いた確認メールのリンクも開いてください。
          </Alert>
        )}
        {outcome.status === "error" && (
          <Alert color="red" title="確認できませんでした">
            {outcome.message}
          </Alert>
        )}

        <Text size="sm" mt="md">
          <Anchor component={Link} href="/settings">
            アカウント設定に戻る
          </Anchor>
        </Text>
      </Paper>
    </Center>
  );
}
