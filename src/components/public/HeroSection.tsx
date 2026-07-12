"use client";

import { ArrowDownRight, AtSign, Baby, House, Shirt, Sparkles } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { siteContent } from "@/lib/content";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 90]);
  const typeY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -52]);

  return (
    <section
      ref={sectionRef}
      id="inicio"
      className="hero-editorial relative isolate min-h-[100svh] overflow-hidden bg-[#e8e6e1] text-[#1d1c19]"
    >
      <div className="hero-editorial__noise pointer-events-none absolute inset-0 z-0" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-0 left-0 z-0 h-[16svh] w-full bg-accent sm:h-[12svh] lg:h-[9svh]" aria-hidden="true" />

      <motion.div
        style={{ y: typeY }}
        className="pointer-events-none absolute inset-x-0 top-[28svh] z-[1] flex select-none flex-col items-center font-display text-[clamp(6.5rem,25vw,17rem)] font-normal leading-[0.59] text-[#1d1c19]/10 sm:top-[24svh] sm:text-[clamp(7.4rem,22vw,17rem)] lg:left-[34vw] lg:right-auto lg:top-[18svh] lg:items-start lg:text-[clamp(9rem,14.5vw,15rem)] lg:text-[#1d1c19]/[0.08]"
        aria-hidden="true"
      >
        <span>Thais</span>
        <span>Thais</span>
        <span>Thais</span>
      </motion.div>

      <div className="relative z-10 mx-auto min-h-[100svh] w-full max-w-[100rem] px-5 pb-8 pt-24 sm:px-8 sm:pt-28 lg:px-10 lg:pt-32">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="absolute left-5 top-[15svh] z-30 flex items-center gap-3 text-[0.68rem] font-semibold tracking-[0.13em] text-[#514e47] sm:left-8 sm:top-[17svh] lg:left-10 lg:top-[19svh]"
        >
          <span>{siteContent.handle}</span>
          <span className="h-px w-8 bg-accent" aria-hidden="true" />
          <span>{siteContent.location}</span>
        </motion.div>

        <motion.div
          style={{ y: imageY }}
          initial={reduceMotion ? false : { clipPath: "inset(0 0 100% 0)", opacity: 0.65 }}
          animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
          transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="pointer-events-none absolute inset-x-0 bottom-[5svh] z-10 mx-auto flex h-[79svh] items-end justify-center sm:bottom-[5svh] sm:h-[82svh] lg:bottom-[4svh] lg:left-[27vw] lg:right-auto lg:h-[86svh] lg:w-[42vw]"
        >
          <Image
            src="/images/thais-hero.png"
            alt="Thais Monteiro com conjunto vermelho em uma composição editorial"
            width={1415}
            height={1747}
            priority
            sizes="(min-width: 1024px) 44vw, (min-width: 640px) 62vw, 94vw"
            className="h-full w-auto max-w-none object-contain object-bottom drop-shadow-[0_28px_30px_rgba(29,28,25,0.16)]"
          />
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
          className="absolute bottom-[5svh] left-5 z-30 w-[min(87vw,27rem)] sm:bottom-[6svh] sm:left-8 lg:bottom-[14svh] lg:left-10 lg:w-[26vw] lg:min-w-[22rem] lg:max-w-[28rem]"
        >
          <div className="border-t border-[#1d1c19]/35 bg-[#e8e6e1]/94 px-5 pb-5 pt-5 backdrop-blur-[3px] sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-5 sm:backdrop-blur-none">
            <h1 className="max-w-[12ch] text-balance font-display text-[clamp(2rem,9vw,3.65rem)] font-normal leading-[0.93] text-[#1d1c19]">
              {siteContent.title}
            </h1>
            <p className="mt-3 max-w-[38rem] text-pretty text-[0.78rem] font-medium leading-5 text-[#37342e] sm:mt-4 sm:text-sm sm:font-normal sm:leading-6 sm:text-[#514e47] lg:max-w-[29rem]">
              {siteContent.intro}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
            <a
              href="#metricas"
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#1d1c19] px-4 text-xs font-semibold !text-white transition-colors duration-300 hover:bg-accent hover:!text-white sm:h-11 sm:px-5 sm:text-sm"
              style={{ color: "#ffffff" }}
            >
              Liberar métricas
              <ArrowDownRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" aria-hidden="true" />
            </a>
            <a
              href={siteContent.contact.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir Instagram de Thais Monteiro"
              className="group inline-flex size-10 items-center justify-center rounded-full border border-[#1d1c19]/35 text-[#1d1c19] transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-white sm:size-11"
            >
              <AtSign className="size-4" aria-hidden="true" />
            </a>
          </div>
        </motion.div>

        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="absolute right-8 top-1/2 z-30 hidden size-[17rem] -translate-y-1/2 text-[#1d1c19] lg:block xl:right-12 xl:size-[19rem]"
          aria-label="Territórios de conteúdo"
        >
          <div className="absolute left-[12%] right-[12%] top-1/2 h-px bg-[#1d1c19]/20" aria-hidden="true" />
          <div className="absolute bottom-[12%] left-1/2 top-[12%] w-px bg-[#1d1c19]/20" aria-hidden="true" />

          <div className="absolute left-1/2 top-1/2 z-10 flex size-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[#1d1c19]/35 bg-[#e8e6e1]/80 text-center text-[#1d1c19] backdrop-blur-[2px] xl:size-28">
            <Sparkles className="mb-1 size-5" aria-hidden="true" />
            <span className="font-display text-xl leading-none xl:text-2xl">Conteúdo</span>
            <span className="text-[0.58rem] font-semibold tracking-[0.12em]">REAL</span>
          </div>

          <div className="absolute left-0 top-3 flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full border border-[#1d1c19]/20 bg-white/45 text-[#1d1c19]/75">
              <Baby className="size-4" aria-hidden="true" />
            </span>
            <span className="text-xs font-medium">Maternidade</span>
          </div>

          <div className="absolute right-0 top-12 flex items-center gap-2.5">
            <span className="text-xs font-medium">Lifestyle</span>
            <span className="flex size-9 items-center justify-center rounded-full border border-[#1d1c19]/20 bg-white/45 text-[#1d1c19]/75">
              <Sparkles className="size-4" aria-hidden="true" />
            </span>
          </div>

          <div className="absolute bottom-10 left-1 flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full border border-[#1d1c19]/20 bg-white/45 text-[#1d1c19]/75">
              <House className="size-4" aria-hidden="true" />
            </span>
            <span className="text-xs font-medium">Rotina real</span>
          </div>

          <div className="absolute bottom-0 right-2 flex items-center gap-2.5">
            <span className="text-xs font-medium">Moda</span>
            <span className="flex size-9 items-center justify-center rounded-full border border-[#1d1c19]/20 bg-white/45 text-[#1d1c19]/75">
              <Shirt className="size-4" aria-hidden="true" />
            </span>
          </div>
        </motion.aside>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.05 }}
          className="absolute bottom-3 right-5 z-30 text-[0.58rem] font-semibold tracking-[0.14em] text-white sm:right-8 lg:right-10 lg:text-[0.65rem]"
        >
          MEDIA KIT · 2026
        </motion.p>
      </div>
    </section>
  );
}
