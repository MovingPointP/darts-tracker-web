import { proxyAuthenticated } from "@/lib/server/proxy-authenticated";

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/records/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.text();
  return proxyAuthenticated(`/api/v1/records/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/records/[id]">,
) {
  const { id } = await ctx.params;
  return proxyAuthenticated(`/api/v1/records/${id}`, { method: "DELETE" });
}
