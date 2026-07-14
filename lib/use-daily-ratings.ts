"use client";

import useSWR from "swr";
import { useApiClient } from "./api-client";
import { useAuth } from "./auth-context";
import { buildStatsQuery, type StatsRange } from "./use-summary-stats";
import type { DailyRating, GameType } from "@/types/record";

export function useDailyRatings(gameType: GameType, range?: StatsRange, enabled = true) {
  const { request } = useApiClient();
  const { isAuthenticated } = useAuth();

  const key = `/api/stats/ratings?${buildStatsQuery(gameType, range)}`;

  const { data, error, isLoading } = useSWR<DailyRating[]>(
    enabled && isAuthenticated ? key : null,
    (path: string) => request<DailyRating[]>(path),
  );

  return {
    dailyRatings: data ?? [],
    error,
    isLoading,
  };
}
