import { describe, expect, it } from "vitest";

import { isAuthorizedAdminRequest } from "./admin-auth";

function requestWithAuthorization(value: string | null) {
  return new Request("http://localhost/api/admin", {
    headers: value ? { authorization: value } : undefined,
  });
}

describe("isAuthorizedAdminRequest", () => {
  it("accepts the configured metrics refresh secret as an admin bearer token", () => {
    expect(
      isAuthorizedAdminRequest(
        requestWithAuthorization("Bearer 123456789012345678901234"),
        "123456789012345678901234",
      ),
    ).toBe(true);
  });

  it("rejects missing or invalid authorization", () => {
    expect(
      isAuthorizedAdminRequest(
        requestWithAuthorization(null),
        "123456789012345678901234",
      ),
    ).toBe(false);
    expect(
      isAuthorizedAdminRequest(
        requestWithAuthorization("Bearer wrong-secret"),
        "123456789012345678901234",
      ),
    ).toBe(false);
  });
});
