"use client";

import {
  HeartHandshake,
  Link2,
  MessageCircle,
  PlaySquare,
  Repeat2,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { StoriesSummary } from "./types";

type StoriesInsightsProps = {
  stories: StoriesSummary;
};

const numberFormatter = new Intl.NumberFormat("pt-BR");

function formatNumber(value: number) {
  return numberFormatter.format(Number(value ?? 0));
}

export function StoriesInsights({ stories }: StoriesInsightsProps) {
  const cards = [
    {
      label: "Stories analisados",
      value: formatNumber(stories.totalStories),
      icon: PlaySquare,
    },
    {
      label: "Total de visualizações",
      value: formatNumber(stories.totalViews),
      icon: TrendingUp,
    },
    {
      label: "Média de visualizações",
      value: formatNumber(stories.averageViewsPerStory),
      icon: TrendingUp,
    },
    {
      label: "Alcance médio",
      value: formatNumber(stories.averageReachPerStory),
      icon: TrendingUp,
    },
    {
      label: "Interações",
      value: formatNumber(stories.totalInteractions),
      icon: HeartHandshake,
    },
    {
      label: "Respostas",
      value: formatNumber(stories.totalReplies),
      icon: MessageCircle,
    },
    {
      label: "Compartilhamentos",
      value: formatNumber(stories.totalShares),
      icon: Repeat2,
    },
    {
      label: "Cliques em links",
      value: formatNumber(stories.totalLinkClicks),
      icon: Link2,
    },
  ];

  return (
    <section className="rounded-lg border border-border-soft bg-paper p-5 sm:p-6">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">
            Stories
          </p>
          <h2 className="mt-2 font-editorial text-4xl font-normal leading-none text-foreground sm:text-5xl">
            Performance em stories
          </h2>
        </div>
        <p className="text-sm leading-6 text-muted">
          Leitura dos últimos 30 dias para campanhas que usam sequência de
          stories, links, respostas e interações como principal ponto de
          conversão.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="rounded-lg border border-border-soft bg-background/50 p-4"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-accent/10 text-accent">
                  <Icon size={15} aria-hidden />
                </span>
                {card.label}
              </div>
              <p className="mt-4 text-3xl font-semibold leading-none text-foreground">
                {card.value}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mt-6 h-72 overflow-hidden rounded-lg border border-border-soft bg-background/45 p-4">
        {stories.daily.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stories.daily} margin={{ left: 0, right: 8 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={54}
                tickFormatter={(value) => formatNumber(Number(value))}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatNumber(Number(value)),
                  name === "linkClicks" ? "Cliques em links" : "Visualizações",
                ]}
                contentStyle={{ borderRadius: 8, borderColor: "rgba(62,60,54,0.18)" }}
              />
              <Area
                type="monotone"
                dataKey="views"
                name="Visualizações"
                stroke="#ef1f3d"
                fill="#ef1f3d"
                fillOpacity={0.14}
              />
              <Area
                type="monotone"
                dataKey="linkClicks"
                name="Cliques em links"
                stroke="#3e3c36"
                fill="#3e3c36"
                fillOpacity={0.08}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center text-center text-sm leading-6 text-muted">
            Ainda não há histórico de stories suficiente. A seção começa a
            preencher após as coletas diárias.
          </div>
        )}
      </div>
    </section>
  );
}
