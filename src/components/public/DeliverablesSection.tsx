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

import { MotionReveal } from "@/components/shared/MotionReveal";
import { siteContent } from "@/lib/content";

const deliverableMeta = [
  { icon: Clapperboard, text: "Narrativa, gancho e chamada alinhada ao objetivo da marca." },
  { icon: CalendarDays, text: "Presença recorrente em campanhas sazonais e lançamentos." },
  { icon: MapPinned, text: "Cobertura de experiências, visitas, eventos e ativações." },
  { icon: PackageOpen, text: "Apresentação natural de produtos e primeiras impressões." },
  { icon: MessageSquareText, text: "Uso real, benefícios, rotina e prova social." },
  { icon: BadgeCheck, text: "Presença contínua e narrativa construída com confiança." },
  { icon: Link2, text: "Stories para educar, aquecer e direcionar tráfego." },
  { icon: Sparkles, text: "Formato desenhado sob medida para cada campanha." },
] as const;

export function DeliverablesSection() {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden border-t border-foreground/10 bg-[#e8e6e1] px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-14">
      <div className="editorial-light-grain pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      <div className="mx-auto w-full max-w-[92rem]">
        <MotionReveal className="grid gap-5 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent sm:text-sm">Formatos</p>
            <h2 className="mt-3 max-w-[11ch] text-balance font-display text-[clamp(2.8rem,5.2vw,4.9rem)] font-normal leading-[0.9] text-foreground lg:max-w-[16ch]">
              Uma ideia, diferentes formas de contar.
            </h2>
          </div>
          <p className="max-w-2xl text-pretty border-t border-foreground/16 pt-5 text-sm leading-7 text-muted sm:text-base lg:justify-self-end">
            Entregas flexíveis para awareness, relacionamento e conversão, sempre
            adaptadas à linguagem da marca e ao comportamento da audiência.
          </p>
        </MotionReveal>

        <div className="mt-8 grid grid-cols-2 border-t border-foreground/18 lg:mt-9">
          {siteContent.deliverables.map((deliverable, index) => {
            const meta = deliverableMeta[index];
            const Icon = meta.icon;

            return (
              <MotionReveal
                key={deliverable}
                delay={(index % 4) * 0.035}
                className={`h-full ${index % 2 === 0 ? "border-r border-foreground/18" : ""}`}
              >
                <article className="group flex h-full min-h-[11rem] flex-col gap-3 border-b border-foreground/18 px-4 py-4 sm:grid sm:min-h-[7rem] sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-4 sm:px-5 sm:py-4 lg:min-h-[6.8rem]">
                  <span className="grid size-8 place-items-center rounded-full bg-foreground text-paper transition duration-300 group-hover:bg-accent sm:size-9">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-pretty text-[0.95rem] font-semibold leading-tight text-foreground sm:text-lg">
                      {deliverable}
                    </h3>
                    <p className="mt-1.5 max-w-[42ch] text-xs leading-[1.15rem] text-muted sm:text-sm sm:leading-5">{meta.text}</p>
                  </div>
                </article>
              </MotionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
