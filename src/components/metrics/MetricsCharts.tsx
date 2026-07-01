"use client";

import { useState } from "react";
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
  countries: InstagramBreakdownItem[];
  age: InstagramBreakdownItem[];
  viewFollowerType: InstagramBreakdownItem[];
  viewMediaProductType: InstagramBreakdownItem[];
  interactionMediaProductType: InstagramBreakdownItem[];
};

type FormatMetricMode = "views" | "interactions";
type FormatAudienceMode = "all" | "followers" | "nonFollowers";
type LocationMode = "cities" | "countries";

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

function cleanCountryLabel(label: string) {
  const countries = new Intl.DisplayNames(["pt-BR"], { type: "region" });
  const normalized = label.trim().toUpperCase();

  if (/^[A-Z]{2}$/.test(normalized)) {
    return countries.of(normalized) ?? label;
  }

  return label.trim();
}

function withPercent(items: InstagramBreakdownItem[]) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return items.map((item) => ({
    ...item,
    percent: total ? (item.value / total) * 100 : 0,
  }));
}

function withoutUnreported(items: InstagramBreakdownItem[]) {
  return items.filter((item) => item.label.trim().toLowerCase() !== "não informado");
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

function ExternalTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: { label?: string; percent?: number; value?: number } }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;

  if (!item) {
    return null;
  }

  return (
    <div className="rounded-md border border-border-soft bg-paper px-3 py-2 text-xs shadow-[0_12px_30px_rgba(36,35,31,0.14)]">
      <p className="font-semibold text-foreground">{item.label}</p>
      <p className="mt-1 text-muted">
        {formatPercent(item.percent)} · {formatNumber(Number(item.value ?? 0))}
      </p>
    </div>
  );
}

function DailyPerformanceChart({ data }: { data: PerformancePoint[] }) {
  if (!data.length) {
    return <EmptyChart label="Série diária indisponível neste snapshot." />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ left: 0, right: 8 }}>
        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          width={54}
          tickFormatter={(value) => formatNumber(Number(value))}
        />
        <Tooltip
          formatter={(value) => [formatNumber(Number(value)), "Alcance"]}
          contentStyle={{ borderRadius: 8, borderColor: "rgba(62,60,54,0.18)" }}
        />
        <Area
          type="monotone"
          dataKey="reach"
          name="Alcance"
          stroke="#ef1f3d"
          fill="#ef1f3d"
          fillOpacity={0.16}
        />
      </AreaChart>
    </ResponsiveContainer>
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

