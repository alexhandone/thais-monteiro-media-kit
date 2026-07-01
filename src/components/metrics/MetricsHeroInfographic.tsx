import Image from "next/image";
import {
  Activity,
  BarChart3,
  FileText,
  Eye,
  MousePointerClick,
  RadioTower,
  Users,
} from "lucide-react";

import type { OverviewCard } from "./types";

type MetricsHeroInfographicProps = {
  periodLabel: string;
  collectedAtLabel: string;
  profileHandle: string;
  cards: OverviewCard[];
};

const primaryMetricLabels = [
  "Seguidores",
  "Alcance",
  "VisualizaÃ§Ãµes",
  "Visitas ao perfil",
  "Contas engajadas",
  "InteraÃ§Ãµes",
];

const secondaryMetricLabels = [
  "PublicaÃ§Ãµes",
  "Seguindo",
  "Cliques no link",
  "Seguidores lÃ­quidos",
  "Visualizações de reels e posts",
  "Visualizações de não seguidores",
];

const metricPositions = [
  {
    position:
      "left-0 top-[5.5rem] lg:left-40 lg:top-[5.75rem]",
    line: "lg:left-full lg:top-1/2 lg:h-px lg:w-32 lg:origin-left lg:rotate-[19deg]",
    lineTone: "bg-gradient-to-r from-foreground/20 to-transparent",
  },
  {
    position:
      "left-0 top-[16.4rem] lg:left-48 lg:top-[15.5rem]",
    line: "lg:left-full lg:top-1/2 lg:h-px lg:w-24 lg:origin-left lg:rotate-[-4deg]",
    lineTone: "bg-gradient-to-r from-foreground/18 to-transparent",
  },
  {
    position:
      "left-0 top-[25.4rem] lg:left-40 lg:top-[25.25rem]",
    line: "lg:left-full lg:top-1/2 lg:h-px lg:w-32 lg:origin-left lg:rotate-[-19deg]",
    lineTone: "bg-gradient-to-r from-foreground/20 to-transparent",
  },
  {
    position:
      "right-0 top-[7.25rem] lg:right-40 lg:top-[6rem]",
    line: "lg:right-full lg:top-1/2 lg:h-px lg:w-32 lg:origin-right lg:rotate-[-19deg]",
    lineTone: "bg-gradient-to-l from-foreground/20 to-transparent",
  },
  {
    position:
      "right-0 top-[18.1rem] lg:right-48 lg:top-[15.75rem]",
    line: "lg:right-full lg:top-1/2 lg:h-px lg:w-24 lg:origin-right lg:rotate-[4deg]",
    lineTone: "bg-gradient-to-l from-foreground/18 to-transparent",
  },
  {
    position:
      "right-0 top-[26.7rem] lg:right-40 lg:top-[25.5rem]",
    line: "lg:right-full lg:top-1/2 lg:h-px lg:w-32 lg:origin-right lg:rotate-[19deg]",
    lineTone: "bg-gradient-to-l from-foreground/20 to-transparent",
  },
];

const metricIcons = [Users, RadioTower, BarChart3, Eye, MousePointerClick, Activity];
const secondaryMetricIcons = [FileText, Users, MousePointerClick, Activity];

function compactLabel(label: string) {
  if (label === "Visitas ao perfil") {
    return "Visitas";
  }

  if (label === "Contas engajadas") {
    return "Engajadas";
  }

  return label;
}

function normalizeMetricLabel(label: string) {
  return label
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replaceAll("ÃƒÂ§", "c")
    .replaceAll("ÃƒÂµ", "o")
    .replaceAll("ÃƒÂ­", "i")
    .toLowerCase();
}

function findCard(cards: OverviewCard[], label: string) {
  const normalizedLabel = normalizeMetricLabel(label);

  return cards.find((card) => normalizeMetricLabel(card.label) === normalizedLabel);
}

function MetricCallout({
  card,
  index,
}: {
  card: OverviewCard;
  index: number;
}) {
  const position = metricPositions[index];
  const Icon = metricIcons[index % metricIcons.length];

  return (
    <article
      className={`group absolute z-20 w-fit max-w-[47%] border border-white/35 bg-paper/42 px-2.5 py-2 shadow-[0_18px_45px_rgba(36,35,31,0.08)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-accent/45 hover:bg-white/72 sm:px-3 sm:py-2.5 lg:max-w-none lg:border-foreground/10 lg:bg-paper/78 ${position.position}`}
      style={{ animationDelay: `${120 + index * 90}ms` }}
    >
      <span
        aria-hidden="true"
        className={`absolute hidden transition lg:block ${position.lineTone} ${position.line}`}
      />
      <div className="flex items-center gap-2">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/10 text-accent sm:h-6 sm:w-6">
          <Icon size={12} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <p className="whitespace-nowrap text-[0.48rem] font-semibold uppercase tracking-[0.18em] text-muted sm:text-[0.54rem]">
          {compactLabel(card.label)}
        </p>
      </div>
      <p className="mt-1.5 whitespace-nowrap text-base font-semibold leading-none text-foreground sm:text-xl lg:text-2xl">
        {card.value}
      </p>
    </article>
  );
}

