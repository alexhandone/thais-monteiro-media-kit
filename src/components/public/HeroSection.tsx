import { ArrowDownRight, AtSign, MapPin, Sparkle } from "lucide-react";
import Image from "next/image";

import { siteContent } from "@/lib/content";
import { MotionReveal } from "@/components/shared/MotionReveal";

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative isolate min-h-screen overflow-hidden bg-background px-5 pb-10 pt-24 sm:px-8 sm:pt-28 lg:px-10 lg:pt-32"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-80"
        aria-hidden="true"
      >
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-accent/18 blur-3xl" />
        <div className="absolute right-0 top-10 h-[34rem] w-[34rem] rounded-full bg-accent/18 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-paper/70 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(244,241,236,0.72),rgba(216,214,208,0.34)_42%,rgba(62,60,54,0.16)),radial-gradient(circle_at_76%_42%,rgba(239,31,61,0.2),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(62,60,54,0.026)_1px,transparent_1px),linear-gradient(90deg,rgba(62,60,54,0.026)_1px,transparent_1px)] bg-[size:42px_42px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(62,60,54,0.07)_1px,transparent_1.5px)] bg-[size:22px_22px] opacity-18" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-20 z-0 mx-auto h-[34rem] max-w-7xl sm:h-[42rem] lg:bottom-0 lg:top-24 lg:h-auto">
        <p
          className="absolute left-1/2 top-[1.5rem] w-[120vw] -translate-x-1/2 select-none text-center font-display text-[5.9rem] font-normal uppercase leading-[0.72] text-foreground/[0.12] sm:top-8 sm:text-[8.9rem] lg:top-1/2 lg:w-[54rem] lg:-translate-y-1/2 lg:text-[11.8rem]"
          aria-hidden="true"
        >
          Thais
          <br />
          Thais
          <br />
          Thais
        </p>

        <Sparkle
          className="absolute right-[12%] top-[26%] text-accent/80 sm:right-[18%] lg:right-[23%] lg:top-[27%]"
          size={28}
          aria-hidden="true"
        />

        <Image
          src="/images/thais-hero.png"
          alt="Thais Monteiro"
          width={450}
          height={996}
          priority
          sizes="(min-width: 1024px) 500px, (min-width: 640px) 430px, 350px"
          className="absolute left-1/2 top-4 h-[31rem] max-h-[66svh] w-auto -translate-x-1/2 object-contain drop-shadow-[0_34px_45px_rgba(36,35,31,0.22)] sm:top-8 sm:h-[39rem] sm:max-h-[72svh] lg:bottom-0 lg:top-auto lg:h-[49rem] lg:max-h-[88svh]"
        />
      </div>

      <div className="mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-7xl items-start pb-5 pt-[30rem] sm:pt-[36rem] lg:min-h-[calc(100svh-8rem)] lg:items-center lg:pb-0 lg:pt-0">
        <div className="relative z-20 w-full max-w-[35rem] text-charcoal lg:max-w-[30rem]">
          <MotionReveal
            delay={0.06}
            className="mb-4 flex flex-wrap items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-muted sm:text-sm"
          >
            <span>{siteContent.handle}</span>
            <span className="h-px w-10 bg-accent" aria-hidden="true" />
            <span className="inline-flex items-center gap-2">
              <MapPin size={15} aria-hidden="true" />
              {siteContent.location}
            </span>
          </MotionReveal>
          <MotionReveal
            delay={0.13}
            className="grid gap-4 rounded-[1.4rem] border border-white/35 bg-white/30 p-4 shadow-[0_18px_50px_rgba(36,35,31,0.08)] backdrop-blur-md sm:gap-5 sm:p-5 lg:mt-7 lg:gap-5 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-0"
          >
            <h1 className="font-display text-2xl font-normal leading-none text-charcoal sm:text-5xl lg:text-5xl">
              {siteContent.title}
            </h1>
            <p className="max-w-xl text-sm leading-7 text-muted sm:text-base lg:text-base lg:leading-7">
              {siteContent.intro}
            </p>
          </MotionReveal>
          <MotionReveal
            delay={0.22}
            className="mt-5 grid gap-3 min-[380px]:flex min-[380px]:flex-wrap min-[380px]:items-center lg:mt-7"
          >
            <a
              href="#metricas"
              className="inline-flex h-12 items-center justify-center gap-3 rounded-full border border-border-soft bg-white/35 px-5 text-sm font-semibold text-charcoal backdrop-blur-md transition hover:bg-white/70"
            >
              Liberar métricas
            </a>
            <a
              href={siteContent.contact.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-3 rounded-full border border-border-soft bg-white/35 px-5 text-sm font-semibold text-charcoal backdrop-blur-md transition hover:bg-white/70"
            >
              <AtSign size={18} aria-hidden="true" />
              Instagram
              <ArrowDownRight size={16} aria-hidden="true" />
            </a>
          </MotionReveal>
        </div>
      </div>
    </section>
  );
}
