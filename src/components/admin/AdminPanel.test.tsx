import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AdminPanel } from "./AdminPanel";

function mockJson(payload: unknown, ok = true) {
  return {
    ok,
    json: async () => payload,
  };
}

const sessionPayload = {
  authenticated: true,
  requiresSetup: false,
  user: {
    id: "admin-1",
    name: "Alex",
    email: "admin@example.com",
    role: "owner",
  },
};

const dashboardPayload = {
  cards: {
    totalViews: 0,
    recentViews: 0,
    totalLeads: 0,
    recentLeads: 0,
  },
  daily: [],
  latestLeads: [],
  latestSnapshot: null,
  metaToken: {
    source: "admin",
    saved: true,
    maskedToken: "EAAB...TOKEN",
    updatedAt: null,
    testedAt: null,
    lastTestError: null,
  },
};

const usersPayload = {
  users: [
    {
      id: "admin-1",
      name: "Alex",
      email: "admin@example.com",
      role: "owner",
      active: true,
      created_at: "2026-06-30T00:00:00.000Z",
      last_login_at: null,
    },
  ],
};

const settingsPayload = {
  settings: {
    showStoriesMetrics: true,
  },
};

describe("AdminPanel users form", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a direct admin-only metrics dashboard link", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/admin/session") {
        return Promise.resolve(mockJson(sessionPayload));
      }

      if (url === "/api/admin/dashboard") {
        return Promise.resolve(mockJson(dashboardPayload));
      }

      if (url === "/api/admin/users" && !init?.method) {
        return Promise.resolve(mockJson(usersPayload));
      }

      if (url === "/api/admin/settings" && !init?.method) {
        return Promise.resolve(mockJson(settingsPayload));
      }

      return Promise.resolve(mockJson({}, false));
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminPanel />);

    const metricsLink = await screen.findByRole("link", {
      name: /ver painel analítico/i,
    });

    expect(metricsLink).toHaveAttribute("href", "/admin/metricas");
  });

  it("requires password confirmation and can reveal typed passwords", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (url === "/api/admin/session") {
        return Promise.resolve(mockJson(sessionPayload));
      }

      if (url === "/api/admin/dashboard") {
        return Promise.resolve(mockJson(dashboardPayload));
      }

      if (url === "/api/admin/users" && !init?.method) {
        return Promise.resolve(mockJson(usersPayload));
      }

      if (url === "/api/admin/settings" && !init?.method) {
        return Promise.resolve(mockJson(settingsPayload));
      }

      if (url === "/api/admin/users" && init?.method === "POST") {
        return Promise.resolve(mockJson({ ok: true }));
      }

      return Promise.resolve(mockJson({}, false));
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminPanel />);

    fireEvent.click(await screen.findByRole("button", { name: /usuários/i }));

    const password = screen.getByLabelText(/^senha$/i);
    const confirmation = screen.getByLabelText(/confirmar senha/i);

    expect(password).toHaveAttribute("type", "password");
    expect(confirmation).toHaveAttribute("type", "password");

    fireEvent.change(screen.getByLabelText(/^nome$/i), {
      target: { value: "Thais" },
    });
    fireEvent.change(screen.getByLabelText(/^e-mail$/i), {
      target: { value: "thais@example.com" },
    });
    fireEvent.change(password, { target: { value: "senha-123" } });
    fireEvent.change(confirmation, { target: { value: "senha-456" } });
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    expect(await screen.findByText(/as senhas não conferem/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/admin/users",
      expect.objectContaining({ method: "POST" }),
    );

    fireEvent.click(screen.getByRole("button", { name: /mostrar senhas/i }));

    expect(password).toHaveAttribute("type", "text");
    expect(confirmation).toHaveAttribute("type", "text");

    fireEvent.change(confirmation, { target: { value: "senha-123" } });
    fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/admin/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "Thais",
            email: "thais@example.com",
            password: "senha-123",
          }),
        }),
      );
    });
  });
});
