import crypto from "node:crypto";

import { getServerEnv } from "./env";
import { createServiceRoleSupabaseClient } from "./supabase/server";

export const adminSessionCookieName = "thais_admin_session";
const sessionTtlMs = 1000 * 60 * 60 * 24 * 7;
const passwordIterations = 210_000;
const passwordKeyLength = 32;

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AdminSessionRow = {
  id: string;
  expires_at: string;
  admin_users: (AdminUser & { active: boolean }) | Array<AdminUser & { active: boolean }>;
};

export function hashAdminPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(
    password,
    salt,
    passwordIterations,
    passwordKeyLength,
    "sha256",
  );

  return `pbkdf2_sha256:${passwordIterations}:${salt.toString("base64url")}:${hash.toString("base64url")}`;
}

export function verifyAdminPassword(password: string, storedHash: string) {
  const [algorithm, iterations, salt, hash] = storedHash.split(":");

  if (algorithm !== "pbkdf2_sha256" || !iterations || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "base64url");
  const actual = crypto.pbkdf2Sync(
    password,
    Buffer.from(salt, "base64url"),
    Number(iterations),
    expected.length,
    "sha256",
  );

  return (
    expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
  );
}

export function createAdminSessionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashAdminSessionToken(rawToken: string, secret: string) {
  return crypto.createHash("sha256").update(`${secret}:${rawToken}`).digest("hex");
}

export function createAdminSessionExpiration(now = new Date()) {
  return new Date(now.getTime() + sessionTtlMs);
}

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export async function getAdminUserFromRequest(
  request: Request,
): Promise<AdminUser | null> {
  const rawToken = getCookieValue(
    request.headers.get("cookie"),
    adminSessionCookieName,
  );

  if (!rawToken) {
    return null;
  }

  const env = getServerEnv();
  const tokenHash = hashAdminSessionToken(rawToken, env.TOKEN_HASH_SECRET);
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("admin_sessions")
    .select("id, expires_at, admin_users(id, name, email, role, active)")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const session = data as unknown as AdminSessionRow;
  const adminUser = Array.isArray(session.admin_users)
    ? session.admin_users[0]
    : session.admin_users;

  if (
    new Date(session.expires_at).getTime() <= Date.now() ||
    !adminUser?.active
  ) {
    return null;
  }

  await supabase
    .from("admin_sessions")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", session.id);

  return {
    id: adminUser.id,
    name: adminUser.name,
    email: adminUser.email,
    role: adminUser.role,
  };
}

export async function isAuthorizedAdminApiRequest(request: Request) {
  const env = getServerEnv();
  const authorization = request.headers.get("authorization");

  if (authorization === `Bearer ${env.METRICS_REFRESH_SECRET}`) {
    return true;
  }

  return Boolean(await getAdminUserFromRequest(request));
}
