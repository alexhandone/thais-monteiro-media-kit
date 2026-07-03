"use client";

import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Heart,
  ImageIcon,
  MessageCircle,
  RadioTower,
  Share2,
  Sigma,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { RankedContentItem } from "./types";

type ContentRankingProps = {
  items: RankedContentItem[];
};

type MetricKey =
  | "views"
  | "reach"
  | "likes"
  | "comments"
  | "shares"
  | "saved";

const metricOptions: { key: MetricKey; label: string; totalLabel: string }[] = [
  { key: "views", label: "Visualizações", totalLabel: "Total de visualizações" },
  { key: "reach", label: "Alcance", totalLabel: "Total de alcance" },
  { key: "likes", label: "Curtidas", totalLabel: "Total de curtidas" },
  { key: "comments", label: "Comentários", totalLabel: "Total de comentários" },
  {
    key: "shares",
    label: "Compartilhamentos",
    totalLabel: "Total de compartilhamentos",
  },
  { key: "saved", label: "Salvamentos", totalLabel: "Total de salvamentos" },
];

const metricIconByKey = {
  views: Eye,
  reach: RadioTower,
  likes: Heart,
  comments: MessageCircle,
  shares: Share2,
  saved: Bookmark,
} satisfies Record<
  MetricKey,
  React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>
>;

const numberFormatter = new Intl.NumberFormat("pt-BR");
const compactFormatter = new Intl.NumberFormat("pt-BR", { notation: "compact" });

function formatMetric(value: number) {
  return compactFormatter.format(value);
}

function formatFullMetric(value: number) {
  return numberFormatter.format(value);
}

function MetricIcon({
  metricKey,
  className,
}: {
  metricKey: MetricKey;
  className?: string;
}) {
  const Icon = metricIconByKey[metricKey];

  return <Icon size={13} className={className} aria-hidden />;
}

function metricTotal(items: RankedContentItem[], key: MetricKey) {
  return items.reduce((total, item) => total + Number(item[key] ?? 0), 0);
}

export function ContentRanking({ items }: ContentRankingProps) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("views");

  const totals = useMemo(
    () =>
      metricOptions.map((metric) => ({
        ...metric,
        value: metricTotal(items, metric.key),
      })),
    [items],
  );

  const sortedItems = useMemo(
    () =>
      [...items]
        .sort((first, second) => second[activeMetric] - first[activeMetric])
        .map((item, index) => ({ ...item, displayRank: index + 1 })),
    [activeMetric, items],
  );

  const activeOption =
    metricOptions.find((metric) => metric.key === activeMetric) ?? metricOptions[0];

  return (
    <section className="w-full min-w-0 max-w-full">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
              <ImageIcon size={14} aria-hidden />
            </span>
            Conteúdos
          </p>
          <h2 className="mt-2 font-display text-4xl font-normal">
            Top 10 do período
          </h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-muted">
          Filtre por objetivo da campanha para ver quais conteúdos performaram
          melhor em cada métrica.
        </p>
      </div>

      {items.length ? (
        <div className="grid w-full min-w-0 max-w-full gap-5">
          <article className="w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-border-soft bg-paper p-4 sm:p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                <Sigma size={14} aria-hidden />
              </span>
              Totais do top 10 no período
            </p>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-muted">
              Soma calculada apenas com os 10 conteúdos de maior desempenho no
              período selecionado.
            </p>
            <div className="mt-4 grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
              {totals.map((metric) => (
                <button
                  key={metric.key}
                  type="button"
                  onClick={() => setActiveMetric(metric.key)}
                  className={`min-w-0 rounded-lg border p-3 text-left transition ${
                    activeMetric === metric.key
                      ? "border-accent bg-accent text-paper"
                      : "border-border-soft bg-background/55 text-foreground hover:border-accent/55"
                  }`}
                >
                  <span
                    className={`flex min-w-0 items-start gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.12em] ${
                      activeMetric === metric.key ? "text-paper/70" : "text-muted"
                    }`}
                  >
                    <MetricIcon metricKey={metric.key} className="mt-0.5 shrink-0" />
                    <span className="min-w-0 break-words">{metric.totalLabel}</span>
                  </span>
                  <strong className="mt-2 block break-words text-xl leading-none">
                    {formatFullMetric(metric.value)}
                  </strong>
                </button>
              ))}
            </div>
          </article>

          <div className="relative w-full min-w-0 max-w-full overflow-hidden">
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-8 items-center bg-gradient-to-r from-background to-transparent text-muted sm:hidden"
              aria-hidden="true"
            >
              <ChevronLeft size={16} />
            </div>
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 flex w-10 items-center justify-end bg-gradient-to-l from-background to-transparent text-muted sm:hidden"
              aria-hidden="true"
            >
              <ChevronRight size={16} />
            </div>
            <div className="scrollbar-minimal flex w-full min-w-0 max-w-full gap-2 overflow-x-auto px-6 pb-1 sm:px-0">
              {metricOptions.map((metric) => (
                <button
                  key={metric.key}
                  type="button"
                  onClick={() => setActiveMetric(metric.key)}
                  className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
                    activeMetric === metric.key
                      ? "border-accent bg-accent text-paper"
                      : "border-border-soft bg-paper text-charcoal hover:border-accent/60"
                  }`}
                >
                  <MetricIcon metricKey={metric.key} className="shrink-0" />
                  {metric.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            {sortedItems.map((item) => (
              <article
                key={item.id}
                className="grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] gap-3 rounded-lg border border-border-soft bg-paper p-3 sm:grid-cols-[5.5rem_minmax(0,1fr)_8rem] sm:p-4"
              >
                <div className="relative aspect-square overflow-hidden rounded-md bg-background">
                  {item.thumbnail_url || item.media_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail_url ?? item.media_url ?? ""}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-muted">
                      <ImageIcon size={30} aria-hidden="true" />
                    </div>
                  )}
                  <span className="absolute left-2 top-2 rounded bg-foreground px-2 py-1 text-xs font-semibold text-paper">
                    #{item.displayRank}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    <span>{item.media_product_type ?? item.media_type ?? "Post"}</span>
                    <span>{item.publishedAtLabel}</span>
                  </div>
                  <p className="mt-2 max-h-12 overflow-hidden text-sm leading-6 text-foreground">
                    {item.shortCaption}
                  </p>

                    {item.permalink ? (
                      <a
                        href={item.permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent"
                      >
                        Instagram
                        <ExternalLink size={13} aria-hidden="true" />
                      </a>
                    ) : null}
                </div>

                <div className="col-span-2 grid content-center rounded-md bg-background/70 px-3 py-2 sm:col-span-1">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-muted">
                    {activeOption.label}
                  </p>
                  <p className="mt-1 text-xl font-semibold leading-none text-foreground">
                    {formatMetric(item[activeMetric])}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border-soft bg-paper p-6 text-sm text-muted">
          Nenhum conteúdo ranqueado neste snapshot.
        </div>
      )}
    </section>
  );
}
