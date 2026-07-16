import { ArrowUpRight, AtSign, Mail, MessageCircle, Phone } from "lucide-react";

import { MotionReveal } from "@/components/shared/MotionReveal";
import { siteContent } from "@/lib/content";
import { getWhatsAppHref } from "@/lib/whatsapp";

const contactLinks = [
  { label: "WhatsApp", value: siteContent.contact.phoneLabel, href: getWhatsAppHref(), icon: Phone, external: true },
  { label: "E-mail", value: siteContent.contact.email, href: `mailto:${siteContent.contact.email}`, icon: Mail, external: false },
  { label: "Instagram", value: siteContent.handle, href: siteContent.contact.instagram, icon: AtSign, external: true },
] as const;

export function ContactSection() {
  return (
    <section
      id="contato"
      className="relative isolate flex min-h-[92svh] scroll-mt-24 flex-col justify-center overflow-hidden border-t border-foreground/10 bg-[#e8e6e1] px-5 py-16 pb-24 sm:px-8 sm:py-20 lg:px-10 lg:py-14"
    >
      <div className="editorial-light-grain pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 -z-10 font-brand text-[18rem] leading-none text-foreground/[0.035] sm:text-[28rem]" aria-hidden="true">T</div>

      <div className="mx-auto grid w-full max-w-[92rem] gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-end lg:gap-20">
        <MotionReveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent sm:text-sm">Contato</p>
          <h2 className="mt-3 max-w-[10ch] text-balance font-display text-[clamp(3.4rem,7vw,6rem)] font-normal leading-[0.87] text-foreground">
            Vamos criar algo que faça sentido?
          </h2>
          <p className="mt-7 max-w-xl text-pretty text-sm leading-7 text-muted sm:text-base">
            Convites, campanhas, eventos e projetos especiais começam por uma boa conversa.
          </p>

          <a
            href={getWhatsAppHref()}
            target="_blank"
            rel="noreferrer"
            className="group mt-8 inline-flex h-12 items-center gap-3 bg-accent px-5 text-sm font-semibold !text-paper transition hover:bg-foreground hover:!text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Iniciar conversa
            <ArrowUpRight className="transition group-hover:translate-x-1 group-hover:-translate-y-1" size={17} aria-hidden="true" />
          </a>
        </MotionReveal>

        <div className="border-t border-foreground/22">
          {contactLinks.map(({ label, value, href, icon: Icon, external }, index) => (
            <MotionReveal key={label} delay={index * 0.05}>
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="group grid min-w-0 grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-foreground/22 py-5 sm:py-6"
              >
                <span className="grid size-10 place-items-center rounded-full bg-foreground text-paper transition group-hover:bg-accent">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</span>
                  <span className="mt-1 block min-w-0 break-words text-base font-semibold text-foreground sm:text-lg">{value}</span>
                </span>
                <ArrowUpRight className="shrink-0 text-muted transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent" size={20} aria-hidden="true" />
              </a>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
