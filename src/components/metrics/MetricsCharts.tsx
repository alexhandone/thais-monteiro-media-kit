"use client";

import { BarChart3, Clapperboard, MapPin, TrendingUp, UsersRound } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { InstagramBreakdownItem } from "@/lib/instagram/types";

import type { PerformancePoint } from "./types";

type MetricsChartsProps = {
  performanceSeries: PerformancePoint[];
  gender: InstagramBreakdownItem[];
  cities: InstagramBreakdownItem[];
  age: InstagramBreakdownItem[];
  viewFollowerType: InstagramBreakdownItem[];
  viewMediaProductType: InstagramBreakdownItem[];
};

const chartColors = ["#ef1f3d", "#f45b70", "#f08a99", "#7a1f2d", "#3e3c36"];
const cityBarColor = "#ef1f3d";
const numberFormatter = new Intl.NumberFormat("pt-BR");
const genderLabelPositions = [
  "left-[54%] top-[37%]",
  "left-[43%] top-[67%]",
  "left-[60%] top-[68%]",
  "left-[50%] top-[24%]",
  "left-[50%] top-[78%]",
];

function formatNumber(value: number) {
  return numberFormatter.format(Number(value ?? 0));
}

function formatPercent(value: unknown) {
  return `${Number(value ?? 0).toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  })}%`;
}

function cleanCityLabel(label: string) {
  return label
    .replace(/\s*\(\s*state(?:\s+of\s+[^)]*)?\s*\)/gi, "")
    .replace(/\s*,?\s*state\s+of\s+[^,;/-]+/gi, "")
    .replace(/\s*,?\s*state\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*$/g, "")
    .trim();
}

function withPercent(items: InstagramBreakdownItem[]) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return items.map((item) => ({
    ...item,
    percent: total ? (item.value / total) * 100 : 0,
  }));
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-border-soft bg-paper/45 p-6 text-center text-sm leading-6 text-muted">
      {label}
    </div>
  );
}

function ChartCard({
  title,
  icon: Icon,
  children,
  contentClassName = "h-64",
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-border-soft bg-paper p-4 sm:p-5">
      <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-muted">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
          <Icon size={15} aria-hidden />
        </span>
        <span className="truncate">{title}</span>
      </h2>
      <div className={`mt-5 min-w-0 overflow-hidden ${contentClassName}`}>
        {children}
      </div>
    </article>
  );
}

