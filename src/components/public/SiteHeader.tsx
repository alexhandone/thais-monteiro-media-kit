"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { siteContent } from "@/lib/content";

const links = [
  { href: "#bio", label: "Bio" },
  { href: "#parcerias", label: "Parcerias" },
  { href: "#metricas", label: "Métricas" },
  { href: "#contato", label: "Contato" },
];

type SiteHeaderProps = {
  linkPrefix?: string;
};

export function SiteHeader({ linkPrefix = "" }: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    function updateScrollState() {
      setHasScrolled(window.scrollY > 16);
    }

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
    };
  }, []);

  function closeMenu() {
    setIsOpen(false);
  }

  const glassHeader = hasScrolled || isOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] border-b px-5 py-5 text-sm text-charcoal transition-all duration-300 hover:border-white/35 hover:bg-white/55 hover:shadow-[0_18px_50px_rgba(36,35,31,0.08)] hover:backdrop-blur-xl sm:px-8 lg:px-10 ${
        glassHeader
          ? "border-white/35 bg-white/58 shadow-[0_18px_50px_rgba(36,35,31,0.08)] backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <a
          href={`${linkPrefix}#inicio`}
          onClick={closeMenu}
          className="font-brand text-3xl font-normal leading-none tracking-normal text-foreground sm:text-4xl"
        >
          {siteContent.name}
        </a>

        <nav
          aria-label="Links principais"
          className="hidden items-center gap-x-5 gap-y-2 text-xs font-medium uppercase tracking-[0.16em] text-muted md:flex"
        >
          {links.map((link) => (
            <a key={link.href} href={`${linkPrefix}${link.href}`}>
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-soft bg-white/35 text-charcoal backdrop-blur-md transition hover:bg-white/65 md:hidden"
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
        </button>
      </div>

      {isOpen ? (
        <nav
          id="mobile-navigation"
          aria-label="Links principais mobile"
          className="mx-auto mt-4 grid w-full max-w-7xl gap-2 rounded-2xl border border-white/45 bg-white/72 p-3 text-xs font-semibold uppercase tracking-[0.16em] text-charcoal shadow-[0_18px_50px_rgba(36,35,31,0.1)] backdrop-blur-xl md:hidden"
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={`${linkPrefix}${link.href}`}
              onClick={closeMenu}
              className="rounded-xl px-3 py-3 transition hover:bg-white/70"
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
