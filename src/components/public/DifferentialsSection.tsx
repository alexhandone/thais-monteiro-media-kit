import { Sparkle } from "lucide-react";
import Image from "next/image";

import { siteContent } from "@/lib/content";
import { InteractiveMarqueeCarousel } from "@/components/shared/InteractiveMarqueeCarousel";
import { MotionReveal } from "@/components/shared/MotionReveal";

import { SectionIntro } from "./SectionIntro";

const differentialImages = [
  "/images/differentials/comunicacao-com-humor-e-leveza.jpg",
  "/images/differentials/alta-identificacao-com-o-publico-feminino.jpg",
  "/images/differentials/storytelling-persuasivo.jpg",
  "/images/differentials/autoridade-em-maternidade-e-lifestyle.jpg",
  "/images/differentials/experiencia-com-marcas-reconhecidas.JPG",
] as const;

export function DifferentialsSection() {
  const differentialCards = siteContent.differentials.map((title, index) => ({
    title,
    image: differentialImages[index],
  }));
  const cards = [...differentialCards, ...differentialCards];

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

        <MotionReveal delay={0.12} className="mt-14">
          <InteractiveMarqueeCarousel label="diferenciais">
            {cards.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className="group relative h-72 w-[17rem] shrink-0 overflow-hidden rounded-xl border border-border-soft bg-white/36 shadow-[0_18px_50px_rgba(36,35,31,0.08)] transition duration-300 hover:-translate-y-1 hover:border-accent/60 sm:w-[19rem]"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  priority={index < differentialCards.length}
                  sizes="(min-width: 640px) 19rem, 17rem"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-foreground/88 via-foreground/26 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
                  <span className="h-px w-16 bg-accent/70" aria-hidden="true" />
                  <Sparkle
                    className="text-paper transition group-hover:scale-110"
                    size={22}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="absolute inset-x-0 bottom-0 p-5 text-xl font-semibold leading-snug text-paper">
                  {item.title}
                </h3>
              </article>
            ))}
          </InteractiveMarqueeCarousel>
        </MotionReveal>
      </div>
    </section>
  );
}
