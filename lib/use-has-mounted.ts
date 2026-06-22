"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * クライアントでのハイドレーション完了後にtrueを返すフック。
 * useSyncExternalStoreベースのため、token-store.tsの補正と同じ
 * タイミングで同期される(useEffect+setStateより確実)。
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
