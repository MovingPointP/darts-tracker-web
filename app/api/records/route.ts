import type { NextRequest } from "next/server";
import { proxyAuthenticated } from "@/lib/server/proxy-authenticated";

export async function GET(request: NextRequest) {
  return proxyAuthenticated(`/api/v1/records${request.nextUrl.search}`);
}

export async function POST(request: Request) {
  const body = await request.text();
  return proxyAuthenticated("/api/v1/records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
