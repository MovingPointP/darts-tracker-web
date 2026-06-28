"use client";

import { LineChart } from "@mantine/charts";
import { Box, Group, Text } from "@mantine/core";
import type { GameRecord, GameType } from "@/types/record";

interface RecordsChartProps {
  records: GameRecord[];
  gameType: GameType;
}

export function RecordsChart({ records, gameType }: RecordsChartProps) {
  const data = [...records]
    .sort((a, b) => a.played_at.localeCompare(b.played_at))
    .map((r) => ({
      date: r.played_at.slice(0, 10),
      値: r.value,
      ...(r.rating !== null ? { レーティング: r.rating } : {}),
    }));

  if (data.length === 0) return null;

  const hasRating = gameType !== "countup";

  return (
    <Box mb="md">
      <Group gap="lg" mb={4} px={4}>
        <Group gap={6} align="center">
          <Box w={16} h={3} style={{ borderRadius: 2, backgroundColor: "var(--mantine-color-orange-8)" }} />
          <Text size="xs" c="dimmed">値</Text>
        </Group>
        {hasRating && (
          <Group gap={6} align="center">
            <Box w={16} h={3} style={{ borderRadius: 2, backgroundColor: "var(--mantine-color-teal-7)" }} />
            <Text size="xs" c="dimmed">レーティング</Text>
          </Group>
        )}
      </Group>
      <LineChart
        h={200}
        data={data}
        dataKey="date"
        series={[
          { name: "値", color: "orange.8" },
          ...(hasRating ? [{ name: "レーティング", color: "teal.7", yAxisId: "right" as const }] : []),
        ]}
        withRightYAxis={hasRating}
        curveType="linear"
        withLegend={false}
        withDots={data.length <= 30}
        lineChartProps={{ margin: { top: 10, left: 10, right: hasRating ? 55 : 15, bottom: 5 } }}
      />
    </Box>
  );
}
