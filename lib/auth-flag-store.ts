"use client";

// 実トークンはhttpOnly Cookieで管理しJSからは触れられない。ここではUIルーティング用の
// 「ログイン済みか」という機密性のないフラグのみを保持する。このフラグが改ざんされても、
// 実際の認可は毎回サーバー側でhttpOnly Cookieを検証するためAPIへの不正アクセスはできない。
const FLAG_KEY = "darts_is_authenticated";

type Listener = () => void;
let listeners: Listener[] = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

/** useSyncExternalStore用のsubscribe関数。 */
export function subscribe(listener: Listener) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getFlagSnapshot(): boolean {
  // useSyncExternalStoreの契約上getSnapshotはクライアントでのみ呼ばれるはずだが、
  // 念のためサーバー環境での実行に備えて防御しておく。
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem(FLAG_KEY) === "1";
}

export function getServerSnapshot(): boolean {
  return false;
}

export function setAuthenticatedFlag() {
  localStorage.setItem(FLAG_KEY, "1");
  emitChange();
}

export function clearAuthenticatedFlag() {
  localStorage.removeItem(FLAG_KEY);
  emitChange();
}
