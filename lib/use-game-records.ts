"use client";

import useSWR from "swr";
import { useApiClient } from "./api-client";
import { useAuth } from "./auth-context";
import type {
  CreateGameRecordInput,
  GameRecord,
  GameType,
  UpdateGameRecordInput,
} from "@/types/record";

export function useGameRecords(gameType?: GameType) {
  const { request } = useApiClient();
  const { isAuthenticated } = useAuth();

  const key = gameType
    ? `/api/v1/records?game_type=${gameType}`
    : "/api/v1/records";

  const { data, error, isLoading, mutate } = useSWR<GameRecord[]>(
    isAuthenticated ? key : null,
    (path: string) => request<GameRecord[]>(path),
  );

  const createRecord = async (input: CreateGameRecordInput) => {
    await request("/api/v1/records", {
      method: "POST",
      body: JSON.stringify(input),
    });
    await mutate();
  };

  const updateRecord = async (id: number, input: UpdateGameRecordInput) => {
    await request(`/api/v1/records/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    await mutate();
  };

  const deleteRecord = async (id: number) => {
    await request(`/api/v1/records/${id}`, { method: "DELETE" });
    await mutate();
  };

  return {
    records: data ?? [],
    error,
    isLoading,
    createRecord,
    updateRecord,
    deleteRecord,
    mutate,
  };
}
