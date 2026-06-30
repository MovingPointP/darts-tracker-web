"use client";

import { ActionIcon, Badge, Group, Table, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
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
const ROW_HEIGHT_MOBILE = 38;

export function RecordTable({ records, onEdit, onDelete, minRows }: RecordTableProps) {
  const isMobile = useMediaQuery("(max-width: 48em)");
  const rowHeight = isMobile ? ROW_HEIGHT_MOBILE : ROW_HEIGHT;
  const iconSize = isMobile ? "sm" : "md";
  const badgeSize = isMobile ? "sm" : "md";
  const headerFz = isMobile ? "xs" : "sm";
  const emptyRowCount = minRows ? Math.max(0, minRows - records.length) : 0;

  if (records.length === 0 && emptyRowCount === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        記録がまだありません
      </Text>
    );
  }

  return (
    <Table
      striped
      highlightOnHover
      verticalSpacing={isMobile ? 2 : "xs"}
      horizontalSpacing={isMobile ? 6 : undefined}
      style={{ tableLayout: "fixed" }}
    >
      <colgroup>
        <col style={{ width: isMobile ? "92px" : "140px" }} />
        <col style={{ width: isMobile ? "68px" : "110px" }} />
        <col style={{ width: isMobile ? "66px" : "120px" }} />
        <col />
      </colgroup>
      <Table.Thead>
        <Table.Tr style={{ borderBottom: "2px solid var(--mantine-color-teal-8)" }}>
          <Table.Th ta="center" fz={headerFz}>日付</Table.Th>
          <Table.Th ta="center" fz={headerFz}>値</Table.Th>
          <Table.Th ta="center" fz={headerFz}>RT</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {records.map((record) => (
          <Table.Tr key={record.id} style={{ height: rowHeight }}>
            <Table.Td ta="center">
              <Text size="sm">{fromApiDate(record.played_at)}</Text>
            </Table.Td>
            <Table.Td ta="center">
              <Text size="sm" fw={600}>{record.value.toFixed(2)}</Text>
            </Table.Td>
            <Table.Td ta="center">
              {record.rating !== null ? (
                <Badge color={ratingColor(record.rating)} variant="light" size={badgeSize} radius="sm" w={52} style={{ textAlign: "center" }}>
                  {record.rating.toFixed(2)}
                </Badge>
              ) : (
                <Text size="sm" c="dimmed">—</Text>
              )}
            </Table.Td>
            <Table.Td>
              <Group gap={2} justify="flex-end" wrap="nowrap">
                <ActionIcon variant="subtle" color="gray" size={iconSize} onClick={() => onEdit(record)}>
                  <IconPencil size={isMobile ? 12 : 14} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="red" size={iconSize} onClick={() => onDelete(record)}>
                  <IconTrash size={isMobile ? 12 : 14} />
                </ActionIcon>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
        {Array.from({ length: emptyRowCount }).map((_, i) => (
          <Table.Tr key={`empty-${i}`} style={{ visibility: "hidden", height: rowHeight }}>
            <Table.Td colSpan={4} />
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
