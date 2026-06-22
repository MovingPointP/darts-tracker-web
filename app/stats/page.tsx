"use client";

import { Container, Stack, Title } from "@mantine/core";
import { RequireAuth } from "@/components/RequireAuth";
import { RatingChart } from "@/components/RatingChart";
import { useGameRecords } from "@/lib/use-game-records";

export default function StatsPage() {
  return (
    <RequireAuth>
      <StatsContent />
    </RequireAuth>
  );
}

function StatsContent() {
  const { records: gameRecords01 } = useGameRecords("01game");
  const { records: cricketRecords } = useGameRecords("cricket");

  return (
    <Container size="md">
      <Title order={2} mb="md">
        レーティング推移
      </Title>
      <Stack gap="xl">
        <div>
          <Title order={4} mb="sm">
            01Game
          </Title>
          <RatingChart records={gameRecords01} seriesName="01Gameレーティング" color="indigo.6" />
        </div>
        <div>
          <Title order={4} mb="sm">
            クリケット
          </Title>
          <RatingChart records={cricketRecords} seriesName="クリケットレーティング" color="teal.6" />
        </div>
      </Stack>
    </Container>
  );
}
