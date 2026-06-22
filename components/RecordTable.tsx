"use client";

import { Button, Group, Table, Text } from "@mantine/core";
import { GAME_TYPE_LABELS, type GameRecord } from "@/types/record";
import { fromApiDate } from "@/lib/date";

interface RecordTableProps {
  records: GameRecord[];
  onEdit: (record: GameRecord) => void;
  onDelete: (record: GameRecord) => void;
}

export function RecordTable({ records, onEdit, onDelete }: RecordTableProps) {
  if (records.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        記録がまだありません
      </Text>
    );
  }

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>日付</Table.Th>
          <Table.Th>種目</Table.Th>
          <Table.Th>値</Table.Th>
          <Table.Th>レーティング</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {records.map((record) => (
          <Table.Tr key={record.id}>
            <Table.Td>{fromApiDate(record.played_at)}</Table.Td>
            <Table.Td>{GAME_TYPE_LABELS[record.game_type]}</Table.Td>
            <Table.Td>{record.value.toFixed(2)}</Table.Td>
            <Table.Td>{record.rating !== null ? record.rating.toFixed(2) : "-"}</Table.Td>
            <Table.Td>
              <Group gap="xs" justify="flex-end">
                <Button variant="subtle" size="xs" onClick={() => onEdit(record)}>
                  編集
                </Button>
                <Button
                  variant="subtle"
                  size="xs"
                  color="red"
                  onClick={() => onDelete(record)}
                >
                  削除
                </Button>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
