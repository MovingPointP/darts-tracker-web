"use client";

import useSWR from "swr";
import { useApiClient } from "./api-client";
import { useAuth } from "./auth-context";
import type { GameType } from "@/types/record";

export interface GameSummary {
  total_games: number;
  best_value: number | null;
  best_rating: number | null;
  awards: Record<string, number>;
}

export function useSummaryStats(gameType: GameType) {
  const { request } = useApiClient();
  const { isAuthenticated } = useAuth();

  const key = `/api/stats/summary?game_type=${gameType}`;

  const { data, error, isLoading } = useSWR<GameSummary>(
    isAuthenticated ? key : null,
    (path: string) => request<GameSummary>(path),
  );

  return {
    summary: data ?? { total_games: 0, best_value: null, best_rating: null, awards: {} },
    error,
    isLoading,
  };
}
