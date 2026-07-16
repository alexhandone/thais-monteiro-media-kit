"use client";

import { Building2, LoaderCircle, Mail, Phone, Send } from "lucide-react";
import { FormEvent, useState } from "react";

type LeadPayload = { redirectTo?: string | null; error?: string };
type MetricsLeadFormProps = { submitLabel?: string };

const inputClassName =
  "h-12 w-full border-0 border-b border-foreground/22 bg-transparent pl-9 pr-2 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-accent";

export function MetricsLeadForm({ submitLabel = "Liberar métricas" }: MetricsLeadFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
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
        window.setTimeout(() => window.location.assign(data.redirectTo as string), 650);
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível liberar o acesso.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative border border-foreground/20 bg-[#e4e2dd]/88 p-5 sm:p-7 lg:p-8"
      aria-label="Formulário para liberar métricas"
    >
      <div className="mb-5 flex items-start justify-between gap-6 border-b border-foreground/16 pb-4 sm:mb-7 sm:pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Acesso ao painel</p>
          <h3 className="mt-2 max-w-[18ch] text-balance text-lg font-semibold leading-tight text-foreground sm:text-2xl">
            Identifique-se para consultar os dados.
          </h3>
        </div>
        <span className="font-display text-5xl leading-none text-foreground/18" aria-hidden="true">TM</span>
      </div>

      <div className="grid gap-4 sm:gap-6">
        <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted" htmlFor="companyOrName">
          Nome ou empresa
          <span className="relative">
            <Building2 className="absolute left-1 top-1/2 -translate-y-1/2 text-accent" size={17} aria-hidden="true" />
            <input id="companyOrName" name="companyOrName" required minLength={2} autoComplete="organization" placeholder="Marca, agência ou seu nome" className={inputClassName} />
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted" htmlFor="email">
            E-mail
            <span className="relative">
              <Mail className="absolute left-1 top-1/2 -translate-y-1/2 text-accent" size={17} aria-hidden="true" />
              <input id="email" name="email" required type="email" autoComplete="email" aria-label="Email" placeholder="contato@empresa.com" className={inputClassName} />
            </span>
          </label>
          <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted" htmlFor="phone">
            WhatsApp
            <span className="relative">
              <Phone className="absolute left-1 top-1/2 -translate-y-1/2 text-accent" size={17} aria-hidden="true" />
              <input id="phone" name="phone" required type="tel" minLength={8} autoComplete="tel" placeholder="(11) 99999-9999" className={inputClassName} />
            </span>
          </label>
        </div>
      </div>

      <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      </div>

      <button
        type="submit"
        disabled={status === "loading" || status === "success"}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-3 bg-foreground px-6 text-sm font-semibold text-paper transition hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-70 sm:mt-7"
      >
        {status === "loading" ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
        {status === "loading" ? "Enviando..." : submitLabel}
      </button>

      <p className="mt-4 text-xs leading-5 text-muted">
        O acesso fica disponível por sete dias. Após esse prazo, será necessário preencher o formulário novamente.
      </p>
      <div className="min-h-6 pt-2 text-sm" role="status" aria-live="polite">
        {status === "success" ? <p className="font-semibold text-emerald-700">Obrigado. Liberando acesso...</p> : null}
        {status === "error" ? <p className="font-semibold text-red-700">{errorMessage}</p> : null}
      </div>
    </form>
  );
}
