import type { NextRequest } from "next/server";
import { proxyAuthenticated } from "@/lib/server/proxy-authenticated";

export async function GET(request: NextRequest) {
  return proxyAuthenticated(`/api/v1/stats/ratings${request.nextUrl.search}`);
}
