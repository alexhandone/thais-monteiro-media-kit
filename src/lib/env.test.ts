import { afterEach, describe, expect, it } from "vitest";

import { getServerEnv } from "./env";

const originalEnv = process.env;

function setValidEnv(overrides: NodeJS.ProcessEnv = {}) {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
    META_INSTAGRAM_ACCOUNT_ID: "17841401176856797",
    META_PAGE_ID: "1039563395904662",
    META_ACCESS_TOKEN: "meta-token",
    METRICS_REFRESH_SECRET: "123456789012345678901234",
    TOKEN_HASH_SECRET: "12345678901234567890123456789012",
    NEXT_PUBLIC_WHATSAPP_URL: "https://wa.me/5511953583354",
    NEXT_PUBLIC_INSTAGRAM_URL: "https://www.instagram.com/thais.msilva",
    NEXT_PUBLIC_CONTACT_EMAIL: "thaismonteiro2806@outlook.com",
    ...overrides,
  };
}

afterEach(() => {
  process.env = originalEnv;
});

describe("getServerEnv", () => {
  it("returns validated server environment with the default Meta API version", () => {
    setValidEnv({ META_GRAPH_API_VERSION: undefined });

    expect(getServerEnv()).toMatchObject({
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      META_GRAPH_API_VERSION: "v25.0",
      NEXT_PUBLIC_CONTACT_EMAIL: "thaismonteiro2806@outlook.com",
    });
  });

  it("rejects short secrets", () => {
    setValidEnv({ TOKEN_HASH_SECRET: "too-short" });

    expect(() => getServerEnv()).toThrow();
  });
});
