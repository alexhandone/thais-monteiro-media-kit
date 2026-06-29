import { z } from "zod";

import type { InstagramBreakdownItem } from "@/lib/instagram/types";

import type { MetricsSnapshotRow, MetricsViewModel } from "./types";

const numberFromJsonSchema = z
  .union([z.number(), z.string().min(1)])
  .transform((value) => Number(value))
  .pipe(z.number().finite());

const nullableStringSchema = z.string().nullable();

const isoDaySchema = z.string().refine(
  (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)),
  "Expected ISO date",
);

const dateTimeSchema = z.string().refine(
  (value) => !Number.isNaN(new Date(value).getTime()),
  "Expected valid date time",
);

const breakdownItemSchema = z.object({
  label: z.string().min(1),
  value: numberFromJsonSchema,
});

const metricsSnapshotSchema = z.object({
  period_start: isoDaySchema,
  period_end: isoDaySchema,
  collected_at: dateTimeSchema,
  profile: z.object({
    id: z.string(),
    username: z.string().min(1),
    name: nullableStringSchema,
    followers_count: numberFromJsonSchema,
    follows_count: numberFromJsonSchema,
    media_count: numberFromJsonSchema,
    profile_picture_url: nullableStringSchema,
  }),
  overview_metrics: z.object({
    reach: numberFromJsonSchema,
    views: numberFromJsonSchema,
    profile_views: numberFromJsonSchema,
    profile_links_taps: numberFromJsonSchema,
    accounts_engaged: numberFromJsonSchema,
    total_interactions: numberFromJsonSchema,
    follows_and_unfollows: numberFromJsonSchema,
  }),
  demographics: z.object({
    gender: z.array(breakdownItemSchema),
    age: z.array(breakdownItemSchema),
    city: z.array(breakdownItemSchema),
    country: z.array(breakdownItemSchema),
  }),
  top_content: z.array(
    z.object({
      id: z.string(),
      caption: z.string(),
      media_type: nullableStringSchema,
      media_product_type: nullableStringSchema,
      thumbnail_url: nullableStringSchema,
      media_url: nullableStringSchema,
      permalink: nullableStringSchema,
      timestamp: nullableStringSchema,
      views: numberFromJsonSchema,
      reach: numberFromJsonSchema,
      likes: numberFromJsonSchema,
      comments: numberFromJsonSchema,
      shares: numberFromJsonSchema,
      saved: numberFromJsonSchema,
      total_interactions: numberFromJsonSchema,
    }),
  ),
  raw_api_payload: z.unknown(),
}) satisfies z.ZodType<MetricsSnapshotRow>;

const ptNumberFormatter = new Intl.NumberFormat("pt-BR");
const ptShortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
});
const ptLongDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const ptDateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

function formatNumber(value: number | null | undefined): string {
  return ptNumberFormatter.format(Number(value ?? 0));
}