function HorizontalBreakdownChart({
  data,
  emptyLabel,
}: {
  data: InstagramBreakdownItem[];
  emptyLabel: string;
}) {
  const chartData = withPercent(data);

  if (!chartData.length) {
    return <EmptyChart label={emptyLabel} />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 4, right: 44, top: 8, bottom: 8 }}
      >
        <XAxis type="number" hide domain={[0, 100]} />
        <YAxis
          type="category"
          dataKey="label"
          width={118}
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <Tooltip
          formatter={(_, __, item) => [
            `${formatNumber(Number(item.payload.value))} visualizações`,
            formatPercent(item.payload.percent),
          ]}
          contentStyle={{ borderRadius: 8, borderColor: "rgba(62,60,54,0.18)" }}
        />
        <Bar dataKey="percent" name="Participação" fill="#ef1f3d" radius={[0, 7, 7, 0]}>
          <LabelList
            dataKey="percent"
            position="right"
            formatter={(value) => formatPercent(value)}
            className="fill-foreground text-xs font-semibold"
          />
          {chartData.map((entry, index) => (
            <Cell
              key={entry.label}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MetricsCharts({
  performanceSeries,
  gender,
  cities,
  age,
  viewFollowerType,
  viewMediaProductType,
}: MetricsChartsProps) {
  const hasDailyViews = performanceSeries.some((point) => point.views > 0);
  const cleanCities = cities.map((city) => ({
    ...city,
    label: cleanCityLabel(city.label),
  }));

  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-2">
      <ChartCard
        title={hasDailyViews ? "Alcance e visualizações" : "Alcance diário"}
        icon={TrendingUp}
      >
        {performanceSeries.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceSeries} margin={{ left: 0, right: 8 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={54}
                tickFormatter={(value) => formatNumber(Number(value))}
              />
              <Tooltip
                formatter={(value) => formatNumber(Number(value))}
                contentStyle={{ borderRadius: 8, borderColor: "rgba(62,60,54,0.18)" }}
              />
              <Area
                type="monotone"
                dataKey="reach"
                name="Alcance"
                stroke="#ef1f3d"
                fill="#ef1f3d"
                fillOpacity={0.14}
              />
              {hasDailyViews ? (
                <Area
                  type="monotone"
                  dataKey="views"
                  name="Visualizações"
                  stroke="#3e3c36"
                  fill="#3e3c36"
                  fillOpacity={0.1}
                />
              ) : null}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart label="Série diária indisponível neste snapshot." />
        )}
      </ChartCard>

      <ChartCard title="Visualizações por público" icon={UsersRound}>
        <HorizontalBreakdownChart
          data={viewFollowerType}
          emptyLabel="Participação de seguidores e não seguidores indisponível neste snapshot."
        />
      </ChartCard>

      <ChartCard title="Visualizações por formato" icon={Clapperboard}>
        <HorizontalBreakdownChart
          data={viewMediaProductType}
          emptyLabel="Visualizações por tipo de conteúdo indisponíveis neste snapshot."
        />
      </ChartCard>

      <ChartCard title="Gênero" icon={UsersRound} contentClassName="h-auto">
        {gender.length ? (
          <div className="grid gap-4">
            <div className="relative h-56 min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gender}
                    dataKey="value"
                    nameKey="label"
                    innerRadius="54%"
                    outerRadius="78%"
                    paddingAngle={3}
                  >
                    {gender.map((entry, index) => (
                      <Cell
                        key={entry.label}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatPercent(Number(value))}
                    contentStyle={{ borderRadius: 8, borderColor: "rgba(62,60,54,0.18)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {gender.map((entry, index) => (
                <span
                  key={`${entry.label}-label`}
                  className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/82 px-2 py-1 text-[0.68rem] font-bold leading-none text-paper shadow-[0_8px_20px_rgba(0,0,0,0.16)] ${
                    genderLabelPositions[index % genderLabelPositions.length]
                  }`}
                >
                  {formatPercent(entry.value)}
                </span>
              ))}
            </div>
            <ul className="grid gap-2 text-sm text-muted sm:grid-cols-2">
              {gender.map((entry, index) => (
                <li
                  key={entry.label}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-md bg-background/60 px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <span className="truncate">{entry.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyChart label="Dados de gênero indisponíveis." />
        )}
      </ChartCard>

      <ChartCard title="Top cidades" icon={MapPin}>
        {cleanCities.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={cleanCities}
              layout="vertical"
              margin={{ left: 12, right: 42, top: 8, bottom: 8 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                width={96}
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(value) => cleanCityLabel(String(value))}
              />
              <Tooltip
                formatter={(value) => formatPercent(Number(value))}
                labelFormatter={(value) => cleanCityLabel(String(value))}
                contentStyle={{ borderRadius: 8, borderColor: "rgba(62,60,54,0.18)" }}
              />
              <Bar dataKey="value" name="Público" fill={cityBarColor} radius={[0, 6, 6, 0]}>
                <LabelList
                  dataKey="value"
                  position="right"
                  formatter={(value) => formatPercent(value)}
                  className="fill-foreground text-xs font-semibold"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart label="Dados de cidade indisponíveis." />
        )}
      </ChartCard>

      <ChartCard title="Faixa etária" icon={BarChart3}>
        {age.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={age} margin={{ left: 0, right: 24, top: 8, bottom: 8 }}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                width={42}
                tickFormatter={(value) => formatPercent(Number(value))}
              />
              <Tooltip
                formatter={(value) => formatPercent(Number(value))}
                contentStyle={{ borderRadius: 8, borderColor: "rgba(62,60,54,0.18)" }}
              />
              <Bar dataKey="value" name="Público" fill="#ef1f3d" radius={[6, 6, 0, 0]}>
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(value) => formatPercent(value)}
                  className="fill-foreground text-xs font-semibold"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart label="Dados de idade indisponíveis." />
        )}
      </ChartCard>
    </section>
  );
}
