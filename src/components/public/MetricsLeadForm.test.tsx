import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MetricsLeadForm } from "./MetricsLeadForm";

describe("MetricsLeadForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { assign: vi.fn() },
    });
  });

  it("posts lead data with an empty honeypot and shows success before redirecting", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ redirectTo: "/metricas/token-123" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<MetricsLeadForm />);

    fireEvent.change(screen.getByLabelText(/nome ou empresa/i), {
      target: { value: "Marca Editorial" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "contato@marca.com" },
    });
    fireEvent.change(screen.getByLabelText(/whatsapp/i), {
      target: { value: "11999999999" },
    });

    fireEvent.click(screen.getByRole("button", { name: /liberar métricas/i }));

    expect(
      await screen.findByText("Obrigado. Liberando acesso..."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/leads",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyOrName: "Marca Editorial",
            email: "contato@marca.com",
            phone: "11999999999",
            website: "",
          }),
        }),
      );
      expect(window.location.assign).toHaveBeenCalledWith("/metricas/token-123");
    });
  });
});
