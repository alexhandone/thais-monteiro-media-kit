import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { WhatsAppFloatingButton } from "./WhatsAppFloatingButton";

describe("WhatsAppFloatingButton", () => {
  const originalUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_WHATSAPP_URL = originalUrl;
  });

  it("uses NEXT_PUBLIC_WHATSAPP_URL when configured", () => {
    process.env.NEXT_PUBLIC_WHATSAPP_URL = "https://wa.me/5511999999999";

    render(<WhatsAppFloatingButton />);

    expect(
      screen.getByRole("link", {
        name: "Falar com Thais Monteiro pelo WhatsApp",
      }),
    ).toHaveAttribute("href", "https://wa.me/5511999999999");
  });
});
