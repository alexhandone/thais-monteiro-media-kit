import { getServerEnv } from "./env";

export function isAuthorizedMetricsRefresh(request: Request) {
  const env = getServerEnv();
  const authorization = request.headers.get("authorization");
  const allowedSecrets = [env.METRICS_REFRESH_SECRET, env.CRON_SECRET].filter(
    (secret): secret is string => Boolean(secret),
  );

  return allowedSecrets.some((secret) => authorization === `Bearer ${secret}`);
}
