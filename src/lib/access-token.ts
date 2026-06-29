import { createHash, randomBytes } from "node:crypto";

export function createRawAccessToken() {
  return randomBytes(32).toString("base64url");
}

export function hashAccessToken(rawToken: string, secret: string) {
  return createHash("sha256").update(`${secret}:${rawToken}`).digest("hex");
}

export function createTokenExpiration(now = new Date()) {
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt;
}