function FormatBreakdownChart({
  views,
  interactions,
}: {
  views: InstagramBreakdownItem[];
  interactions: InstagramBreakdownItem[];
}) {
  const [metricMode, setMetricMode] = useState<FormatMetricMode>("views");
  const [audienceMode, setAudienceMode] = useState<FormatAudienceMode>("all");
  const isInteractionMode = metricMode === "interactions";
  const data = isInteractionMode ? interactions : views;
  const metricModes: Array<{ key: FormatMetricMode; label: string }> = [
    { key: "views", label: "Visualizações" },
    { key: "interactions", label: "Interações" },
  ];
  const audienceModes: Array<{ key: FormatAudienceMode; label: string }> = [
    { key: "all", label: "Total" },
    { key: "followers", label: "Seguidores" },
    { key: "nonFollowers", label: "Não seguidores" },
  ];

  return (
    <div className="grid h-full gap-3">
      <div className="flex flex-wrap gap-1.5">
        {metricModes.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMetricMode(item.key)}
            className={`rounded-full border px-2 py-0.5 text-[0.52rem] font-semibold uppercase tracking-[0.04em] transition sm:px-2.5 sm:py-1 sm:text-[0.62rem] sm:tracking-[0.1em] ${
              metricMode === item.key
                ? "border-accent bg-accent text-white"
                : "border-border-soft bg-background/50 text-muted hover:border-accent/45 hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-border-soft/80 pt-2">
        {audienceModes.map((item) => {
          const disabled = isInteractionMode && item.key !== "all";

          return (
            <button
              key={item.key}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  setAudienceMode(item.key);
                }
              }}
              className={`rounded-full border px-2 py-0.5 text-[0.5rem] font-semibold uppercase tracking-[0.04em] transition sm:px-2.5 sm:py-1 sm:text-[0.58rem] sm:tracking-[0.08em] ${
                audienceMode === item.key && !disabled
                  ? "border-foreground/30 bg-foreground text-paper"
                  : "border-border-soft bg-background/50 text-muted hover:border-accent/45 hover:text-foreground"
              } ${disabled ? "cursor-not-allowed opacity-45 hover:border-border-soft hover:text-muted" : ""}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="min-h-56 flex-1 overflow-hidden sm:min-h-52">
        <HorizontalBreakdownChart
          data={data}
          emptyLabel={
            isInteractionMode
              ? "Interações por formato indisponíveis neste snapshot."
              : "Visualizações por tipo de conteúdo indisponíveis neste snapshot."
          }
        />
      </div>
      {audienceMode !== "all" && !isInteractionMode ? (
        <p className="text-xs leading-5 text-muted">
          A Meta disponibiliza o recorte por seguidores e não seguidores para o
          total de visualizações. O cruzamento com formato depende de confirmação
          da API.
        </p>
      ) : null}
    </div>
  );
}

function LocationBreakdownChart({
  cities,
  countries,
}: {
  cities: InstagramBreakdownItem[];
  countries: InstagramBreakdownItem[];
}) {
  const [mode, setMode] = useState<LocationMode>("cities");
  const data = mode === "cities" ? cities : countries;
  const modes: Array<{ key: LocationMode; label: string }> = [
    { key: "cities", label: "Cidades" },
    { key: "countries", label: "Países" },
  ];

  return (
    <div className="grid h-full gap-3">
      <div className="flex flex-wrap gap-1.5">
        {modes.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMode(item.key)}
            className={`rounded-full border px-2 py-0.5 text-[0.52rem] font-semibold uppercase tracking-[0.04em] transition sm:px-2.5 sm:py-1 sm:text-[0.62rem] sm:tracking-[0.1em] ${
              mode === item.key
                ? "border-accent bg-accent text-white"
                : "border-border-soft bg-background/50 text-muted hover:border-accent/45 hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="min-h-52 flex-1">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
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
              />
              <Tooltip
                formatter={(value) => formatPercent(Number(value))}
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
          <EmptyChart
            label={
              mode === "cities"
                ? "Dados de cidade indisponíveis."
                : "Dados de país indisponíveis."
            }
          />
        )}
      </div>
    </div>
  );
}

function AudienceDonutChart({
  data,
  emptyLabel,
}: {
  data: InstagramBreakdownItem[];
  emptyLabel: string;
}) {
  const chartData = withPercent(data);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!chartData.length) {
    return <EmptyChart label={emptyLabel} />;
  }

  return (
    <div className="grid h-full min-h-64 min-w-0 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_0.82fr]">
      <div className="relative h-56 min-w-0 overflow-hidden sm:h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={3}
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.label}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              position={{ x: 8, y: 8 }}
              allowEscapeViewBox={{ x: true, y: true }}
              content={<ExternalTooltip />}
              wrapperStyle={{ pointerEvents: "none" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-muted">
              Total
            </p>
            <p className="mt-1 text-lg font-semibold leading-none text-foreground">
              {formatNumber(total)}
            </p>
          </div>
        </div>
      </div>
      <ul className="grid gap-2 text-sm text-muted">
        {chartData.map((entry, index) => (
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
            <strong className="shrink-0 text-foreground">
              {formatPercent(entry.percent)}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MetricsCharts({
  performanceSeries,
  gender,
  cities,
  countries,
  age,
  viewFollowerType,
  viewMediaProductType,
  interactionMediaProductType,
}: MetricsChartsProps) {
  const reportedGender = withoutUnreported(gender);
  const cleanCities = cities.map((city) => ({
    ...city,
    label: cleanCityLabel(city.label),
  }));
  const cleanCountries = countries.map((country) => ({
    ...country,
    label: cleanCountryLabel(country.label),
  }));

  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-2">
      <ChartCard
        title="Alcance diário"
        icon={TrendingUp}
      >
        <DailyPerformanceChart data={performanceSeries} />
      </ChartCard>

      <ChartCard title="Visualizações por público" icon={UsersRound} contentClassName="h-auto">
        <AudienceDonutChart
          data={viewFollowerType}
          emptyLabel="Participação de seguidores e não seguidores indisponível neste snapshot."
        />
      </ChartCard>

      <ChartCard title="Visualizações por formato" icon={Clapperboard}>
        <FormatBreakdownChart
          views={viewMediaProductType}
          interactions={interactionMediaProductType}
        />
      </ChartCard>

      <ChartCard title="Gênero" icon={UsersRound} contentClassName="h-auto">
        {reportedGender.length ? (
          <div className="grid gap-4">
            <div className="relative h-56 min-w-0 overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportedGender}
                    dataKey="value"
                    nameKey="label"
                    innerRadius="54%"
                    outerRadius="78%"
                    paddingAngle={3}
                  >
                    {reportedGender.map((entry, index) => (
                      <Cell
                        key={entry.label}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ x: 8, y: 8 }}
                    allowEscapeViewBox={{ x: true, y: true }}
                    content={<ExternalTooltip />}
                    wrapperStyle={{ pointerEvents: "none" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {reportedGender.map((entry, index) => (
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
              {reportedGender.map((entry, index) => (
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

      <ChartCard title="Top localizações" icon={MapPin}>
        <LocationBreakdownChart cities={cleanCities} countries={cleanCountries} />
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
