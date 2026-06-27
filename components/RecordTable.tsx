"use client";

import { ActionIcon, Badge, Group, Table, Text } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import type { GameRecord } from "@/types/record";
import { fromApiDate } from "@/lib/date";

interface RecordTableProps {
  records: GameRecord[];
  onEdit: (record: GameRecord) => void;
  onDelete: (record: GameRecord) => void;
  minRows?: number;
}

function ratingColor(rating: number): string {
  if (rating >= 12) return "orange.8";
  if (rating >= 9) return "orange.9";
  if (rating >= 6) return "teal.7";
  return "teal.9";
}

const ROW_HEIGHT = 50;

export function RecordTable({ records, onEdit, onDelete, minRows }: RecordTableProps) {
  const emptyRowCount = minRows ? Math.max(0, minRows - records.length) : 0;

  if (records.length === 0 && emptyRowCount === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        記録がまだありません
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover verticalSpacing="xs" style={{ tableLayout: "fixed" }}>
      <colgroup>
        <col style={{ width: "140px" }} />
        <col style={{ width: "110px" }} />
        <col style={{ width: "120px" }} />
        <col />
      </colgroup>
      <Table.Thead>
        <Table.Tr style={{ borderBottom: "2px solid var(--mantine-color-teal-8)" }}>
          <Table.Th ta="center">日付</Table.Th>
          <Table.Th ta="center">値</Table.Th>
          <Table.Th ta="center">レーティング</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {records.map((record) => (
          <Table.Tr key={record.id} style={{ height: ROW_HEIGHT }}>
            <Table.Td ta="center">
              <Text size="md">{fromApiDate(record.played_at)}</Text>
            </Table.Td>
            <Table.Td ta="center">
              <Text size="md" fw={600}>{record.value.toFixed(2)}</Text>
            </Table.Td>
            <Table.Td ta="center">
              {record.rating !== null ? (
                <Badge color={ratingColor(record.rating)} variant="light" size="lg" radius="sm" w={64} style={{ textAlign: "center" }}>
                  {record.rating.toFixed(2)}
                </Badge>
              ) : (
                <Text size="md" c="dimmed">—</Text>
              )}
            </Table.Td>
            <Table.Td>
              <Group gap={4} justify="flex-end">
                <ActionIcon variant="subtle" color="gray" size="md" onClick={() => onEdit(record)}>
                  <IconPencil size={14} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="red" size="md" onClick={() => onDelete(record)}>
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
        {Array.from({ length: emptyRowCount }).map((_, i) => (
          <Table.Tr key={`empty-${i}`} style={{ visibility: "hidden", height: ROW_HEIGHT }}>
            <Table.Td colSpan={4} />
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
