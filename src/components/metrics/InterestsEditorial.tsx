import { siteContent } from "@/lib/content";

export function InterestsEditorial() {
  return (
    <section className="grid gap-6 rounded-lg bg-foreground p-6 text-paper sm:p-8 lg:grid-cols-[0.7fr_1fr]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-paper/55">
          Territórios editoriais
        </p>
        <h2 className="mt-3 font-display text-4xl font-normal leading-none">
          Contexto para marcas
        </h2>
      </div>
      <div className="flex flex-wrap gap-2 self-center">
        {siteContent.interests.map((interest) => (
          <span
            key={interest}
            className="rounded-full border border-paper/18 px-4 py-2 text-sm text-paper/80"
          >
            {interest}
          </span>
        ))}
      </div>
    </section>
  );
}
