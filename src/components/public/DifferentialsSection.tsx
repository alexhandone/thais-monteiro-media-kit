import { Sparkle } from "lucide-react";

import { siteContent } from "@/lib/content";
import { MotionReveal } from "@/components/shared/MotionReveal";

import { SectionIntro } from "./SectionIntro";

export function DifferentialsSection() {
  const cards = [...siteContent.differentials, ...siteContent.differentials];

  return (
    <section className="relative isolate overflow-hidden bg-paper px-5 py-20 text-foreground sm:px-8 lg:px-10 lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute -right-24 top-8 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-background/80 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(62,60,54,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(62,60,54,0.035)_1px,transparent_1px)] bg-[size:52px_52px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        <MotionReveal>
          <SectionIntro
            eyebrow="Diferenciais"
            title="Narrativa feminina, leve e comercialmente aplicável."
            copy="Um perfil construído em torno de confiança cotidiana, com linguagem próxima para campanhas de awareness, consideração e conversão."
          />
        </MotionReveal>

        <MotionReveal
          delay={0.12}
          className="relative mt-14 overflow-hidden py-4"
        >
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-paper to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-paper to-transparent"
            aria-hidden="true"
          />
          <div className="animate-marquee-right flex w-max gap-4 pr-4">
            {cards.map((item, index) => (
            <article
              key={`${item}-${index}`}
              className="group grid min-h-64 w-[17rem] shrink-0 content-between rounded-xl border border-border-soft bg-white/36 p-5 shadow-[0_18px_50px_rgba(36,35,31,0.06)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-white/58 sm:w-[19rem]"
            >
              <div>
                <div className="mb-7 flex items-center justify-between">
                  <span className="h-px w-16 bg-accent/45" aria-hidden="true" />
                  <Sparkle
                    className="text-accent transition group-hover:scale-110"
                    size={22}
                    aria-hidden="true"
                  />
                </div>
                <div className="mb-6 grid h-24 place-items-center rounded-lg border border-dashed border-border-soft bg-background/45 text-xs font-semibold uppercase tracking-[0.18em] text-muted/70">
                  Imagem
                </div>
              </div>
              <h3 className="text-xl font-semibold leading-snug text-charcoal">
                {item}
              </h3>
            </article>
            ))}
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
