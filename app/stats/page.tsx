"use client";

import { Alert, Center, Container, Loader, Stack, Title } from "@mantine/core";
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
  const { dailyRatings: ratings01, isLoading: isLoading01, error: error01 } = useDailyRatings("01game");
  const { dailyRatings: ratingsCricket, isLoading: isLoadingCricket, error: errorCricket } = useDailyRatings("cricket");

  if (isLoading01 || isLoadingCricket) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

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
          {error01 ? (
            <Alert color="red">データの取得に失敗しました</Alert>
          ) : (
            <RatingChart dailyRatings={ratings01} seriesName="01Gameレーティング" color="orange.8" />
          )}
        </div>
        <div>
          <Title order={4} mb="sm">
            クリケット
          </Title>
          {errorCricket ? (
            <Alert color="red">データの取得に失敗しました</Alert>
          ) : (
            <RatingChart dailyRatings={ratingsCricket} seriesName="クリケットレーティング" color="teal.7" />
          )}
        </div>
      </Stack>
    </Container>
  );
}
