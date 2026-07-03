"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Modal,
  Pagination,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDocumentTitle, useMediaQuery } from "@mantine/hooks";
import { RequireAuth } from "@/components/RequireAuth";
import { RecordsChart } from "@/components/RecordsChart";
import { RecordTable } from "@/components/RecordTable";
import { RecordForm, type RecordFormValues } from "@/components/RecordForm";
import { useGameRecords } from "@/lib/use-game-records";
import { fromApiDate, toApiDate } from "@/lib/date";
import { GAME_TYPE_LABELS, type GameRecord, type GameType } from "@/types/record";
import { SummaryStats } from "@/components/SummaryStats";

const TAB_ITEMS: { value: GameType; label: string }[] = [
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
  useDocumentTitle("記録一覧 | DARTS TRACKER");
  const isMobile = useMediaQuery("(max-width: 48em)");
  const [gameType, setGameType] = useState<GameType>("01game");
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);
  const [page, setPage] = useState(1);
  const [rangeStart, rangeEnd] = dateRange;
  const { records, total, isLoading, error, updateRecord, deleteRecord } = useGameRecords({
    gameType,
    from: rangeStart,
    to: rangeEnd,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // 削除等でtotalPagesが減少した際に、現在のpageが範囲外になる場合は最終ページに戻す
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [totalPages, page]);

  const handleFilterChange = (value: string | null) => {
    const next = TAB_ITEMS.find((t) => t.value === value)?.value ?? "01game";
    setGameType(next);
    setPage(1);
  };

  const handleDateRangeChange = (value: [string | null, string | null]) => {
    setDateRange(value);
    setPage(1);
  };

  const [editing, setEditing] = useState<GameRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<GameRecord | null>(null);

  const handleModalClose = () => {
    setEditing(null);
    setUpdateError(null);
  };

  const handleUpdate = async (values: RecordFormValues) => {
    if (!editing) return;
    setSubmitting(true);
    setUpdateError(null);
    try {
      await updateRecord(editing.id, {
        value: values.value,
        played_at: toApiDate(values.played_at),
      });
      handleModalClose();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "記録の更新に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (record: GameRecord) => {
    setPendingDelete(record);
  };

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    try {
      await deleteRecord(pendingDelete.id);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "記録の削除に失敗しました");
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <Container size="md">
      <Group justify="space-between" gap={isMobile ? 4 : undefined} mb="sm" wrap="wrap">
        <Group gap={isMobile ? 4 : "xs"} align="center" wrap="nowrap">
          <Title order={2} size={isMobile ? "h6" : undefined}>記録一覧</Title>
          {total > 0 && (
            <Badge color="teal" variant="light" size={isMobile ? "sm" : "md"} radius="sm">
              {total}件
            </Badge>
          )}
        </Group>
        <DatePickerInput
          type="range"
          placeholder="期間で絞り込み"
          value={dateRange}
          onChange={handleDateRangeChange}
          valueFormat="YYYY-MM-DD"
          clearable
          size={isMobile ? "xs" : "sm"}
          w={{ base: 178, sm: 220 }}
          ml="auto"
        />
      </Group>

      <Tabs value={gameType} onChange={handleFilterChange} mb="md">
        <Tabs.List>
          {TAB_ITEMS.map((item) => (
            <Tabs.Tab key={item.value} value={item.value} fz={{ base: "xs", sm: "sm" }} py={{ base: 6, sm: "xs" }}>
              {item.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {error && (
        <Alert color="red" mb="md">
          データの取得に失敗しました
        </Alert>
      )}

      {deleteError && (
        <Alert color="red" mb="md" onClose={() => setDeleteError(null)} withCloseButton>
          {deleteError}
        </Alert>
      )}

      {isLoading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : (
        !error && (
          <>
            <SummaryStats records={records} gameType={gameType} />
            <RecordsChart records={records} />
            <RecordTable
              records={records}
              gameType={gameType}
              onEdit={setEditing}
              onDelete={handleDelete}
              minRows={PAGE_SIZE}
            />
            {totalPages > 1 && (
              <Center mt="md">
                <Pagination total={totalPages} value={page} onChange={setPage} size={isMobile ? "xs" : undefined} />
              </Center>
            )}
          </>
        )
      )}

      <Modal opened={editing !== null} onClose={handleModalClose} title="記録を編集" lockScroll={false}>
        {editing && (
          <>
            {updateError && (
              <Alert color="red" mb="md">
                {updateError}
              </Alert>
            )}
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
          </>
        )}
      </Modal>

      <Modal
        opened={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="記録を削除"
        lockScroll={false}
      >
        <Text mb="lg">この記録を削除しますか？この操作は元に戻せません。</Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={() => setPendingDelete(null)}>
            キャンセル
          </Button>
          <Button color="red" onClick={handleDeleteConfirm}>
            削除する
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}
