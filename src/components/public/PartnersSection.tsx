import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { siteContent } from "@/lib/content";
import { MotionReveal } from "@/components/shared/MotionReveal";

import { SectionIntro } from "./SectionIntro";

const partnerImages: Record<string, string> = {
  "@dra.mileneribeiro": "/images/partners/@dra.mileneribeiro.jpg",
  "@studio_thay_santos": "/images/partners/@studio_thay_santos.jpg",
  "@bloompilatesfisio": "/images/partners/@bloompilatesfisio.jpg",
  "@altiorastudioo": "/images/partners/@altiorastudioo.jpg",
  "@lesantosfotografia": "/images/partners/@lesantosfotografia.jpg",
  "@studiotgfotos": "/images/partners/@studiotgfotos.jpg",
  "@gestarporproposito": "/images/partners/@gestarporproposito.jpg",
  "@magnaalvesimportados": "/images/partners/@magnaalvesimportados.jpg",
  "@projeart_expo": "/images/partners/@projeart_expo.jpg",
  "@alinemoreira_studiobeauty":
    "/images/partners/@alinemoreira_studiobeauty.jpg",
  "@belarigelato": "/images/partners/@belarigelato.jpg",
  "@goldspellcosmeticos": "/images/partners/@goldspellcosmeticos.jpg",
  "@casadonortemedina": "/images/partners/@casadonortemedina.jpg",
};

function instagramUrl(handle: string) {
  return `https://www.instagram.com/${handle.replace(/^@/, "")}/`;
}

export function PartnersSection() {
  const cards = [...siteContent.partners, ...siteContent.partners];

  return (
    <section
      id="parcerias"
      className="relative isolate overflow-hidden bg-foreground px-5 py-20 text-paper sm:px-8 lg:px-10 lg:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute -left-20 top-8 h-80 w-80 rounded-full bg-paper/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/12 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(244,241,236,0.016)_1px,transparent_1px),linear-gradient(90deg,rgba(244,241,236,0.016)_1px,transparent_1px)] bg-[size:52px_52px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        <MotionReveal>
          <SectionIntro
            eyebrow="Parcerias"
            title="Marcas que já passaram pela narrativa da Thais."
            copy="Histórico de colaborações com negócios locais, marcas de beleza, maternidade, bem-estar e serviços que conversam com a rotina da audiência."
            tone="dark"
          />
        </MotionReveal>

        <MotionReveal
          delay={0.12}
          className="relative mt-14 overflow-hidden py-4"
        >
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-foreground to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-foreground to-transparent"
            aria-hidden="true"
          />
          <div className="animate-marquee-right flex w-max gap-4 pr-4">
            {cards.map((partner, index) => (
              <a
                key={`${partner}-${index}`}
                href={instagramUrl(partner)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Abrir Instagram ${partner}`}
                className="group relative h-72 w-[17rem] shrink-0 overflow-hidden rounded-xl border border-paper/14 bg-white/7 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-accent/70 sm:w-[19rem]"
              >
                {partnerImages[partner] ? (
                  <Image
                    src={partnerImages[partner]}
                    alt={partner}
                    fill
                    sizes="(min-width: 640px) 19rem, 17rem"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : null}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/34 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
                  <span className="h-px w-16 bg-accent/70" aria-hidden="true" />
                  <ArrowUpRight
                    className="text-paper transition group-hover:translate-x-1 group-hover:-translate-y-1"
                    size={22}
                    aria-hidden="true"
                  />
                </div>
                <h3 className="absolute inset-x-0 bottom-0 min-w-0 break-words p-5 text-lg font-semibold leading-snug text-paper [overflow-wrap:anywhere] sm:text-xl">
                  {partner}
                </h3>
              </a>
            ))}
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
