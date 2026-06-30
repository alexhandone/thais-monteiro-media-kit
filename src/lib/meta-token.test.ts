import { describe, expect, it } from "vitest";

import {
  decryptMetaAccessToken,
  encryptMetaAccessToken,
  maskMetaAccessToken,
  resolveMetaAccessToken,
} from "./meta-token";

const secret = "12345678901234567890123456789012";

describe("Meta access token helpers", () => {
  it("encrypts and decrypts a Meta access token", () => {
    const encrypted = encryptMetaAccessToken("EAAB-real-token", secret);

    expect(encrypted).not.toContain("EAAB-real-token");
    expect(decryptMetaAccessToken(encrypted, secret)).toBe("EAAB-real-token");
  });

  it("prefers the encrypted admin token over the environment fallback", () => {
    const encrypted = encryptMetaAccessToken("EAAB-admin-token", secret);

    expect(resolveMetaAccessToken(encrypted, "EAAB-env-token", secret)).toBe(
      "EAAB-admin-token",
    );
  });

  it("uses the environment token when no admin token is saved", () => {
    expect(resolveMetaAccessToken(null, "EAAB-env-token", secret)).toBe(
      "EAAB-env-token",
    );
  });

  it("masks tokens without exposing their full value", () => {
    expect(maskMetaAccessToken("EAAB1234567890TOKEN")).toBe("EAAB...OKEN");
    expect(maskMetaAccessToken("short")).toBe("*****");
  });
});
