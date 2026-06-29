import { describe, expect, it } from "vitest";

import {
  createRawAccessToken,
  createTokenExpiration,
  hashAccessToken,
} from "./access-token";

describe("access token helpers", () => {
  it("creates different long raw access tokens", () => {
    const firstToken = createRawAccessToken();
    const secondToken = createRawAccessToken();

    expect(firstToken).not.toBe(secondToken);
    expect(firstToken.length).toBeGreaterThanOrEqual(40);
    expect(secondToken.length).toBeGreaterThanOrEqual(40);
  });

  it("hashes raw access tokens deterministically per secret", () => {
    const rawToken = "raw-token";
    const firstSecret = "first-secret";
    const secondSecret = "second-secret";

    expect(hashAccessToken(rawToken, firstSecret)).toBe(
      hashAccessToken(rawToken, firstSecret),
    );
    expect(hashAccessToken(rawToken, firstSecret)).not.toBe(
      hashAccessToken(rawToken, secondSecret),
    );
  });

  it("creates an expiration exactly seven days after the given date", () => {
    const now = new Date("2026-06-26T12:00:00.000Z");

    expect(createTokenExpiration(now).toISOString()).toBe(
      "2026-07-03T12:00:00.000Z",
    );
  });
});
