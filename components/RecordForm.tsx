"use client";

import { z } from "zod";
import { useForm, schemaResolver } from "@mantine/form";
import { Button, NumberInput, Select, Stack } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { GAME_TYPE_LABELS, type GameType } from "@/types/record";

// バックエンド(maxValueForGameType)と揃えた種目ごとの理論上の最大値
const MAX_VALUES: Record<GameType, number> = {
  "01game": 180, // 1ラウンド(3投)の最大点(トリプル20×3)
  cricket: 9, // 1ラウンド(3投)の最大マーク数(トリプル×3投)
  countup: 1440, // DARTSLIVE標準8ラウンド(24投)でのトリプル20連続
};

const schema = z
  .object({
    game_type: z.enum(["01game", "cricket", "countup"]),
    value: z.number({ error: "数値を入力してください" }),
    played_at: z.string().min(1, { error: "日付を選択してください" }),
  })
  .refine((data) => data.value <= MAX_VALUES[data.game_type], {
    error: (issue) =>
      `${MAX_VALUES[(issue.input as { game_type: GameType }).game_type]}以下で入力してください`,
    path: ["value"],
  });

export interface RecordFormValues {
  game_type: GameType;
  value: number;
  played_at: string;
}

const VALUE_LABELS: Record<GameType, string> = {
  "01game": "1ラウンド平均点(PPR)",
  cricket: "1ラウンド平均マーク数(MPR)",
  countup: "合計得点",
};

interface RecordFormProps {
  initialValues?: RecordFormValues;
  lockGameType?: boolean;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: RecordFormValues) => void | Promise<void>;
}

export function RecordForm({
  initialValues,
  lockGameType = false,
  submitLabel,
  submitting,
  onSubmit,
}: RecordFormProps) {
  const form = useForm<RecordFormValues>({
    initialValues: initialValues ?? {
      game_type: "01game",
      value: 0,
      played_at: new Date().toISOString().slice(0, 10),
    },
    validate: schemaResolver(schema, { sync: true }),
  });

  return (
    <form onSubmit={form.onSubmit((values) => onSubmit(values))}>
      <Stack>
        <Select
          label="種目"
          data={[
            { value: "01game", label: GAME_TYPE_LABELS["01game"] },
            { value: "cricket", label: GAME_TYPE_LABELS.cricket },
            { value: "countup", label: GAME_TYPE_LABELS.countup },
          ]}
          disabled={lockGameType}
          {...form.getInputProps("game_type")}
        />
        <NumberInput
          label={VALUE_LABELS[form.values.game_type]}
          min={0}
          max={MAX_VALUES[form.values.game_type]}
          decimalScale={2}
          hideControls
          {...form.getInputProps("value")}
        />
        <DatePickerInput
          label="プレイ日"
          valueFormat="YYYY-MM-DD"
          {...form.getInputProps("played_at")}
        />
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
