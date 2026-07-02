"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Container, Paper, Title } from "@mantine/core";
import { useDocumentTitle, useMediaQuery } from "@mantine/hooks";
import { RequireAuth } from "@/components/RequireAuth";
import { RecordForm, type RecordFormValues } from "@/components/RecordForm";
import { useGameRecords } from "@/lib/use-game-records";
import { toApiDate } from "@/lib/date";

export default function NewRecordPage() {
  return (
    <RequireAuth>
      <NewRecordForm />
    </RequireAuth>
  );
}

function NewRecordForm() {
  useDocumentTitle("記録入力 | DARTS TRACKER");
  const { createRecord } = useGameRecords();
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 48em)");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: RecordFormValues) => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await createRecord({
        game_type: values.game_type,
        value: values.value,
        played_at: toApiDate(values.played_at),
      });
      router.push("/records");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "記録の作成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container size="xs">
      <Title order={2} size={isMobile ? "h6" : undefined} mb={{ base: "sm", sm: "lg" }}>
        記録入力
      </Title>
      {errorMessage && (
        <Alert color="red" mb="md">
          {errorMessage}
        </Alert>
      )}
      <Paper p={{ base: "md", sm: "xl" }} radius="md" withBorder style={{ borderColor: "var(--mantine-color-dark-5)" }}>
        <RecordForm
          submitLabel="記録する"
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </Paper>
    </Container>
  );
}