export function MetricsHeroInfographic({
  periodLabel,
  collectedAtLabel,
  profileHandle,
  cards,
}: MetricsHeroInfographicProps) {
  const primaryCards = primaryMetricLabels
    .map((label) => findCard(cards, label))
    .filter((card): card is OverviewCard => Boolean(card));
  const secondaryCards = secondaryMetricLabels
    .map((label) => findCard(cards, label))
    .filter((card): card is OverviewCard => Boolean(card));

  return (
    <section
      aria-labelledby="metrics-hero-title"
      className="relative ml-[calc(50%-50vw)] min-h-screen w-screen overflow-hidden bg-paper px-5 pb-8 pt-28 sm:px-8 sm:pb-9 sm:pt-30 lg:px-10 lg:pb-10 lg:pt-30"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.42]"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(36,35,31,0.18) 0 1px, transparent 1px), linear-gradient(120deg, rgba(239,31,61,0.12), transparent 38%, rgba(62,60,54,0.08))",
          backgroundSize: "18px 18px, 100% 100%",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[9.5rem] h-72 w-72 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl sm:top-[10rem] sm:h-96 sm:w-96 lg:top-[12rem]"
      />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-6">
        <div className="grid items-start gap-5 sm:grid-cols-[0.8fr_1.4fr_0.8fr]">
          <div className="text-xs leading-5 text-muted sm:text-sm">
            <p className="font-semibold uppercase tracking-[0.22em] text-foreground">
              PerÃ­odo
            </p>
            <p>{periodLabel}</p>
          </div>
          <div className="text-left sm:text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
              Instagram - Ãºltimos 30 dias
            </p>
            <h1
              id="metrics-hero-title"
              className="mt-2 font-editorial text-[3.35rem] font-normal leading-[0.86] text-foreground sm:text-7xl lg:text-8xl"
            >
              Painel AnalÃ­tico
            </h1>
            <p className="mt-2 text-sm font-medium text-muted">{profileHandle}</p>
          </div>
          <div className="text-xs leading-5 text-muted sm:text-right sm:text-sm">
            <p className="font-semibold uppercase tracking-[0.22em] text-foreground">
              Coleta
            </p>
            <p>{collectedAtLabel}</p>
          </div>
        </div>

        <div className="relative mx-auto h-[37rem] w-full max-w-6xl sm:h-[40rem] lg:h-[35rem]">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[2rem] h-[33rem] w-[24rem] -translate-x-1/2 opacity-35 sm:w-[31rem] lg:top-0 lg:w-[36rem]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(36,35,31,0.38) 0 1.5px, transparent 1.5px)",
              backgroundSize: "13px 13px",
              maskImage:
                "radial-gradient(ellipse at center, black 0 55%, transparent 74%)",
            }}
          />

          <div className="absolute left-1/2 top-[-2.2rem] z-10 w-[26rem] -translate-x-1/2 sm:top-[-1rem] sm:w-[23rem] lg:-top-16 lg:w-[28rem]">
            <Image
              src="/images/thais-metrics-look.png"
              alt="Thais Monteiro"
              width={640}
              height={960}
              priority
              className="h-auto w-full drop-shadow-[0_28px_45px_rgba(36,35,31,0.18)]"
            />
          </div>

          {primaryCards.map((card, index) => (
            <MetricCallout key={card.label} card={card} index={index} />
          ))}
        </div>

        {secondaryCards.length ? (
          <div className="grid gap-2 border-t border-foreground/10 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {secondaryCards.map((card) => (
              <article
                key={card.label}
                className="flex min-w-0 items-center justify-between gap-4 bg-background/42 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="flex min-w-0 items-center gap-2 truncate text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted">
                    {(() => {
                      const Icon =
                        secondaryMetricIcons[
                          secondaryCards.findIndex((item) => item.label === card.label) %
                            secondaryMetricIcons.length
                        ];
                      return <Icon size={13} className="shrink-0 text-accent" aria-hidden="true" />;
                    })()}
                    <span className="truncate">{card.label}</span>
                  </p>
                  {card.changeLabel ? (
                    <p className="mt-1 text-xs font-medium text-emerald-700">
                      {card.changeLabel}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-lg font-semibold text-foreground">
                  {card.value}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
