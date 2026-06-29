import { expect, test } from "playwright/test";

test.describe("public landing lead flow", () => {
  test("shows the lead capture path without submitting the Supabase form", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { level: 1, name: "Thais Monteiro" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "Acesse dados para avaliar fit de campanha.",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("form", { name: "Formulario para liberar metricas" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Liberar metricas" }),
    ).toBeVisible();
    await expect(page.getByText("Handone Digital")).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "Falar com Thais Monteiro pelo WhatsApp",
      }),
    ).toBeVisible();
  });
});
