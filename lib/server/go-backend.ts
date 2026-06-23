import "server-only";

const GO_API_BASE_URL = process.env.API_BASE_URL ?? "";

/** Goバックエンドへの中継fetch。サーバー側(Route Handler)からのみ呼び出す。 */
export function callGoBackend(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${GO_API_BASE_URL}${path}`, init);
}
