import { getServerEnv } from "./env";

export function isAuthorizedAdminRequest(request: Request, secret?: string) {
  const authorization = request.headers.get("authorization");
  const adminSecret = secret ?? getServerEnv().METRICS_REFRESH_SECRET;

  return authorization === `Bearer ${adminSecret}`;
}
