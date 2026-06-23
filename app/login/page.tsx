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
import { RedirectIfAuthenticated } from "@/components/RedirectIfAuthenticated";

const schema = z.object({
  email: z.email({ error: "有効なメールアドレスを入力してください" }),
  password: z.string().min(8, { error: "8文字以上で入力してください" }),
});

export default function LoginPage() {
  return (
    <RedirectIfAuthenticated>
      <LoginForm />
    </RedirectIfAuthenticated>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: schemaResolver(schema, { sync: true }),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await login(values.email, values.password);
      router.replace("/records");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Center h="100vh">
      <Paper withBorder shadow="md" p="xl" radius="md" w={380}>
        <Title order={2} mb="md">
          ログイン
        </Title>
        <form onSubmit={handleSubmit}>
          <Stack>
            {errorMessage && <Alert color="red">{errorMessage}</Alert>}
            <TextInput
              label="メールアドレス"
              placeholder="you@example.com"
              {...form.getInputProps("email")}
            />
            <PasswordInput
              label="パスワード"
              {...form.getInputProps("password")}
            />
            <Button type="submit" loading={submitting} fullWidth>
              ログイン
            </Button>
          </Stack>
        </form>
        <Text size="sm" mt="md">
          アカウントをお持ちでない場合は{" "}
          <Anchor component={Link} href="/signup">
            サインアップ
          </Anchor>
        </Text>
      </Paper>
    </Center>
  );
}
