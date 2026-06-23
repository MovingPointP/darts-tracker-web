"use client";

import { useState } from "react";
import {
  Alert,
  Center,
  Container,
  Group,
  Modal,
  Pagination,
  Select,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { RequireAuth } from "@/components/RequireAuth";
import { RecordTable } from "@/components/RecordTable";
import { RecordForm, type RecordFormValues } from "@/components/RecordForm";
import { useGameRecords } from "@/lib/use-game-records";
import { fromApiDate, toApiDate } from "@/lib/date";
import { GAME_TYPE_LABELS, type GameRecord, type GameType } from "@/types/record";

const FILTER_OPTIONS = [
  { value: "all", label: "全種目" },
  { value: "01game", label: GAME_TYPE_LABELS["01game"] },
  { value: "cricket", label: GAME_TYPE_LABELS.cricket },
  { value: "countup", label: GAME_TYPE_LABELS.countup },
];

const PAGE_SIZE = 20;

export default function RecordsPage() {
  return (
    <RequireAuth>
      <RecordsList />
    </RequireAuth>
  );
}

function RecordsList() {
  const [filter, setFilter] = useState<string>("all");
  const gameType = filter === "all" ? undefined : (filter as GameType);
  const { records, isLoading, updateRecord, deleteRecord } = useGameRecords(gameType);

  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);
  const [rangeStart, rangeEnd] = dateRange;
  const filteredRecords = records.filter((r) => {
    const playedDate = fromApiDate(r.played_at);
    if (rangeStart && playedDate < rangeStart) return false;
    if (rangeEnd && playedDate > rangeEnd) return false;
    return true;
  });

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  // 削除等でページ数が減った場合に、表示中のページが範囲外にならないようクランプする
  const safePage = Math.min(page, Math.max(totalPages, 1));
  const pageRecords = filteredRecords.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const handleFilterChange = (value: string | null) => {
    setFilter(value ?? "all");
    setPage(1);
  };

  const handleDateRangeChange = (value: [string | null, string | null]) => {
    setDateRange(value);
    setPage(1);
  };

  const [editing, setEditing] = useState<GameRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdate = async (values: RecordFormValues) => {
    if (!editing) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await updateRecord(editing.id, {
        value: values.value,
        played_at: toApiDate(values.played_at),
      });
      setEditing(null);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "記録の更新に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: GameRecord) => {
    if (!window.confirm("この記録を削除しますか？")) return;
    try {
      await deleteRecord(record.id);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "記録の削除に失敗しました");
    }
  };

  return (
    <Container size="md">
      <Group justify="space-between" mb="md" wrap="wrap">
        <Title order={2}>記録一覧</Title>
        <Group wrap="wrap">
          <DatePickerInput
            type="range"
            placeholder="期間で絞り込み"
            value={dateRange}
            onChange={handleDateRangeChange}
            valueFormat="YYYY-MM-DD"
            clearable
            w={260}
          />
          <Select
            data={FILTER_OPTIONS}
            value={filter}
            onChange={handleFilterChange}
            w={200}
            allowDeselect={false}
          />
        </Group>
      </Group>

      {errorMessage && (
        <Alert color="red" mb="md" onClose={() => setErrorMessage(null)} withCloseButton>
          {errorMessage}
        </Alert>
      )}

      {!isLoading && (
        <>
          <RecordTable records={pageRecords} onEdit={setEditing} onDelete={handleDelete} />
          {totalPages > 1 && (
            <Center mt="md">
              <Pagination total={totalPages} value={safePage} onChange={setPage} />
            </Center>
          )}
        </>
      )}

      <Modal opened={editing !== null} onClose={() => setEditing(null)} title="記録を編集">
        {editing && (
          <RecordForm
            initialValues={{
              game_type: editing.game_type,
              value: editing.value,
              played_at: fromApiDate(editing.played_at),
            }}
            lockGameType
            submitLabel="更新する"
            submitting={submitting}
            onSubmit={handleUpdate}
          />
        )}
      </Modal>
    </Container>
  );
}
