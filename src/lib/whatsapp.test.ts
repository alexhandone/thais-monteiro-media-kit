import { afterEach, describe, expect, it } from "vitest";

import { getWhatsAppHref } from "./whatsapp";

describe("getWhatsAppHref", () => {
  const originalUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_WHATSAPP_URL = originalUrl;
  });

  it("uses NEXT_PUBLIC_WHATSAPP_URL when configured", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_URL = "https://wa.me/5511999999999";

    expect(getWhatsAppHref()).toBe("https://wa.me/5511999999999");
  });

  it("falls back to the public WhatsApp link when env is empty", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_URL = "";

    expect(getWhatsAppHref()).toBe("https://wa.me/5511953583354");
  });
});
