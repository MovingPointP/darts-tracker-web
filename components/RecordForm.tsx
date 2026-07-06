"use client";

import { z } from "zod";
import { useForm, schemaResolver } from "@mantine/form";
import { Button, Group, NumberInput, Select, Stack, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { DatePickerInput } from "@mantine/dates";
import { todayLocalDate } from "@/lib/date";
import { AWARDS_BY_GAME_TYPE, GAME_TYPE_LABELS, type GameType } from "@/types/record";

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
    awards: z.record(z.string(), z.number().int().min(0)),
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
  awards: Record<string, number>;
}

const VALUE_LABELS: Record<GameType, string> = {
  "01game": "PPR(1ラウンド平均点)",
  cricket: "MPR(1ラウンド平均マーク数)",
  countup: "SCORE(合計得点)",
};

const GAME_TYPE_SELECT_DATA: { value: GameType; label: string }[] = [
  { value: "01game", label: GAME_TYPE_LABELS["01game"] },
  { value: "cricket", label: GAME_TYPE_LABELS.cricket },
  { value: "countup", label: GAME_TYPE_LABELS.countup },
];

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
  const isMobile = useMediaQuery("(max-width: 48em)");
  const fieldSize = isMobile ? "xs" : undefined;

  const form = useForm<RecordFormValues>({
    initialValues: initialValues ?? {
      game_type: "01game",
      value: 0,
      played_at: todayLocalDate(),
      awards: {},
    },
    validate: schemaResolver(schema, { sync: true }),
  });

  const availableAwards = AWARDS_BY_GAME_TYPE[form.values.game_type];

  const handleGameTypeChange = (value: string | null) => {
    const next = (value ?? "01game") as GameType;
    form.setValues({ game_type: next, awards: {} });
  };

  const handleAwardChange = (award: string, val: string | number) => {
    const count = typeof val === "number" ? Math.max(0, Math.floor(val)) : 0;
    form.setFieldValue("awards", { ...form.values.awards, [award]: count });
  };

  const handleSubmit = (values: RecordFormValues) => {
    const filtered = Object.fromEntries(
      Object.entries(values.awards).filter(([, count]) => count > 0)
    );
    onSubmit({ ...values, awards: filtered });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap={isMobile ? "sm" : undefined}>
        <Select
          label="種目"
          size={fieldSize}
          data={GAME_TYPE_SELECT_DATA}
          disabled={lockGameType}
          {...(lockGameType
            ? form.getInputProps("game_type")
            : { ...form.getInputProps("game_type"), onChange: handleGameTypeChange })}
        />
        <NumberInput
          label={VALUE_LABELS[form.values.game_type]}
          size={fieldSize}
          min={0}
          max={MAX_VALUES[form.values.game_type]}
          decimalScale={2}
          hideControls
          {...form.getInputProps("value")}
        />
        <DatePickerInput
          label="プレイ日"
          size={fieldSize}
          valueFormat="YYYY-MM-DD"
          {...form.getInputProps("played_at")}
        />
        <div>
          <Text size={fieldSize ?? "sm"} fw={500} mb={6}>
            アワード（任意）
          </Text>
          <Stack gap={4}>
            {availableAwards.map((award) => (
              <Group key={award} justify="space-between" align="center">
                <Text size={fieldSize ?? "sm"}>{award}</Text>
                <NumberInput
                  value={form.values.awards[award] ?? 0}
                  onChange={(val) => handleAwardChange(award, val)}
                  min={0}
                  max={20}
                  decimalScale={0}
                  size={fieldSize ?? "sm"}
                  w={90}
                />
              </Group>
            ))}
          </Stack>
        </div>
        <Button type="submit" size={fieldSize} loading={submitting}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
