"use client";

const ACCESS_TOKEN_KEY = "darts_access_token";
const REFRESH_TOKEN_KEY = "darts_refresh_token";

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

export function getAccessTokenSnapshot(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getServerSnapshot(): string | null {
  return null;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setSession(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  emitChange();
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  emitChange();
}
