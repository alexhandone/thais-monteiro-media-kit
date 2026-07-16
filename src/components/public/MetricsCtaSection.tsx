import { CalendarClock, Eye, ShieldCheck } from "lucide-react";

import { MotionReveal } from "@/components/shared/MotionReveal";
import { siteContent } from "@/lib/content";

import { MetricsLeadForm } from "./MetricsLeadForm";

export function MetricsCtaSection() {
  const { metricsCta } = siteContent;
  const highlights = [
    { icon: Eye, label: "Dados reais", text: "Alcance, visualizações, audiência e conteúdos." },
    { icon: CalendarClock, label: "Últimos 30 dias", text: "Uma leitura atual para decisões de campanha." },
    { icon: ShieldCheck, label: "Acesso reservado", text: "Link individual válido por sete dias." },
  ];

  return (
    <section
      id="metricas"
      className="relative isolate flex min-h-[100svh] scroll-mt-24 flex-col justify-center overflow-hidden border-t border-foreground/10 bg-[#f0efec] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-14"
    >
      <div className="editorial-light-grain pointer-events-none absolute inset-0 -z-10 opacity-30" aria-hidden="true" />

      <div className="mx-auto grid w-full max-w-[92rem] gap-8 lg:grid-cols-2 lg:items-end lg:gap-20">
        <MotionReveal className="flex h-full flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent sm:text-sm">Métricas</p>
            <h2 className="mt-3 max-w-[10ch] text-balance font-display text-[clamp(2.8rem,5.5vw,5.2rem)] font-normal leading-[0.9] text-foreground lg:max-w-[16ch]">
              {metricsCta.title}
            </h2>
            <p className="mt-5 max-w-xl text-pretty text-sm leading-6 text-muted sm:text-base sm:leading-7">
              {metricsCta.body}
            </p>
          </div>

          <div className="mt-7 grid grid-cols-3 border-y border-foreground/18 lg:mt-10 lg:block lg:border-b-0">
            {highlights.map(({ icon: Icon, label, text }) => (
              <div key={label} className="grid gap-2 border-r border-foreground/18 px-2 py-3 last:border-r-0 lg:grid-cols-[auto_1fr] lg:gap-4 lg:border-b lg:border-r-0 lg:px-0 lg:py-4">
                <span className="grid size-8 place-items-center rounded-full bg-accent/10 text-accent lg:size-9">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <div className="sm:grid sm:grid-cols-[9rem_1fr] sm:items-baseline sm:gap-4">
                  <h3 className="text-[0.7rem] font-semibold leading-tight text-foreground sm:text-xs lg:text-sm">{label}</h3>
                  <p className="mt-1 hidden text-sm leading-6 text-muted sm:mt-0 lg:block">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </MotionReveal>

        <MotionReveal delay={0.1}>
          <MetricsLeadForm submitLabel={metricsCta.buttonLabel} />
        </MotionReveal>
      </div>
    </section>
  );
}
