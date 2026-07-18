"use client";

import { type ComponentProps, useMemo } from "react";
import { ChartTooltip, LineChart } from "@mantine/charts";
import { Box } from "@mantine/core";
import type { GameRecord } from "@/types/record";

interface RecordsChartProps {
  records: GameRecord[];
}

const SERIES = [{ name: "値", color: "orange.8" }];

export function RecordsChart({ records }: RecordsChartProps) {
  const data = useMemo(() => {
    if (records.length === 0) return [];
    // 同一日に複数の記録があると日付が重複し、Rechartsのツールチップが一部の点で
    // 反応しなくなる。X軸キーには一意なindexを使い、日付はツールチップに表示する。
    return [...records]
      .sort((a, b) => a.played_at.localeCompare(b.played_at))
      .map((r, index) => ({ index, date: r.played_at.slice(0, 10), 値: r.value }));
  }, [records]);

  if (data.length === 0) return null;

  return (
    <Box mb="md">
      <LineChart
        h={{ base: 130, sm: 200 }}
        data={data}
        dataKey="index"
        series={SERIES}
        curveType="linear"
        withLegend={false}
        withXAxis={false}
        withDots={data.length <= 30}
        lineChartProps={{ margin: { top: 10, left: 10, right: 15, bottom: 5 } }}
        tooltipProps={{
          content: (props) => {
            const items = props.payload;
            if (!items || items.length === 0) return null;
            return (
              <ChartTooltip
                label={items[0].payload?.date}
                payload={items as ComponentProps<typeof ChartTooltip>["payload"]}
                series={SERIES}
              />
            );
          },
        }}
      />
    </Box>
  );
}
