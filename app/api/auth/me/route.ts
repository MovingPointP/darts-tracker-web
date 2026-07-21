import { proxyAuthenticated } from "@/lib/server/proxy-authenticated";

export async function GET() {
  return proxyAuthenticated("/api/v1/auth/me");
}
