"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { siteContent } from "@/lib/content";
import { MotionReveal } from "@/components/shared/MotionReveal";

export function BioSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [22, -24]);
  const shapeY = useTransform(scrollYProgress, [0, 1], [34, -22]);
  const bioParagraphs = [
    "Thais Monteiro cria conteúdo a partir da vida real: maternidade, rotina, moda, família e os pequenos movimentos que geram identificação imediata.",
    "Sua comunicação combina leveza, humor e uma estética feminina acessível, aproximando marcas de uma comunidade que acompanha suas escolhas no dia a dia.",
    "Para parcerias, entrega narrativa autêntica com presença comercial natural, sem perder afeto, contexto e verdade.",
  ];

  return (
    <section
      ref={sectionRef}
      id="bio"
      className="relative isolate scroll-mt-24 overflow-hidden bg-foreground px-5 py-14 text-paper sm:px-8 sm:py-20 lg:min-h-[50rem] lg:px-10 lg:py-20"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[linear-gradient(118deg,#171612_0%,#2b2a25_44%,#545149_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_24%,rgba(239,31,61,0.12),transparent_27%),radial-gradient(circle_at_14%_80%,rgba(244,241,236,0.09),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(244,241,236,0.018)_1px,transparent_1px),linear-gradient(0deg,rgba(244,241,236,0.012)_1px,transparent_1px)] bg-[size:62px_62px]" />
      </div>

      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[0.55rem] border border-paper/10 bg-paper/[0.035] shadow-[0_38px_120px_rgba(0,0,0,0.22)] backdrop-blur-[2px] lg:min-h-[41rem] lg:grid-cols-[0.95fr_1.05fr]">
        <MotionReveal className="relative min-h-[30rem] overflow-hidden sm:min-h-[39rem] lg:min-h-[41rem]">
          <motion.div
            style={{ y: imageY }}
            initial={{ opacity: 0, scale: 1.035 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src="/images/thais-editorial-bw.png"
              alt="Retrato preto e branco de Thais Monteiro"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority={false}
              className="object-cover object-[52%_28%] grayscale"
            />
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(23,22,18,0.88)_0%,rgba(23,22,18,0.16)_46%,rgba(23,22,18,0.12)_100%)] lg:bg-[linear-gradient(90deg,rgba(23,22,18,0.08)_0%,rgba(23,22,18,0.06)_54%,rgba(23,22,18,0.88)_100%)]" />
          <motion.p
            style={{ y: shapeY }}
            className="absolute -bottom-16 left-5 select-none font-brand text-[15rem] font-normal leading-none tracking-normal text-paper/[0.08] sm:left-8 sm:text-[20rem] lg:-right-16 lg:left-auto lg:top-[-5rem] lg:text-[28rem]"
            aria-hidden="true"
          >
            T
          </motion.p>
          <div className="absolute left-5 top-7 flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-paper/70 sm:left-7 sm:top-7">
            <span>Digital creator</span>
            <span className="h-px w-8 bg-accent" />
            <span>Osasco, SP</span>
          </div>
        </MotionReveal>

        <div className="relative grid content-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <motion.p
            style={{ y: shapeY }}
            className="pointer-events-none absolute -left-10 top-2 hidden select-none font-brand text-[18rem] leading-none text-paper/[0.055] lg:block"
            aria-hidden="true"
          >
            T
          </motion.p>

          <div className="relative z-10 max-w-xl">
            <MotionReveal>
              <p className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-paper/55">
                Sobre Thais
              </p>
              <h2 className="max-w-[11ch] font-display text-4xl font-normal leading-[0.92] text-paper sm:text-6xl lg:text-7xl">
                Conteúdo que nasce da vida.
              </h2>
              <span className="mt-7 block h-px w-32 bg-accent" />
            </MotionReveal>

            <div className="mt-8 grid gap-4 text-[0.86rem] font-normal leading-7 text-paper/68 sm:text-[0.94rem] sm:leading-7">
              {bioParagraphs.map((paragraph, index) => (
                <MotionReveal key={paragraph} delay={0.08 + index * 0.06}>
                  <p>{paragraph}</p>
                </MotionReveal>
              ))}
            </div>

            <div className="mt-9 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              {siteContent.interests.map((interest) => (
                <motion.span
                  key={interest}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  whileHover={{ y: -3, borderColor: "rgba(239,31,61,0.72)" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-full border border-paper/16 bg-paper/[0.075] px-3.5 py-2 text-center text-[0.76rem] font-medium text-paper/78 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:text-left"
                >
                  {interest}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
