import { ArrowUpRight, AtSign, Mail, MessageCircle, Phone } from "lucide-react";

import { siteContent } from "@/lib/content";
import { getWhatsAppHref } from "@/lib/whatsapp";
import { MotionReveal } from "@/components/shared/MotionReveal";

const contactLinks = [
  {
    label: "WhatsApp",
    value: siteContent.contact.phoneLabel,
    href: getWhatsAppHref(),
    icon: Phone,
    external: true,
  },
  {
    label: "E-mail",
    value: siteContent.contact.email,
    href: `mailto:${siteContent.contact.email}`,
    icon: Mail,
    external: false,
  },
  {
    label: "Instagram",
    value: siteContent.handle,
    href: siteContent.contact.instagram,
    icon: AtSign,
    external: true,
  },
] as const;

export function ContactSection() {
  return (
    <section
      id="contato"
      className="relative isolate scroll-mt-24 overflow-hidden bg-background px-5 py-20 pb-32 sm:px-8 lg:px-10 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -left-20 top-8 h-80 w-80 rounded-full bg-paper/80 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(62,60,54,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(62,60,54,0.022)_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <MotionReveal className="relative overflow-hidden rounded-lg bg-foreground p-7 text-paper shadow-[0_28px_90px_rgba(36,35,31,0.16)] sm:p-9 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 font-brand text-[15rem] leading-none text-paper/[0.055] sm:text-[19rem]">
            T
          </div>
          <div className="relative z-10 flex min-h-[25rem] flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-paper/50">
                Contato
              </p>
              <h2 className="mt-5 max-w-[10ch] font-display text-5xl font-normal leading-[0.9] sm:text-6xl">
                Vamos desenhar a próxima campanha?
              </h2>
              <p className="mt-7 max-w-md text-sm leading-7 text-paper/68 sm:text-base">
                Para convites, press kits, eventos e campanhas digitais, fale
                diretamente com a Thais pelos canais oficiais.
              </p>
            </div>

            <a
              href={getWhatsAppHref()}
              target="_blank"
              rel="noreferrer"
              className="group mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-paper shadow-[0_18px_50px_rgba(239,31,61,0.22)] transition hover:-translate-y-0.5 hover:bg-paper hover:!text-foreground"
            >
              <MessageCircle
                className="transition group-hover:text-foreground"
                size={18}
                aria-hidden="true"
              />
              <span className="transition group-hover:text-foreground">
                Iniciar conversa
              </span>
              <ArrowUpRight
                className="transition group-hover:text-foreground"
                size={16}
                aria-hidden="true"
              />
            </a>
          </div>
        </MotionReveal>

        <div className="grid gap-4">
          {contactLinks.map(({ label, value, href, icon: Icon, external }, index) => (
            <MotionReveal key={label} delay={index * 0.06} className="h-full">
              <a
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noreferrer" : undefined}
                className="group grid h-full min-w-0 grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border border-border-soft bg-paper/62 p-5 shadow-[0_18px_50px_rgba(36,35,31,0.055)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-accent/55 hover:bg-paper sm:p-6"
              >
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground text-paper transition duration-300 group-hover:bg-accent">
                  <Icon size={21} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    {label}
                  </span>
                  <span className="mt-1 block min-w-0 break-words text-base font-semibold text-foreground sm:text-lg">
                    {value}
                  </span>
                </span>
                <ArrowUpRight
                  className="shrink-0 text-muted transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-accent"
                  size={20}
                  aria-hidden="true"
                />
              </a>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
