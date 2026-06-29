export type RateLimitStore = Map<string, { count: number; resetAt: number }>;

export const LEAD_RATE_LIMIT_MAX_ATTEMPTS = 5;
export const LEAD_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export function getClientIp(headers: Headers) {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  if (forwardedFor) {
    return forwardedFor;
  }

  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkLeadRateLimit(
  ip: string,
  store: RateLimitStore,
  now = Date.now(),
) {
  const currentAttempt = store.get(ip);

  if (!currentAttempt || currentAttempt.resetAt <= now) {
    const resetAt = now + LEAD_RATE_LIMIT_WINDOW_MS;
    store.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: LEAD_RATE_LIMIT_MAX_ATTEMPTS - 1, resetAt };
  }

  if (currentAttempt.count >= LEAD_RATE_LIMIT_MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetAt: currentAttempt.resetAt };
  }

  currentAttempt.count += 1;
  store.set(ip, currentAttempt);

  return {
    allowed: true,
    remaining: LEAD_RATE_LIMIT_MAX_ATTEMPTS - currentAttempt.count,
    resetAt: currentAttempt.resetAt,
  };
}