function dateFromIsoDay(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatPeriod(start: string, end: string): string {
  return `${ptLongDateFormatter.format(dateFromIsoDay(start))} a ${ptLongDateFormatter.format(dateFromIsoDay(end))}`;
}

function formatPublishedAt(value: string | null): string {
  if (!value) {
    return "Sem data";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Sem data"
    : ptLongDateFormatter.format(date);
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function metricValues(rawPayload: unknown, metric: "reach" | "views") {
  const raw = readRecord(rawPayload);
  const overview = readRecord(raw?.overview);
  const metricPayload = readRecord(overview?.[metric]);
  const response = readRecord(metricPayload?.data) ?? metricPayload;
  const data = Array.isArray(response?.data) ? response.data : [];
  const values: { dateKey: string; label: string; value: number }[] = [];

  for (const item of data) {
    const insight = readRecord(item);
    if (insight?.name && insight.name !== metric) {
      continue;
    }

    const insightValues = Array.isArray(insight?.values) ? insight.values : [];
    for (const valueItem of insightValues) {
      const valueRecord = readRecord(valueItem);
      const endTime = String(valueRecord?.end_time ?? "");
      const date = endTime ? new Date(endTime) : null;

      if (!date || Number.isNaN(date.getTime())) {
        continue;
      }

      values.push({
        dateKey: date.toISOString().slice(0, 10),
        label: ptShortDateFormatter.format(date),
        value: toNumber(valueRecord?.value),
      });
    }
  }

  return values;
}

function buildPerformanceSeries(rawPayload: unknown) {
  const reachValues = metricValues(rawPayload, "reach");
  const viewValues = metricValues(rawPayload, "views");
  const byDate = new Map<string, { label: string; reach: number; views: number }>();

  for (const item of reachValues) {
    byDate.set(item.dateKey, {
      label: item.label,
      reach: item.value,
      views: byDate.get(item.dateKey)?.views ?? 0,
    });
  }

  for (const item of viewValues) {
    byDate.set(item.dateKey, {
      label: byDate.get(item.dateKey)?.label ?? item.label,
      reach: byDate.get(item.dateKey)?.reach ?? 0,
      views: item.value,
    });
  }

  return [...byDate.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([, value]) => value);
}

function makeShortCaption(caption: string) {
  const normalized = repairMojibake(caption).replace(/\s+/g, " ").trim();

  if (!normalized) {
    return "Sem legenda";
  }

  return normalized.length > 110
    ? `${normalized.slice(0, 107).trimEnd()}...`
    : normalized;
}

function repairMojibake(value: string) {
  return value
    .replaceAll("Ã¡", "á")
    .replaceAll("Ã ", "à")
    .replaceAll("Ã¢", "â")
    .replaceAll("Ã£", "ã")
    .replaceAll("Ã©", "é")
    .replaceAll("Ãª", "ê")
    .replaceAll("Ã­", "í")
    .replaceAll("Ã³", "ó")
    .replaceAll("Ã´", "ô")
    .replaceAll("Ãµ", "õ")
    .replaceAll("Ãº", "ú")
    .replaceAll("Ã§", "ç")
    .replaceAll("Ã", "Á")
    .replaceAll("Ã‰", "É")
    .replaceAll("ÃŠ", "Ê")
    .replaceAll("Ã‡", "Ç")
    .replaceAll("Ã", "")
    .replaceAll("Â", "")
    .replaceAll("\uFFFD", "");
}

function toPercentageBreakdown(
  items: InstagramBreakdownItem[],
  baseValue: number,
): InstagramBreakdownItem[] {
  if (!items.some((item) => item.value > 100) || baseValue <= 0) {
    return items;
  }

  return items.map((item) => ({
    ...item,
    value: (item.value / baseValue) * 100,
  }));
}

function makeGenderLabel(label: string) {
  const normalized = label.trim().toUpperCase();

  if (normalized === "F") {
    return "Mulheres";
  }

  if (normalized === "M") {
    return "Homens";
  }

  if (normalized === "U" || normalized === "NAO INFORMADO") {
    return "Não informado";
  }

  return label;
}

function buildDemographics(
  snapshot: MetricsSnapshotRow,
): MetricsSnapshotRow["demographics"] {
  const followersCount = Number(snapshot.profile.followers_count ?? 0);

  return {
    gender: toPercentageBreakdown(
      snapshot.demographics.gender,
      followersCount,
    ).map((item) => ({ ...item, label: makeGenderLabel(item.label) })),
    age: toPercentageBreakdown(snapshot.demographics.age, followersCount),
    city: toPercentageBreakdown(snapshot.demographics.city, followersCount),
    country: toPercentageBreakdown(snapshot.demographics.country, followersCount),
  };
}

export function buildMetricsViewModel(
  snapshot: MetricsSnapshotRow,
): MetricsViewModel {
  const { profile, overview_metrics: overview } = snapshot;
  const followsAndUnfollows = Number(overview.follows_and_unfollows ?? 0);

  return {
    periodLabel: formatPeriod(snapshot.period_start, snapshot.period_end),
    collectedAtLabel: ptDateTimeFormatter.format(new Date(snapshot.collected_at)),
    profileHandle: `@${profile.username}`,
    overviewCards: [
      { label: "Seguidores", value: formatNumber(profile.followers_count) },
      { label: "Seguindo", value: formatNumber(profile.follows_count) },
      { label: "Publicações", value: formatNumber(profile.media_count) },
      { label: "Alcance", value: formatNumber(overview.reach) },
      { label: "Visualizações", value: formatNumber(overview.views) },
      { label: "Visitas ao perfil", value: formatNumber(overview.profile_views) },
      {
        label: "Cliques no link",
        value: formatNumber(overview.profile_links_taps),
      },
      { label: "Contas engajadas", value: formatNumber(overview.accounts_engaged) },
      { label: "Interações", value: formatNumber(overview.total_interactions) },
      ...(followsAndUnfollows
        ? [{ label: "Seguidores líquidos", value: formatNumber(followsAndUnfollows) }]
        : []),
    ],
    performanceSeries: buildPerformanceSeries(snapshot.raw_api_payload),
    demographics: buildDemographics(snapshot),
    topContent: snapshot.top_content.slice(0, 10).map((item, index) => ({
      ...item,
      rank: index + 1,
      publishedAtLabel: formatPublishedAt(item.timestamp),
      shortCaption: makeShortCaption(item.caption),
    })),
  };
}

export function parseMetricsSnapshot(snapshot: unknown): MetricsSnapshotRow | null {
  const parsed = metricsSnapshotSchema.safeParse(snapshot);
  return parsed.success ? parsed.data : null;
}

export function buildMetricsViewModelSafe(snapshot: unknown): MetricsViewModel | null {
  const parsedSnapshot = parseMetricsSnapshot(snapshot);
  return parsedSnapshot ? buildMetricsViewModel(parsedSnapshot) : null;
}
