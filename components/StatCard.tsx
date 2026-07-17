"use client";

import { Paper, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

/** 集計値を表示するカード。記録一覧・成績サマリーで共通利用する。 */
export function StatCard({ label, value }: { label: string; value: string | number }) {
  const isMobile = useMediaQuery("(max-width: 48em)");
  return (
    <Paper p={isMobile ? "xs" : "md"} radius="md" withBorder style={{ borderColor: "var(--mantine-color-dark-5)" }}>
      <Text size="xs" c="dimmed" mb={4} style={{ whiteSpace: "nowrap" }}>
        {label}
      </Text>
      <Text size={isMobile ? "md" : "2rem"} fw={700} c="teal.4">
        {value}
      </Text>
    </Paper>
  );
}
