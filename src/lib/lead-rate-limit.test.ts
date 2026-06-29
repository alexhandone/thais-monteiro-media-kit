import { describe, expect, it } from "vitest";

import { checkLeadRateLimit, getClientIp } from "./lead-rate-limit";

describe("lead rate limit helpers", () => {
  it("extracts the first forwarded IP before falling back to real IP", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.1, 198.51.100.2",
      "x-real-ip": "198.51.100.3",
    });

    expect(getClientIp(headers)).toBe("203.0.113.1");
  });

  it("uses x-real-ip when no forwarded IP is present", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.3" });

    expect(getClientIp(headers)).toBe("198.51.100.3");
  });

  it("allows five attempts per hour and blocks the sixth", () => {
    const attempts = new Map();
    const now = Date.parse("2026-06-26T12:00:00.000Z");

    for (let index = 0; index < 5; index += 1) {
      expect(checkLeadRateLimit("203.0.113.1", attempts, now).allowed).toBe(
        true,
      );
    }

    expect(checkLeadRateLimit("203.0.113.1", attempts, now).allowed).toBe(
      false,
    );
  });

  it("resets attempts after one hour", () => {
    const attempts = new Map();
    const now = Date.parse("2026-06-26T12:00:00.000Z");

    for (let index = 0; index < 5; index += 1) {
      checkLeadRateLimit("203.0.113.1", attempts, now);
    }

    expect(
      checkLeadRateLimit("203.0.113.1", attempts, now + 60 * 60 * 1000 + 1)
        .allowed,
    ).toBe(true);
  });
});
