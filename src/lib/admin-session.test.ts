import { describe, expect, it } from "vitest";

import {
  createAdminSessionToken,
  hashAdminPassword,
  hashAdminSessionToken,
  verifyAdminPassword,
} from "./admin-session";

const secret = "12345678901234567890123456789012";

describe("admin session helpers", () => {
  it("hashes and verifies admin passwords", () => {
    const hash = hashAdminPassword("SenhaForte123!");

    expect(hash).not.toContain("SenhaForte123!");
    expect(verifyAdminPassword("SenhaForte123!", hash)).toBe(true);
    expect(verifyAdminPassword("senha-errada", hash)).toBe(false);
  });

  it("creates opaque session tokens and hashes them for storage", () => {
    const token = createAdminSessionToken();
    const hash = hashAdminSessionToken(token, secret);

    expect(token.length).toBeGreaterThan(40);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).toBe(hashAdminSessionToken(token, secret));
  });
});
