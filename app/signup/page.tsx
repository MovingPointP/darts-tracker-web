"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, schemaResolver } from "@mantine/form";
import {
  Anchor,
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  Alert,
} from "@mantine/core";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  email: z.email({ error: "有効なメールアドレスを入力してください" }),
  password: z.string().min(8, { error: "8文字以上で入力してください" }),
});

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState(false);

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: schemaResolver(schema, { sync: true }),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      const { requiresEmailConfirmation } = await signup(
        values.email,
        values.password,
      );
      if (requiresEmailConfirmation) {
        setConfirmationNotice(true);
      } else {
        router.replace("/records");
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "サインアップに失敗しました",
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Center h="100vh">
      <Paper withBorder shadow="md" p="xl" radius="md" w={380}>
        <Title order={2} mb="md">
          サインアップ
        </Title>
        {confirmationNotice ? (
          <Alert color="blue" title="確認メールを送信しました">
            メール内のリンクから登録を完了してください。
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack>
              {errorMessage && <Alert color="red">{errorMessage}</Alert>}
              <TextInput
                label="メールアドレス"
                placeholder="you@example.com"
                {...form.getInputProps("email")}
              />
              <PasswordInput
                label="パスワード(8文字以上)"
                {...form.getInputProps("password")}
              />
              <Button type="submit" loading={submitting} fullWidth>
                サインアップ
              </Button>
            </Stack>
          </form>
        )}
        <Text size="sm" mt="md">
          既にアカウントをお持ちの場合は{" "}
          <Anchor component={Link} href="/login">
            ログイン
          </Anchor>
        </Text>
      </Paper>
    </Center>
  );
}
