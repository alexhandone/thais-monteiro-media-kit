"use client";

import { Building2, LoaderCircle, Mail, Phone, Send } from "lucide-react";
import { FormEvent, useState } from "react";

type LeadPayload = {
  redirectTo?: string | null;
  error?: string;
};

type MetricsLeadFormProps = {
  submitLabel?: string;
};

export function MetricsLeadForm({
  submitLabel = "Liberar métricas",
}: MetricsLeadFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      companyOrName: String(formData.get("companyOrName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      website: String(formData.get("website") ?? ""),
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as LeadPayload;

      if (!response.ok || data.error) {
        throw new Error(data.error ?? "Não foi possível liberar o acesso.");
      }

      setStatus("success");

      if (data.redirectTo) {
        window.setTimeout(() => {
          window.location.assign(data.redirectTo as string);
        }, 650);
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível liberar o acesso.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative grid gap-5 rounded-[1.4rem] border border-white/45 bg-paper/72 p-5 shadow-[0_24px_70px_rgba(36,35,31,0.1)] backdrop-blur-xl sm:p-7"
      aria-label="Formulário para liberar métricas"
    >
      <div className="grid gap-2">
        <label className="text-sm font-semibold text-charcoal" htmlFor="companyOrName">
          Nome ou empresa
        </label>
        <div className="relative">
          <Building2
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            size={18}
            aria-hidden="true"
          />
          <input
            id="companyOrName"
            name="companyOrName"
            required
            minLength={2}
            autoComplete="organization"
            placeholder="Ex.: Marca, agência ou seu nome"
            className="h-13 w-full rounded-xl border border-border-soft bg-white/55 pl-12 pr-4 text-foreground outline-none transition placeholder:text-muted/55 focus:border-accent focus:bg-white/75 focus:ring-4 focus:ring-accent/15"
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-charcoal" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              size={18}
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              required
              type="email"
              autoComplete="email"
              placeholder="contato@empresa.com"
              className="h-13 w-full rounded-xl border border-border-soft bg-white/55 pl-12 pr-4 text-foreground outline-none transition placeholder:text-muted/55 focus:border-accent focus:bg-white/75 focus:ring-4 focus:ring-accent/15"
            />
          </div>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-charcoal" htmlFor="phone">
            WhatsApp
          </label>
          <div className="relative">
            <Phone
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              size={18}
              aria-hidden="true"
            />
            <input
              id="phone"
              name="phone"
              required
              type="tel"
              minLength={8}
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              className="h-13 w-full rounded-xl border border-border-soft bg-white/55 pl-12 pr-4 text-foreground outline-none transition placeholder:text-muted/55 focus:border-accent focus:bg-white/75 focus:ring-4 focus:ring-accent/15"
            />
          </div>
        </div>
      </div>

      <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="mt-2 inline-flex h-13 items-center justify-center gap-3 rounded-full bg-accent px-6 text-sm font-bold uppercase tracking-[0.14em] text-paper transition hover:bg-foreground disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? (
          <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
        ) : (
          <Send size={17} aria-hidden="true" />
        )}
        {status === "loading" ? "Enviando..." : submitLabel}
      </button>

      <p className="text-xs leading-5 text-muted">
        Ao enviar, o acesso às métricas será liberado por 7 dias. Depois desse
        prazo, é necessário preencher o formulário novamente.
      </p>

      <div className="min-h-6 text-sm" role="status" aria-live="polite">
        {status === "success" ? (
          <p className="font-semibold text-charcoal">Obrigado. Liberando acesso...</p>
        ) : null}
        {status === "error" ? (
          <p className="font-semibold text-red-700">{errorMessage}</p>
        ) : null}
      </div>
    </form>
  );
}
