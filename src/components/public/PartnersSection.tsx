import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import { InteractiveMarqueeCarousel } from "@/components/shared/InteractiveMarqueeCarousel";
import { MotionReveal } from "@/components/shared/MotionReveal";
import { siteContent } from "@/lib/content";

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
      className="relative isolate flex min-h-[100svh] scroll-mt-24 flex-col justify-center overflow-hidden border-t border-paper/10 bg-[#1b1a17] py-16 text-paper sm:py-20 lg:py-14"
    >
      <div className="editorial-dark-grain pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden="true" />

      <div className="mx-auto w-full max-w-[100rem] px-5 sm:px-8 lg:px-10">
        <MotionReveal className="grid gap-7 border-b border-paper/14 pb-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:gap-16 lg:pb-9">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent sm:text-sm">Parcerias</p>
            <h2 className="mt-3 max-w-[10ch] text-balance font-display text-[clamp(3rem,6vw,5.8rem)] font-normal leading-[0.88] text-paper">
              Marcas que entram na história.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <p className="max-w-2xl text-pretty text-sm leading-7 text-paper/68 sm:text-base">
              Colaborações em beleza, maternidade, bem-estar e serviços que se
              conectam à rotina da audiência com contexto, verdade e presença.
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/45">
              Deslize para explorar
            </p>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.1} className="mt-7 lg:mt-8">
          <InteractiveMarqueeCarousel
            label="parcerias"
            tone="dark"
            step={360}
            contentClassName="gap-3 sm:gap-4"
          >
            {cards.map((partner, index) => (
              <a
                key={`${partner}-${index}`}
                href={instagramUrl(partner)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Abrir Instagram ${partner}`}
                draggable={false}
                className="group relative h-[21rem] w-[16rem] shrink-0 overflow-hidden bg-charcoal sm:h-[23rem] sm:w-[18rem] lg:h-[25rem] lg:w-[20rem]"
              >
                {partnerImages[partner] ? (
                  <Image
                    src={partnerImages[partner]}
                    alt={partner}
                    fill
                    priority={index < 4}
                    sizes="(min-width: 1024px) 20rem, (min-width: 640px) 18rem, 16rem"
                    className="object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/8 to-black/10" aria-hidden="true" />
                <span className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-paper text-foreground transition duration-300 group-hover:bg-accent group-hover:text-paper">
                  <ArrowUpRight size={18} aria-hidden="true" />
                </span>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <span className="mb-3 block h-px w-10 bg-accent transition-all duration-500 group-hover:w-full" aria-hidden="true" />
                  <h3 className="min-w-0 break-words text-base font-semibold leading-snug text-paper [overflow-wrap:anywhere] sm:text-lg">
                    {partner}
                  </h3>
                </div>
              </a>
            ))}
          </InteractiveMarqueeCarousel>
        </MotionReveal>
      </div>
    </section>
  );
}
