"use client";

import { LineChart } from "@mantine/charts";
import { Box } from "@mantine/core";
import type { GameRecord } from "@/types/record";

interface RecordsChartProps {
  records: GameRecord[];
}

export function RecordsChart({ records }: RecordsChartProps) {
  const data = [...records]
    .sort((a, b) => a.played_at.localeCompare(b.played_at))
    .map((r) => ({ date: r.played_at.slice(0, 10), 値: r.value }));

  if (data.length === 0) return null;

  return (
    <Box mb="md">
      <LineChart
        h={200}
        data={data}
        dataKey="date"
        series={[{ name: "値", color: "orange.8" }]}
        curveType="linear"
        withLegend={false}
        withDots={data.length <= 30}
        lineChartProps={{ margin: { top: 10, left: 10, right: 15, bottom: 5 } }}
      />
    </Box>
  );
}
