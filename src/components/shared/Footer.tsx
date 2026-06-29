import { siteContent } from "@/lib/content";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground px-5 py-10 text-paper sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-[1fr_0.7fr_0.8fr]">
        <div>
          <p className="font-brand text-5xl font-normal leading-none tracking-normal">
            {siteContent.name}
          </p>
          <span className="mt-3 block h-1 w-28 rounded-full bg-accent" />
          <p className="mt-3 max-w-md text-sm leading-6 text-paper/65">
            {siteContent.title}
          </p>
        </div>
        <nav
          aria-label="Links rápidos"
          className="grid content-start gap-2 text-sm text-paper/75"
        >
          <a href="#inicio">Início</a>
          <a href="#bio">Biografia</a>
          <a href="#parcerias">Parcerias</a>
          <a href="#metricas">Métricas</a>
          <a href="#contato">Contato</a>
        </nav>
        <div className="text-sm leading-7 text-paper/75">
          <p>{siteContent.contact.phoneLabel}</p>
          <p>{siteContent.contact.email}</p>
          <p className="mt-5">
            &copy; {year} {siteContent.name}. Todos os direitos reservados.
          </p>
          <p>{siteContent.creatorCredit}</p>
        </div>
      </div>
    </footer>
  );
}
