"use client";

import { useEffect, useRef } from "react";
import { LineChart } from "@mantine/charts";
import { Box, Group, ScrollArea, Text } from "@mantine/core";
import type { GameRecord } from "@/types/record";
import { fromApiDate } from "@/lib/date";

const PX_PER_POINT = 60;
const Y_AXIS_WIDTH = 50;
// top/bottomは2チャート間で目盛り位置を揃えるために必ず一致させる(凡例なしで自動余白に頼らない)。
// left/rightは整列に影響しないため、それぞれのチャートの見た目に合わせて個別に設定する。
const CHART_MARGIN_Y = { top: 25, bottom: 5 };
const FIXED_AXIS_MARGIN = { ...CHART_MARGIN_Y, left: 5, right: 5 };
const SCROLLABLE_CHART_MARGIN = { ...CHART_MARGIN_Y, left: 25, right: 25 };

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
  const viewportRef = useRef<HTMLDivElement>(null);

  // 初期表示・データ更新時は最新(右端)が見える位置までスクロールする
  useEffect(() => {
    viewportRef.current?.scrollTo({ left: viewportRef.current.scrollWidth });
  }, [data.length]);

  if (data.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        記録がまだありません
      </Text>
    );
  }

  return (
    <Group gap={0} wrap="nowrap" align="flex-start">
      {/* 横スクロールしても常に見えるY軸専用チャート(線は透明にして軸だけ見せる) */}
      <Box w={Y_AXIS_WIDTH} style={{ flexShrink: 0 }}>
        <LineChart
          h={300}
          data={data}
          dataKey="date"
          series={[{ name: seriesName, color: "transparent" }]}
          xAxisProps={{ tick: { fill: "transparent" }, axisLine: false, tickLine: false }}
          lineChartProps={{ margin: FIXED_AXIS_MARGIN }}
          withDots={false}
          withTooltip={false}
          withLegend={false}
        />
      </Box>

      {/* 横スクロール可能な本体(Y軸は非表示にして重複させない) */}
      <ScrollArea viewportRef={viewportRef} type="auto" pb="md" style={{ flex: 1, minWidth: 0 }}>
        <Box w={data.length * PX_PER_POINT} miw="100%">
          <LineChart
            h={300}
            data={data}
            dataKey="date"
            series={[{ name: seriesName, color }]}
            withYAxis={false}
            lineChartProps={{ margin: SCROLLABLE_CHART_MARGIN }}
            curveType="linear"
            withDots
            withLegend={false}
          />
        </Box>
      </ScrollArea>
    </Group>
  );
}
