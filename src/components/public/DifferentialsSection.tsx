import { Sparkles } from "lucide-react";
import Image from "next/image";

import { InteractiveMarqueeCarousel } from "@/components/shared/InteractiveMarqueeCarousel";
import { MotionReveal } from "@/components/shared/MotionReveal";
import { siteContent } from "@/lib/content";

const differentialImages = [
  { src: "/images/differentials/comunicacao-com-humor-e-leveza.jpg", position: "50% 48%" },
  { src: "/images/differentials/alta-identificacao-com-o-publico-feminino.jpg", position: "50% 42%" },
  { src: "/images/differentials/storytelling-persuasivo.jpg", position: "50% 42%" },
  { src: "/images/differentials/autoridade-em-maternidade-e-lifestyle.jpg", position: "50% 48%" },
  { src: "/images/differentials/experiencia-com-marcas-reconhecidas.JPG", position: "50% 38%" },
] as const;

export function DifferentialsSection() {
  const differentialCards = siteContent.differentials.map((title, index) => ({
    title,
    ...differentialImages[index],
  }));
  const cards = [...differentialCards, ...differentialCards];

  return (
    <section
      id="diferenciais"
      className="relative isolate scroll-mt-24 overflow-hidden bg-[#e8e6e1] py-14 text-[#1d1c19] sm:py-16 lg:min-h-[100svh] lg:py-14"
    >
      <div className="editorial-light-grain pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#1d1c19]/18" aria-hidden="true" />

      <div className="mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-10">
        <div className="grid items-end gap-7 border-b border-[#1d1c19]/20 pb-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(26rem,0.92fr)] lg:gap-16 lg:pb-8">
          <MotionReveal>
            <div className="flex items-center gap-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#5d5a53]">
              <Sparkles className="size-5 text-accent" strokeWidth={1.6} aria-hidden="true" />
              <span>O que torna cada entrega única</span>
            </div>
            <h2 className="mt-4 max-w-[10ch] text-balance font-editorial text-[clamp(3.8rem,8vw,5.4rem)] font-normal leading-[0.84] tracking-[-0.03em]">
              Diferenciais
            </h2>
          </MotionReveal>

          <MotionReveal delay={0.1} className="lg:pb-1">
            <p className="max-w-[23ch] font-editorial text-[1.7rem] font-normal leading-[1.02] sm:text-3xl lg:text-[2.25rem]">
              Narrativa feminina, leve e comercialmente aplicável.
            </p>
            <div className="mt-5 flex max-w-[44rem] items-start gap-5">
              <span className="mt-2 h-px w-14 shrink-0 bg-accent" aria-hidden="true" />
              <p className="max-w-[58ch] text-sm leading-6 text-[#5d5a53] sm:text-base sm:leading-7">
                Confiança construída no cotidiano, com uma linguagem próxima que conecta marcas a mulheres reais em diferentes momentos de decisão.
              </p>
            </div>
          </MotionReveal>
        </div>

        <MotionReveal delay={0.16} className="mt-8">
          <InteractiveMarqueeCarousel
            label="diferenciais"
            step={448}
            className="-mx-5 sm:-mx-8 lg:-mx-10"
            contentClassName="gap-3 px-5 sm:gap-5 sm:px-8 lg:gap-6 lg:px-10"
          >
            {cards.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className="group relative h-[24rem] w-[17rem] shrink-0 overflow-hidden bg-[#24221f] sm:h-[29rem] sm:w-[21rem] lg:h-[30rem] lg:w-[24rem]"
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  priority={index < 3}
                  sizes="(min-width: 1024px) 24rem, (min-width: 640px) 21rem, 17rem"
                  style={{ objectPosition: item.position }}
                  className="object-cover saturate-[0.82] transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.035] group-hover:saturate-100"
                />

                <div
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,19,17,0.04)_28%,rgba(20,19,17,0.18)_56%,rgba(20,19,17,0.94)_100%)]"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-100"
                  aria-hidden="true"
                />

                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/86 sm:p-6">
                  <span>Thais Monteiro</span>
                  <Sparkles className="size-5 text-white" strokeWidth={1.5} aria-hidden="true" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                  <span className="mb-5 block h-px w-12 bg-accent" aria-hidden="true" />
                  <h3 className="max-w-[13ch] text-balance font-editorial text-[1.9rem] font-normal leading-[0.94] tracking-[-0.025em] sm:text-[2.25rem]">
                    {item.title}
                  </h3>
                </div>
              </article>
            ))}
          </InteractiveMarqueeCarousel>
        </MotionReveal>
      </div>
    </section>
  );
}
