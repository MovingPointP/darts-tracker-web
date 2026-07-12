"use client";

import { Fragment } from "react";
import { ActionIcon, Badge, Group, Table, Text, Tooltip } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { VALUE_COLUMN_LABELS, type Award, type GameRecord, type GameType } from "@/types/record";
import { AWARD_ICONS } from "@/lib/award-icons";
import { fromApiDate } from "@/lib/date";

interface RecordTableProps {
  records: GameRecord[];
  gameType: GameType;
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

function AwardIcons({ awards }: { awards: Record<string, number> }) {
  return (
    <Group gap="sm" wrap="wrap">
      {Object.entries(awards).map(([award, count]) => {
        const AwardIcon = AWARD_ICONS[award as Award];
        if (!AwardIcon) return null;
        return (
          <Tooltip key={award} label={count > 1 ? `${award} ×${count}` : award} withArrow>
            <Group gap={2} wrap="nowrap" align="center">
              <AwardIcon size={18} color="var(--mantine-color-teal-4)" />
              {count > 1 && (
                <Text size="xs" c="dimmed" fw={600}>
                  ×{count}
                </Text>
              )}
            </Group>
          </Tooltip>
        );
      })}
    </Group>
  );
}

const ROW_HEIGHT = 50;
const ROW_HEIGHT_MOBILE = 38;

export function RecordTable({ records, gameType, onEdit, onDelete, minRows }: RecordTableProps) {
  const isMobile = useMediaQuery("(max-width: 48em)");
  const rowHeight = { base: ROW_HEIGHT_MOBILE, sm: ROW_HEIGHT };
  const iconSize = isMobile ? "sm" : "md";
  const badgeSize = isMobile ? "sm" : "md";
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
      striped={!isMobile}
      highlightOnHover={!isMobile}
      verticalSpacing={isMobile ? 2 : "xs"}
      horizontalSpacing={isMobile ? 6 : undefined}
      style={{ tableLayout: "fixed", width: "100%" }}
    >
      <Table.Thead>
        <Table.Tr style={{ borderBottom: "2px solid var(--mantine-color-teal-8)" }}>
          <Table.Th ta="center" fz={{ base: "xs", sm: "sm" }} w={{ base: 88, sm: 140 }}>日付</Table.Th>
          <Table.Th ta="center" fz={{ base: "xs", sm: "sm" }} w={{ base: 60, sm: 110 }}>{VALUE_COLUMN_LABELS[gameType]}</Table.Th>
          <Table.Th ta="center" fz={{ base: "xs", sm: "sm" }} w={{ base: 64, sm: 120 }}>RT</Table.Th>
          <Table.Th fz="sm" visibleFrom="sm">アワード</Table.Th>
          <Table.Th w={{ base: 60, sm: 90 }} />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {records.map((record) => {
          const hasAwards = record.awards && Object.keys(record.awards).length > 0;
          return (
            <Fragment key={record.id}>
              <Table.Tr h={rowHeight} style={isMobile && hasAwards ? { borderBottom: "none" } : undefined}>
                <Table.Td ta="center">
                  <Text size="sm">{fromApiDate(record.played_at)}</Text>
                </Table.Td>
                <Table.Td ta="center">
                  <Text size="sm" fw={600}>{record.value.toFixed(2)}</Text>
                </Table.Td>
                <Table.Td ta="center">
                  {record.rating !== null ? (
                    <Badge color={ratingColor(record.rating)} variant="light" size={badgeSize} radius="sm" w={{ base: 52, sm: 64 }} style={{ textAlign: "center" }}>
                      {record.rating.toFixed(2)}
                    </Badge>
                  ) : (
                    <Text size="sm" c="dimmed">—</Text>
                  )}
                </Table.Td>
                <Table.Td visibleFrom="sm">
                  {hasAwards && <AwardIcons awards={record.awards} />}
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
              {isMobile && hasAwards && (
                <Table.Tr hiddenFrom="sm">
                  <Table.Td colSpan={5} pt={0} pb="sm">
                    <AwardIcons awards={record.awards} />
                  </Table.Td>
                </Table.Tr>
              )}
            </Fragment>
          );
        })}
        {Array.from({ length: emptyRowCount }).map((_, i) => (
          <Table.Tr key={`empty-${i}`} h={rowHeight} style={{ visibility: "hidden" }}>
            <Table.Td colSpan={5} />
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
