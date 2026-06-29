import type { OverviewCard } from "./types";

type OverviewCardsProps = {
  cards: OverviewCard[];
};

export function OverviewCards({ cards }: OverviewCardsProps) {
  return (
    <section
      aria-label="Resumo de métricas"
      className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-5"
    >
      {cards.map((card, index) => (
        <article
          key={card.label}
          className={`min-w-0 rounded-lg border p-4 ${
            index === 0
              ? "border-foreground bg-foreground text-paper"
              : index === 3 || index === 4
                ? "border-accent/35 bg-accent/10"
                : "border-border-soft bg-paper"
          }`}
        >
          <p
            className={`break-words text-xs font-semibold uppercase tracking-[0.18em] ${
              index === 0 ? "text-paper/58" : "text-muted"
            }`}
          >
            {card.label}
          </p>
          <p className="mt-3 break-words text-2xl font-semibold leading-none sm:text-3xl">
            {card.value}
          </p>
        </article>
      ))}
    </section>
  );
}
