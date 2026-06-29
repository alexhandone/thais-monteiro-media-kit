import {
  BadgeCheck,
  CalendarDays,
  Clapperboard,
  Link2,
  MapPinned,
  MessageSquareText,
  PackageOpen,
  Sparkles,
} from "lucide-react";

import { siteContent } from "@/lib/content";
import { MotionReveal } from "@/components/shared/MotionReveal";

import { SectionIntro } from "./SectionIntro";

const deliverableMeta = [
  {
    icon: Clapperboard,
    text: "Videos curtos com narrativa, gancho e chamada alinhada ao objetivo da marca.",
  },
  {
    icon: CalendarDays,
    text: "Presença recorrente para campanhas sazonais, lançamentos e relacionamento.",
  },
  {
    icon: MapPinned,
    text: "Cobertura de experiências, visitas, eventos e ativações presenciais.",
  },
  {
    icon: PackageOpen,
    text: "Apresentação natural de produtos, recebidos e primeiras impressões.",
  },
  {
    icon: MessageSquareText,
    text: "Conteúdo com percepção de uso, benefícios, rotina e prova social.",
  },
  {
    icon: BadgeCheck,
    text: "Associação de imagem com presença contínua e narrativa de confiança.",
  },
  {
    icon: Link2,
    text: "Sequencia de stories para educar, aquecer e direcionar trafego.",
  },
  {
    icon: Sparkles,
    text: "Formato desenhado sob medida para a necessidade da campanha.",
  },
] as const;

export function DeliverablesSection() {
  return (
    <section className="relative isolate overflow-hidden bg-paper px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -right-24 top-16 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-background/80 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(62,60,54,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(62,60,54,0.028)_1px,transparent_1px)] bg-[size:52px_52px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        <MotionReveal>
          <SectionIntro
            eyebrow="Formatos de entrega"
            title="Formatos flexíveis para presença, prova social e venda."
            copy="Entregas pensadas para diferentes momentos da campanha, do awareness à conversão."
          />
        </MotionReveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {siteContent.deliverables.map((deliverable, index) => {
            const meta = deliverableMeta[index];
            const Icon = meta.icon;

            return (
              <MotionReveal key={deliverable} delay={index * 0.04} className="h-full">
                <article className="group flex h-full min-h-64 flex-col rounded-xl border border-border-soft bg-white/34 p-5 shadow-[0_18px_50px_rgba(36,35,31,0.05)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-accent/60 hover:bg-white/58">
                  <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-paper transition duration-300 group-hover:scale-105 group-hover:bg-foreground">
                    <Icon size={22} aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold leading-tight text-foreground">
                    {deliverable}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-muted">{meta.text}</p>
                </article>
              </MotionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
