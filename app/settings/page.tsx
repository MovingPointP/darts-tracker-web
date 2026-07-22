"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm, schemaResolver } from "@mantine/form";
import {
  Alert,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDocumentTitle, useMediaQuery } from "@mantine/hooks";
import { RequireAuth } from "@/components/RequireAuth";
import { useCurrentUser } from "@/lib/use-current-user";
import { fromApiDate } from "@/lib/date";

const schema = z
  .object({
    current_password: z.string().min(1, { error: "現在のパスワードを入力してください" }),
    new_password: z.string().min(8, { error: "8文字以上で入力してください" }),
    confirm: z.string(),
  })
  .refine((data) => data.new_password === data.confirm, {
    error: "パスワードが一致しません",
    path: ["confirm"],
  });

const emailSchema = z.object({
  new_email: z.email({ error: "有効なメールアドレスを入力してください" }),
  current_password: z.string().min(1, { error: "現在のパスワードを入力してください" }),
});

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}

function SettingsContent() {
  useDocumentTitle("アカウント設定 | DARTS TRACKER");
  const isMobile = useMediaQuery("(max-width: 48em)");
  const { user, error: userError, isLoading, mutate } = useCurrentUser();

  return (
    <Container size="sm">
      <Title order={2} size={isMobile ? "h6" : undefined} mb={{ base: "sm", sm: "lg" }}>
        アカウント設定
      </Title>

      <Stack gap={isMobile ? "md" : "xl"}>
        <AccountInfoSection
          email={user?.email}
          createdAt={user?.created_at}
          pendingEmail={user?.new_email}
          isLoading={isLoading}
          hasError={Boolean(userError)}
          isMobile={isMobile}
        />
        <EmailSection isMobile={isMobile} onChanged={mutate} />
        <PasswordSection isMobile={isMobile} />
      </Stack>
    </Container>
  );
}

function SectionPaper({
  title,
  isMobile,
  children,
}: {
  title: string;
  isMobile: boolean | undefined;
  children: React.ReactNode;
}) {
  return (
    <Paper
      p={{ base: "md", sm: "xl" }}
      radius="md"
      withBorder
      style={{ borderColor: "var(--mantine-color-dark-5)" }}
    >
      <Text fw={500} size={isMobile ? "sm" : undefined} mb="md">
        {title}
      </Text>
      {children}
    </Paper>
  );
}

function AccountInfoSection({
  email,
  createdAt,
  pendingEmail,
  isLoading,
  hasError,
  isMobile,
}: {
  email: string | undefined;
  createdAt: string | undefined;
  pendingEmail: string | undefined;
  isLoading: boolean;
  hasError: boolean;
  isMobile: boolean | undefined;
}) {
  return (
    <SectionPaper title="アカウント情報" isMobile={isMobile}>
      {hasError ? (
        <Alert color="red">ユーザー情報の取得に失敗しました</Alert>
      ) : isLoading ? (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      ) : (
        <Stack gap="xs">
          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" c="dimmed">
              メールアドレス
            </Text>
            <Text size="sm" fw={500} style={{ wordBreak: "break-all" }} ta="right">
              {email ?? "—"}
            </Text>
          </Group>
          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" c="dimmed">
              登録日
            </Text>
            <Text size="sm" fw={500}>
              {createdAt ? fromApiDate(createdAt) : "—"}
            </Text>
          </Group>
          {pendingEmail && (
            <Alert color="blue" mt="xs">
              {pendingEmail} への変更を確認待ちです。届いた確認メールのリンクを開いてください。
            </Alert>
          )}
        </Stack>
      )}
    </SectionPaper>
  );
}

function EmailSection({
  isMobile,
  onChanged,
}: {
  isMobile: boolean | undefined;
  onChanged: () => void;
}) {
  const fieldSize = isMobile ? "xs" : undefined;
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const form = useForm({
    initialValues: { new_email: "", current_password: "" },
    validate: schemaResolver(emailSchema, { sync: true }),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    setErrorMessage(null);
    setSucceeded(false);
    try {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          new_email: values.new_email,
          current_password: values.current_password,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "メールアドレスの変更申請に失敗しました");
      }
      form.reset();
      setSucceeded(true);
      onChanged();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "メールアドレスの変更申請に失敗しました",
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <SectionPaper title="メールアドレスの変更" isMobile={isMobile}>
      <form onSubmit={handleSubmit}>
        <Stack gap={isMobile ? "sm" : undefined}>
          {errorMessage && <Alert color="red">{errorMessage}</Alert>}
          {succeeded && (
            <Alert color="teal">
              確認メールを送信しました。メール内のリンクを開くと変更が完了します。
            </Alert>
          )}
          <TextInput
            label="新しいメールアドレス"
            placeholder="you@example.com"
            size={fieldSize}
            {...form.getInputProps("new_email")}
          />
          <PasswordInput
            label="現在のパスワード"
            size={fieldSize}
            {...form.getInputProps("current_password")}
          />
          <Group justify="flex-end">
            <Button type="submit" size={fieldSize} loading={submitting}>
              確認メールを送信
            </Button>
          </Group>
        </Stack>
      </form>
    </SectionPaper>
  );
}

function PasswordSection({ isMobile }: { isMobile: boolean | undefined }) {
  const fieldSize = isMobile ? "xs" : undefined;
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const form = useForm({
    initialValues: { current_password: "", new_password: "", confirm: "" },
    validate: schemaResolver(schema, { sync: true }),
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);
    setErrorMessage(null);
    setSucceeded(false);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: values.current_password,
          new_password: values.new_password,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "パスワードの変更に失敗しました");
      }
      form.reset();
      setSucceeded(true);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "パスワードの変更に失敗しました",
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <SectionPaper title="パスワードの変更" isMobile={isMobile}>
      <form onSubmit={handleSubmit}>
        <Stack gap={isMobile ? "sm" : undefined}>
          {errorMessage && <Alert color="red">{errorMessage}</Alert>}
          {succeeded && <Alert color="teal">パスワードを変更しました</Alert>}
          <PasswordInput
            label="現在のパスワード"
            size={fieldSize}
            {...form.getInputProps("current_password")}
          />
          <PasswordInput
            label="新しいパスワード(8文字以上)"
            size={fieldSize}
            {...form.getInputProps("new_password")}
          />
          <PasswordInput
            label="新しいパスワード(確認)"
            size={fieldSize}
            {...form.getInputProps("confirm")}
          />
          <Group justify="flex-end">
            <Button type="submit" size={fieldSize} loading={submitting}>
              変更する
            </Button>
          </Group>
        </Stack>
      </form>
    </SectionPaper>
  );
}
