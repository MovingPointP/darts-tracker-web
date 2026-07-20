"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm, schemaResolver } from "@mantine/form";
import {
  Alert,
  Anchor,
  Button,
  Center,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useAuth } from "@/lib/auth-context";
import { RedirectIfAuthenticated } from "@/components/RedirectIfAuthenticated";

const schema = z.object({
  email: z.email({ error: "有効なメールアドレスを入力してください" }),
});

export default function ForgotPasswordPage() {
  return (
    <RedirectIfAuthenticated>
      <ForgotPasswordForm />
    </RedirectIfAuthenticated>
  );
}

function ForgotPasswordForm() {
  useDocumentTitle("パスワードをお忘れの方 | DARTS TRACKER");
  const { requestPasswordReset } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const form = useForm({
    initialValues: { email: "" },
    validate: schemaResolver(schema, { sync: true }),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await requestPasswordReset(values.email);
      setSent(true);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "メールの送信に失敗しました",
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Center h="100vh">
      <Paper withBorder shadow="md" p="xl" radius="md" w={380}>
        <Title order={2} mb="md">
          パスワードの再設定
        </Title>
        {sent ? (
          <Alert color="blue" title="メールを送信しました">
            入力されたメールアドレスが登録されている場合、パスワード再設定用のリンクを送信しました。メールをご確認ください。
          </Alert>
        ) : (
          <>
            <Text size="sm" c="dimmed" mb="md">
              登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
            </Text>
            <form onSubmit={handleSubmit}>
              <Stack>
                {errorMessage && <Alert color="red">{errorMessage}</Alert>}
                <TextInput
                  label="メールアドレス"
                  placeholder="you@example.com"
                  {...form.getInputProps("email")}
                />
                <Button type="submit" loading={submitting} fullWidth>
                  再設定リンクを送信
                </Button>
              </Stack>
            </form>
          </>
        )}
        <Text size="sm" mt="md">
          <Anchor component={Link} href="/login">
            ログインに戻る
          </Anchor>
        </Text>
      </Paper>
    </Center>
  );
}
