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

/** 統計の集計対象期間(任意)。from/toは "YYYY-MM-DD"。未指定なら全期間。 */
export interface StatsRange {
  from?: string | null;
  to?: string | null;
}

/** game_type とオプションの期間から統計APIのクエリ文字列を組み立てる。 */
export function buildStatsQuery(gameType: GameType, range?: StatsRange): string {
  const params = new URLSearchParams({ game_type: gameType });
  if (range?.from) params.set("from", range.from);
  if (range?.to) params.set("to", range.to);
  return params.toString();
}

export function useSummaryStats(gameType: GameType, range?: StatsRange) {
  const { request } = useApiClient();
  const { isAuthenticated } = useAuth();

  const key = `/api/stats/summary?${buildStatsQuery(gameType, range)}`;

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
