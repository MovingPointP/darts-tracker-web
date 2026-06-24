"use client";

import useSWR from "swr";
import { useApiClient } from "./api-client";
import { useAuth } from "./auth-context";
import type { DailyRating, GameType } from "@/types/record";

export function useDailyRatings(gameType: GameType) {
  const { request } = useApiClient();
  const { isAuthenticated } = useAuth();

  const key = `/api/stats/ratings?game_type=${gameType}`;

  const { data, error, isLoading } = useSWR<DailyRating[]>(
    isAuthenticated ? key : null,
    (path: string) => request<DailyRating[]>(path),
  );

  return {
    dailyRatings: data ?? [],
    error,
    isLoading,
  };
}
