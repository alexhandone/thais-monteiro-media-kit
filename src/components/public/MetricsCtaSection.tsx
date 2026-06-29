import { CalendarClock, Eye, ShieldCheck } from "lucide-react";

import { siteContent } from "@/lib/content";
import { MotionReveal } from "@/components/shared/MotionReveal";

import { MetricsLeadForm } from "./MetricsLeadForm";

export function MetricsCtaSection() {
  const { metricsCta } = siteContent;
  const highlights = [
    {
      icon: Eye,
      label: "Instagram",
      text: "Alcance, visualizações, perfil e conteúdos recentes.",
    },
    {
      icon: CalendarClock,
      label: "Últimos 30 dias",
      text: "Leitura pensada para campanhas e propostas atuais.",
    },
    {
      icon: ShieldCheck,
      label: "Acesso controlado",
      text: "Link válido por 7 dias após preencher o formulário.",
    },
  ];

  return (
    <section
      id="metricas"
      className="relative isolate overflow-hidden bg-background px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-paper/85 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(62,60,54,0.024)_1px,transparent_1px),linear-gradient(90deg,rgba(62,60,54,0.024)_1px,transparent_1px)] bg-[size:52px_52px]" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.88fr_1fr] lg:items-end">
        <MotionReveal>
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-accent">
              {metricsCta.eyebrow}
            </p>
            <h2 className="font-display text-4xl font-normal leading-none text-foreground sm:text-6xl">
              {metricsCta.title}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted sm:text-lg">
              {metricsCta.body}
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {highlights.map(({ icon: Icon, label, text }) => (
              <div
                key={label}
                className="flex gap-4 rounded-xl border border-border-soft bg-white/28 p-4 shadow-[0_18px_50px_rgba(36,35,31,0.04)] backdrop-blur-sm"
              >
                <div className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-paper">
                  <Icon size={17} aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-charcoal">{label}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </MotionReveal>

        <MotionReveal delay={0.12} className="lg:self-end">
          <div className="relative">
            <div
              className="absolute -right-4 -top-4 h-28 w-28 rounded-full border border-accent/30"
              aria-hidden="true"
            />
            <MetricsLeadForm submitLabel={metricsCta.buttonLabel} />
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
