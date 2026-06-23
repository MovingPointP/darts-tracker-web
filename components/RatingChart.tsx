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

/** 同じ日付の記録はレーティングの平均値にまとめ、日付昇順で返す。 */
function aggregateByDay(
  records: GameRecord[],
  seriesName: string,
): Record<string, number | string>[] {
  const sums = new Map<string, { total: number; count: number }>();
  for (const r of records) {
    if (r.rating === null) continue;
    const date = fromApiDate(r.played_at);
    const entry = sums.get(date) ?? { total: 0, count: 0 };
    entry.total += r.rating;
    entry.count += 1;
    sums.set(date, entry);
  }

  return Array.from(sums.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { total, count }]) => ({
      date,
      [seriesName]: Math.round((total / count) * 100) / 100,
    }));
}

export function RatingChart({ records, seriesName, color }: RatingChartProps) {
  const data = aggregateByDay(records, seriesName);

  if (data.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        記録がまだありません
      </Text>
    );
  }

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
