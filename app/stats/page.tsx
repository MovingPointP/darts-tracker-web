"use client";

import { Alert, Badge, Center, Container, Loader, Paper, Stack, Table, Tabs, Text, Title } from "@mantine/core";
import { useDocumentTitle, useMediaQuery } from "@mantine/hooks";
import { RequireAuth } from "@/components/RequireAuth";
import { RatingChart } from "@/components/RatingChart";
import { useDailyRatings } from "@/lib/use-daily-ratings";
import { useSummaryStats } from "@/lib/use-summary-stats";
import { AWARDS_BY_GAME_TYPE, GAME_TYPE_LABELS, VALUE_COLUMN_LABELS, type GameType } from "@/types/record";

export default function StatsPage() {
  return (
    <RequireAuth>
      <StatsContent />
    </RequireAuth>
  );
}

const GAME_TYPES: GameType[] = ["01game", "cricket", "countup"];
const HAS_RATING: Record<GameType, boolean> = { "01game": true, cricket: true, countup: false };

function GameTypePanel({ gameType }: { gameType: GameType }) {
  const isMobile = useMediaQuery("(max-width: 48em)");
  const { summary, isLoading: isSummaryLoading, error: summaryError } = useSummaryStats(gameType);
  const { dailyRatings, isLoading: isRatingLoading, error: ratingError } = useDailyRatings(gameType);

  const isLoading = isSummaryLoading || (HAS_RATING[gameType] && isRatingLoading);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (summaryError || (HAS_RATING[gameType] && ratingError)) {
    return (
      <Alert color="red" my="md">
        データの取得に失敗しました
      </Alert>
    );
  }

  const orderedAwards = AWARDS_BY_GAME_TYPE[gameType];

  return (
    <Stack gap={isMobile ? "md" : "xl"} pt="md">
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${HAS_RATING[gameType] ? 3 : 2}, 1fr)`, gap: "var(--mantine-spacing-md)" }}>
        <Paper p="md" radius="md" withBorder style={{ borderColor: "var(--mantine-color-dark-5)" }}>
          <Text size="xs" c="dimmed" mb={4}>総ゲーム数</Text>
          <Text size={isMobile ? "xl" : "2rem"} fw={700} c="teal.4">
            {summary.total_games}
          </Text>
        </Paper>
        <Paper p="md" radius="md" withBorder style={{ borderColor: "var(--mantine-color-dark-5)" }}>
          <Text size="xs" c="dimmed" mb={4}>{`最高${VALUE_COLUMN_LABELS[gameType]}`}</Text>
          <Text size={isMobile ? "xl" : "2rem"} fw={700} c="teal.4">
            {summary.best_value != null ? summary.best_value.toFixed(2) : "—"}
          </Text>
        </Paper>
        {HAS_RATING[gameType] && (
          <Paper p="md" radius="md" withBorder style={{ borderColor: "var(--mantine-color-dark-5)" }}>
            <Text size="xs" c="dimmed" mb={4}>最高レーティング</Text>
            <Text size={isMobile ? "xl" : "2rem"} fw={700} c="teal.4">
              {summary.best_rating != null ? summary.best_rating.toFixed(2) : "—"}
            </Text>
          </Paper>
        )}
      </div>

      <div>
        <Text fw={500} mb="xs" size={isMobile ? "sm" : undefined}>アワード獲得回数</Text>
        <Table striped highlightOnHover style={{ tableLayout: "fixed" }}>
          <Table.Thead>
            <Table.Tr style={{ borderBottom: "2px solid var(--mantine-color-teal-8)" }}>
              <Table.Th fz={{ base: "xs", sm: "sm" }}>アワード</Table.Th>
              <Table.Th fz={{ base: "xs", sm: "sm" }} ta="right" w={80}>回数</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {orderedAwards.map((award) => (
              <Table.Tr key={award}>
                <Table.Td>
                  <Badge size="sm" variant="outline" color="teal" radius="sm">{award}</Badge>
                </Table.Td>
                <Table.Td ta="right" fw={600} fz={{ base: "xs", sm: "sm" }} c={summary.awards?.[award] ? undefined : "dimmed"}>
                  {summary.awards?.[award] ?? 0}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      {HAS_RATING[gameType] && (
        <div>
          <Text fw={500} mb="xs" size={isMobile ? "sm" : undefined}>レーティング推移</Text>
          <RatingChart
            dailyRatings={dailyRatings}
            seriesName={`${GAME_TYPE_LABELS[gameType]}レーティング`}
            color="orange.8"
          />
        </div>
      )}
    </Stack>
  );
}

function StatsContent() {
  useDocumentTitle("成績サマリー | DARTS TRACKER");
  const isMobile = useMediaQuery("(max-width: 48em)");

  return (
    <Container size="md">
      <Title order={2} size={isMobile ? "h6" : undefined} mb={{ base: "sm", sm: "md" }}>
        成績サマリー
      </Title>
      <Tabs defaultValue="01game">
        <Tabs.List>
          {GAME_TYPES.map((gt) => (
            <Tabs.Tab key={gt} value={gt} fz={{ base: "xs", sm: "sm" }} py={{ base: 6, sm: "xs" }}>
              {GAME_TYPE_LABELS[gt]}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {GAME_TYPES.map((gt) => (
          <Tabs.Panel key={gt} value={gt}>
            <GameTypePanel gameType={gt} />
          </Tabs.Panel>
        ))}
      </Tabs>
    </Container>
  );
}
