"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, schemaResolver } from "@mantine/form";
import {
  Alert,
  Anchor,
  Button,
  Center,
  Loader,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useAuth, type RecoverySession } from "@/lib/auth-context";
import { useHasMounted } from "@/lib/use-has-mounted";

const schema = z
  .object({
    password: z.string().min(8, { error: "8文字以上で入力してください" }),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    error: "パスワードが一致しません",
    path: ["confirm"],
  });

/** Supabaseのリカバリーリンクが付与するURLフラグメントを解析する。 */
function parseRecoveryHash(hash: string):
  | { session: RecoverySession }
  | { error: string }
  | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));

  const error = params.get("error_description") ?? params.get("error");
  if (error) {
    return { error: decodeURIComponent(error.replace(/\+/g, " ")) };
  }

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  if (accessToken && refreshToken) {
    const expiresIn = Number(params.get("expires_in"));
    return {
      session: {
        accessToken,
        refreshToken,
        expiresIn: Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : undefined,
      },
    };
  }

  return null;
}

export default function ResetPasswordPage() {
  useDocumentTitle("新しいパスワードの設定 | DARTS TRACKER");
  const { resetPassword } = useAuth();
  const router = useRouter();
  const mounted = useHasMounted();

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // リカバリートークンはURLフラグメント(#...)に付与されるためクライアントでのみ読み取れる。
  const recovery = useMemo(
    () => (mounted ? parseRecoveryHash(window.location.hash) : null),
    [mounted],
  );

  const session = recovery && "session" in recovery ? recovery.session : null;
  const linkError = mounted
    ? recovery && "error" in recovery
      ? recovery.error
      : session
        ? null
        : "リセットリンクが無効です。もう一度お試しください。"
    : null;

  // トークンをURLに残さないよう、解析後に履歴から取り除く(外部システム=URLの更新)。
  useEffect(() => {
    if (session) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [session]);

  const form = useForm({
    initialValues: { password: "", confirm: "" },
    validate: schemaResolver(schema, { sync: true }),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (!session) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await resetPassword(session, values.password);
      router.replace("/records");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "パスワードの再設定に失敗しました",
      );
    } finally {
      setSubmitting(false);
    }
  });

  if (!mounted) {
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
          新しいパスワード
        </Title>
        {linkError ? (
          <>
            <Alert color="red" title="リンクが無効です">
              {linkError}
            </Alert>
            <Text size="sm" mt="md">
              <Anchor component={Link} href="/forgot-password">
                再度リセットメールを送信する
              </Anchor>
            </Text>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack>
              {errorMessage && <Alert color="red">{errorMessage}</Alert>}
              <PasswordInput
                label="新しいパスワード(8文字以上)"
                {...form.getInputProps("password")}
              />
              <PasswordInput
                label="新しいパスワード(確認)"
                {...form.getInputProps("confirm")}
              />
              <Button type="submit" loading={submitting} fullWidth>
                パスワードを変更
              </Button>
            </Stack>
          </form>
        )}
      </Paper>
    </Center>
  );
}
