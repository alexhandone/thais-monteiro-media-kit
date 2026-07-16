"use client";

import { ArrowDownRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { siteContent } from "@/lib/content";

const bioParagraphs = [
  "Thais Monteiro cria conteúdo a partir da vida real: maternidade, rotina, moda, família e os pequenos movimentos que geram identificação imediata.",
  "Sua comunicação combina leveza, humor e uma estética feminina acessível, aproximando marcas de uma comunidade que acompanha suas escolhas no dia a dia.",
  "Para parcerias, entrega narrativa autêntica com presença comercial natural, sem perder afeto, contexto e verdade.",
];

export function BioSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [reduceMotion ? 0 : 32, reduceMotion ? 0 : -34]);
  const signatureY = useTransform(scrollYProgress, [0, 1], [reduceMotion ? 0 : 52, reduceMotion ? 0 : -42]);

  return (
    <section
      ref={sectionRef}
      id="bio"
      className="relative isolate scroll-mt-24 overflow-hidden bg-[#1b1a17] text-[#f4f1ec]"
    >
      <div className="editorial-dark-grain pointer-events-none absolute inset-0 z-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px bg-white/15" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid w-full max-w-[100rem] lg:min-h-[100svh] lg:grid-cols-[minmax(22rem,0.92fr)_minmax(0,1.08fr)]">
        <div className="relative min-h-[29rem] overflow-hidden sm:min-h-[38rem] lg:h-full lg:min-h-full">
          <motion.div
            style={{ y: imageY }}
            className="absolute -inset-y-10 inset-x-0"
          >
            <Image
              src="/images/thais-editorial-bw.png"
              alt="Retrato editorial em preto e branco de Thais Monteiro"
              fill
              loading="eager"
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover object-[52%_24%] grayscale"
            />
          </motion.div>

          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,26,23,0.08)_48%,rgba(27,26,23,0.94)_100%)] lg:bg-[linear-gradient(90deg,rgba(27,26,23,0.03)_45%,rgba(27,26,23,0.94)_100%)]"
            aria-hidden="true"
          />

          <motion.p
            style={{ y: signatureY }}
            className="pointer-events-none absolute -bottom-10 left-4 select-none font-brand text-[18rem] font-normal leading-none text-white/[0.09] sm:left-8 sm:text-[25rem] lg:-bottom-20 lg:left-8 lg:text-[34rem]"
            aria-hidden="true"
          >
            T
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className="absolute left-5 top-8 flex items-center gap-3 text-[0.65rem] font-semibold tracking-[0.16em] text-white/75 sm:left-8 sm:top-10"
          >
            <span>Digital creator</span>
            <span className="h-px w-10 bg-accent" aria-hidden="true" />
            <span>Osasco, SP</span>
          </motion.div>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            className="absolute bottom-8 left-5 max-w-[18rem] font-display text-3xl font-normal leading-[0.95] text-white sm:bottom-10 sm:left-8 sm:text-4xl lg:hidden"
          >
            A vida real é o ponto de partida.
          </motion.p>
        </div>

        <div className="relative flex min-w-0 flex-col justify-center px-5 pb-14 pt-10 sm:px-10 sm:pb-16 sm:pt-14 lg:px-[clamp(3rem,5vw,6.5rem)] lg:py-14">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-5 top-8 hidden font-display text-lg font-normal text-white/42 sm:right-10 lg:block"
          >
            Biografia · Thais Monteiro
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-display text-xl font-normal text-accent sm:text-2xl">Sobre Thais</p>
            <h2 className="mt-4 max-w-[10ch] text-balance font-display text-[clamp(3rem,5.5vw,5.2rem)] font-normal leading-[0.88] text-white">
              Conteúdo que nasce da vida.
            </h2>
            <div className="mt-7 flex items-center gap-4 text-[0.64rem] tracking-[0.16em] text-white/48">
              <span className="h-px w-16 bg-accent" aria-hidden="true" />
              <span>AFETO · CONTEXTO · VERDADE</span>
            </div>
          </motion.div>

          <div className="mt-8 grid gap-5 border-t border-white/15 pt-6 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-4">
            {bioParagraphs.map((paragraph, index) => (
              <motion.p
                key={paragraph}
                initial={reduceMotion ? false : { opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 }}
                className={
                  index === 0
                    ? "text-pretty text-base leading-7 text-white/92 lg:col-span-2 lg:max-w-[52ch] lg:text-lg lg:leading-8"
                    : "text-pretty text-sm leading-7 text-white/62"
                }
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
            className="mt-8"
          >
            <div className="mb-4 flex items-center justify-between border-b border-white/15 pb-3">
              <p className="font-display text-xl font-normal text-white/88">Territórios</p>
              <ArrowDownRight className="size-4 text-accent" aria-hidden="true" />
            </div>
            <ol className="grid sm:grid-cols-2 sm:gap-x-8">
              {siteContent.interests.map((interest, index) => (
                <li
                  key={interest}
                  className="group flex items-center gap-4 border-b border-white/10 py-2.5 text-sm text-white/68 transition-colors duration-300 hover:text-white"
                >
                  <span className="text-[0.62rem] tabular-nums text-accent/80">{String(index + 1).padStart(2, "0")}</span>
                  <span>{interest}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
