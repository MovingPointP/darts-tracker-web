"use client";

import { Container, Stack, Title } from "@mantine/core";
import { RequireAuth } from "@/components/RequireAuth";
import { RatingChart } from "@/components/RatingChart";
import { useDailyRatings } from "@/lib/use-daily-ratings";

export default function StatsPage() {
  return (
    <RequireAuth>
      <StatsContent />
    </RequireAuth>
  );
}

function StatsContent() {
  const { dailyRatings: ratings01 } = useDailyRatings("01game");
  const { dailyRatings: ratingsCricket } = useDailyRatings("cricket");

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
          <RatingChart dailyRatings={ratings01} seriesName="01Gameレーティング" color="orange.6" />
        </div>
        <div>
          <Title order={4} mb="sm">
            クリケット
          </Title>
          <RatingChart dailyRatings={ratingsCricket} seriesName="クリケットレーティング" color="teal.6" />
        </div>
      </Stack>
    </Container>
  );
}
