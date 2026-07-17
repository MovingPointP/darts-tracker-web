import { SimpleGrid } from "@mantine/core";
import { StatCard } from "./StatCard";
import { VALUE_COLUMN_LABELS, type GameRecord, type GameType } from "@/types/record";

interface SummaryStatsProps {
  records: GameRecord[];
  gameType: GameType;
}

function formatValue(value: number, gameType: GameType): string {
  if (gameType === "countup") return Math.round(value).toString();
  return value.toFixed(2);
}

export function SummaryStats({ records, gameType }: SummaryStatsProps) {
  if (records.length === 0) return null;

  const valueLabel = VALUE_COLUMN_LABELS[gameType];
  const hasRating = gameType !== "countup";

  const maxValue = Math.max(...records.map((r) => r.value));
  const avgValue = records.reduce((s, r) => s + r.value, 0) / records.length;

  const ratedRecords = hasRating ? records.filter((r) => r.rating != null) : [];
  const avgRating =
    ratedRecords.length > 0
      ? ratedRecords.reduce((s, r) => s + (r.rating ?? 0), 0) / ratedRecords.length
      : null;

  const cols = hasRating ? 3 : 2;

  return (
    <SimpleGrid cols={cols} mb="md">
      <StatCard label={`最高${valueLabel}`} value={formatValue(maxValue, gameType)} />
      <StatCard label={`平均${valueLabel}`} value={formatValue(avgValue, gameType)} />
      {hasRating && (
        <StatCard
          label="平均RT"
          value={avgRating != null ? avgRating.toFixed(2) : "-"}
        />
      )}
    </SimpleGrid>
  );
}
