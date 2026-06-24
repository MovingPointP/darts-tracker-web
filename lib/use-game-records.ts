"use client";

import useSWR from "swr";
import { useApiClient } from "./api-client";
import { useAuth } from "./auth-context";
import type {
  CreateGameRecordInput,
  GameType,
  PagedRecords,
  UpdateGameRecordInput,
} from "@/types/record";

export interface RecordsFilter {
  gameType?: GameType;
  from?: string | null;
  to?: string | null;
  page?: number;
  pageSize?: number;
}

export function useGameRecords(filter: RecordsFilter = {}) {
  const { gameType, from, to, page = 1, pageSize = 20 } = filter;
  const { request } = useApiClient();
  const { isAuthenticated } = useAuth();

  const params = new URLSearchParams();
  if (gameType) params.set("game_type", gameType);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  params.set("limit", String(pageSize));
  params.set("offset", String((page - 1) * pageSize));

  const key = `/api/records?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<PagedRecords>(
    isAuthenticated ? key : null,
    (path: string) => request<PagedRecords>(path),
  );

  const createRecord = async (input: CreateGameRecordInput) => {
    await request("/api/records", {
      method: "POST",
      body: JSON.stringify(input),
    });
    await mutate();
  };

  const updateRecord = async (id: number, input: UpdateGameRecordInput) => {
    await request(`/api/records/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    await mutate();
  };

  const deleteRecord = async (id: number) => {
    await request(`/api/records/${id}`, { method: "DELETE" });
    await mutate();
  };

  return {
    records: data?.records ?? [],
    total: data?.total ?? 0,
    error,
    isLoading,
    createRecord,
    updateRecord,
    deleteRecord,
    mutate,
  };
}
