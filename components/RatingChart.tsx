"use client";

import { LineChart } from "@mantine/charts";
import { Text } from "@mantine/core";
import type { GameRecord } from "@/types/record";
import { fromApiDate } from "@/lib/date";

interface RatingChartProps {
  records: GameRecord[];
  seriesName: string;
  color: string;
}

export function RatingChart({ records, seriesName, color }: RatingChartProps) {
  const ratedRecords = records
    .filter((r) => r.rating !== null)
    .slice()
    .sort((a, b) => a.played_at.localeCompare(b.played_at));

  if (ratedRecords.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        記録がまだありません
      </Text>
    );
  }

  const data = ratedRecords.map((r) => ({
    date: fromApiDate(r.played_at),
    [seriesName]: r.rating as number,
  }));

  return (
    <LineChart
      h={300}
      data={data}
      dataKey="date"
      series={[{ name: seriesName, color }]}
      curveType="linear"
      withDots
      withLegend
    />
  );
}
