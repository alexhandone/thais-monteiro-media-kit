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

const optionalBreakdownSchema = z.array(breakdownItemSchema).optional().default([]);

const storyMetricItemSchema = z.object({
  story_id: z.string().min(1),
  collected_on: isoDaySchema,
  collected_at: dateTimeSchema,
  story_timestamp: dateTimeSchema.nullable(),
  media_type: nullableStringSchema,
  media_url: nullableStringSchema,
  permalink: nullableStringSchema,
  metrics: z.object({
    views: numberFromJsonSchema,
    reach: numberFromJsonSchema,
    replies: numberFromJsonSchema,
    shares: numberFromJsonSchema,
    total_interactions: numberFromJsonSchema,
    navigation: numberFromJsonSchema,
    link_clicks: numberFromJsonSchema,
  }),
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
    website_clicks: numberFromJsonSchema.optional().default(0),
    accounts_engaged: numberFromJsonSchema,
    total_interactions: numberFromJsonSchema,
    follows_and_unfollows: numberFromJsonSchema,
    follows_and_unfollows_by_type: optionalBreakdownSchema,
    views_by_follower_type: optionalBreakdownSchema,
    views_by_media_product_type: optionalBreakdownSchema,
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
  stories: z.array(storyMetricItemSchema).optional().default([]),
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

function formatIsoDayLabel(value: string): string {
  return ptShortDateFormatter.format(dateFromIsoDay(value));
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
  const metricPayload = readRecord(
    metric === "views" ? overview?.views_daily ?? overview?.views : overview?.[metric],
  );
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

function repairMojibake(value: string) {
  let repaired = value;

  for (let index = 0; index < 2 && /[ÃÂ]/.test(repaired); index += 1) {
    try {
      const bytes = Uint8Array.from(repaired, (character) =>
        character.charCodeAt(0) & 0xff,
      );
      repaired = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      break;
    }
  }

  return repaired.replaceAll("\uFFFD", "");
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

  return repairMojibake(label);
}

function makeFollowerTypeLabel(label: string) {
  const normalized = label.trim().toUpperCase();

  if (
    normalized.includes("NON") ||
    normalized.includes("NAO") ||
    normalized.includes("UNKNOWN")
  ) {
    return "Não seguidores";
  }

  if (normalized.includes("FOLLOWER") || normalized.includes("SEGUIDOR")) {
    return "Seguidores";
  }

  return repairMojibake(label);
}

function groupBreakdownByLabel(items: InstagramBreakdownItem[]) {
  const grouped = new Map<string, number>();

  for (const item of items) {
    grouped.set(item.label, (grouped.get(item.label) ?? 0) + item.value);
  }

  return [...grouped.entries()].map(([label, value]) => ({ label, value }));
}

function filterVisibleShareBreakdown(items: InstagramBreakdownItem[]) {
  const total = items.reduce((sum, item) => sum + Number(item.value ?? 0), 0);

  return items.filter((item) => {
    const normalizedLabel = item.label.trim().toUpperCase();
    const value = Number(item.value ?? 0);
    const share = total ? (value / total) * 100 : 0;

    return value > 0 && share >= 0.05 && normalizedLabel !== "DEFAULT_DO_NOT_USE";
  });
}

function buildInteractionBreakdownByMediaProductType(
  items: MetricsSnapshotRow["top_content"],
) {
  return filterVisibleShareBreakdown(
    groupBreakdownByLabel(
      items
        .map((item) => ({
          label: makeMediaProductTypeLabel(
            item.media_product_type ?? item.media_type ?? "Posts",
          ),
          value: Number(item.total_interactions ?? 0),
        }))
        .filter((item) => item.value > 0),
    ),
  );
}

function makeMediaProductTypeLabel(label: string) {
  const normalized = label.trim().toUpperCase();

  if (normalized.includes("REEL")) {
    return "Reels";
  }

  if (normalized.includes("STORY")) {
    return "Stories";
  }

  if (normalized.includes("FEED") || normalized.includes("POST")) {
    return "Posts";
  }

  if (normalized.includes("CAROUSEL")) {
    return "Carrossel";
  }

  return repairMojibake(label);
}

function mapBreakdownLabels(
  items: InstagramBreakdownItem[],
  formatter: (label: string) => string,
): InstagramBreakdownItem[] {
  return items.map((item) => ({
    ...item,
    label: formatter(item.label),
  }));
}

function sumBreakdownByLabels(
  items: InstagramBreakdownItem[] | undefined,
  formatter: (label: string) => string,
  labels: string[],
) {
  const wanted = new Set(labels.map((label) => label.toLowerCase()));

  return (items ?? []).reduce((sum, item) => {
    const label = formatter(item.label).toLowerCase();
    return wanted.has(label) ? sum + Number(item.value ?? 0) : sum;
  }, 0);
}

function calculateNetFollowers(
  overview: MetricsSnapshotRow["overview_metrics"],
) {
  const total = Number(overview.follows_and_unfollows ?? 0);

  if (total !== 0) {
    return total;
  }

  const breakdown = overview.follows_and_unfollows_by_type ?? [];
  const follows = breakdown.reduce((sum, item) => {
    const label = item.label.trim().toUpperCase();
    return label === "FOLLOWER" || label === "FOLLOWERS"
      ? sum + Number(item.value ?? 0)
      : sum;
  }, 0);
  const unfollows = breakdown.reduce((sum, item) => {
    const label = item.label.trim().toUpperCase();
    return label === "NON_FOLLOWER" || label === "NON_FOLLOWERS"
      ? sum + Number(item.value ?? 0)
      : sum;
  }, 0);

  return follows || unfollows ? follows - unfollows : 0;
}

function percentageChange(current: number, previous: number) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous <= 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function formatChangeLabel(change: number | null) {
  if (change === null) {
    return null;
  }

  return "em relação à coleta anterior";
}

function formatChangeValue(change: number | null) {
  if (change === null) {
    return "Indisponível";
  }

  const rounded = Math.round(change);
  const prefix = rounded > 0 ? "+" : "";

  return `${prefix}${rounded}%`;
}

function buildComparisonCards(
  snapshot: MetricsSnapshotRow,
  previousSnapshot?: MetricsSnapshotRow | null,
) {
  const currentOverview = snapshot.overview_metrics;
  const previousOverview = previousSnapshot?.overview_metrics;
  const reelsAndPosts = sumBreakdownByLabels(
    currentOverview.views_by_media_product_type,
    makeMediaProductTypeLabel,
    ["Reels", "Posts"],
  );
  const previousReelsAndPosts = sumBreakdownByLabels(
    previousOverview?.views_by_media_product_type,
    makeMediaProductTypeLabel,
    ["Reels", "Posts"],
  );
  const nonFollowers = sumBreakdownByLabels(
    currentOverview.views_by_follower_type,
    makeFollowerTypeLabel,
    ["Não seguidores"],
  );
  const previousNonFollowers = sumBreakdownByLabels(
    previousOverview?.views_by_follower_type,
    makeFollowerTypeLabel,
    ["Não seguidores"],
  );
  const reelsAndPostsChange = percentageChange(reelsAndPosts, previousReelsAndPosts);
  const nonFollowersChange = percentageChange(nonFollowers, previousNonFollowers);

  return [
    {
      label: "Visualizações de reels e posts",
      value: formatChangeValue(reelsAndPostsChange),
      changeLabel: formatChangeLabel(reelsAndPostsChange),
    },
    {
      label: "Visualizações de não seguidores",
      value: formatChangeValue(nonFollowersChange),
      changeLabel: formatChangeLabel(nonFollowersChange),
    },
  ];
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

function buildStoriesSummary(
  stories: MetricsSnapshotRow["stories"],
): MetricsViewModel["stories"] {
  const daily = new Map<
    string,
    { label: string; views: number; reach: number; linkClicks: number; stories: number }
  >();

  for (const story of stories ?? []) {
    const current = daily.get(story.collected_on) ?? {
      label: formatIsoDayLabel(story.collected_on),
      views: 0,
      reach: 0,
      linkClicks: 0,
      stories: 0,
    };

    current.views += story.metrics.views;
    current.reach += story.metrics.reach;
    current.linkClicks += story.metrics.link_clicks;
    current.stories += 1;
    daily.set(story.collected_on, current);
  }

  const totalStories = stories?.length ?? 0;
  const totalViews = stories?.reduce((sum, story) => sum + story.metrics.views, 0) ?? 0;
  const totalReach = stories?.reduce((sum, story) => sum + story.metrics.reach, 0) ?? 0;
  const totalInteractions =
    stories?.reduce((sum, story) => sum + story.metrics.total_interactions, 0) ?? 0;
  const totalReplies =
    stories?.reduce((sum, story) => sum + story.metrics.replies, 0) ?? 0;
  const totalShares =
    stories?.reduce((sum, story) => sum + story.metrics.shares, 0) ?? 0;
  const totalLinkClicks =
    stories?.reduce((sum, story) => sum + story.metrics.link_clicks, 0) ?? 0;

  return {
    totalStories,
    totalViews,
    totalReach,
    totalInteractions,
    totalReplies,
    totalShares,
    averageViewsPerStory: totalStories ? Math.round(totalViews / totalStories) : 0,
    averageReachPerStory: totalStories ? Math.round(totalReach / totalStories) : 0,
    averageInteractionsPerStory: totalStories
      ? Math.round(totalInteractions / totalStories)
      : 0,
    totalLinkClicks,
    averageLinkClicksPerStory: totalStories
      ? Math.round(totalLinkClicks / totalStories)
      : 0,
    daily: [...daily.entries()]
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([, value]) => value),
    items: stories ?? [],
  };
}

export function buildMetricsViewModel(
  snapshot: MetricsSnapshotRow,
  previousSnapshot?: MetricsSnapshotRow | null,
): MetricsViewModel {
  const { profile, overview_metrics: overview } = snapshot;
  const followsAndUnfollows = calculateNetFollowers(overview);
  const externalLinkTaps = Number(
    overview.website_clicks ?? overview.profile_links_taps ?? 0,
  );

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
      { label: "Toques em links externos", value: formatNumber(externalLinkTaps) },
      { label: "Contas engajadas", value: formatNumber(overview.accounts_engaged) },
      { label: "Interações", value: formatNumber(overview.total_interactions) },
      { label: "Seguidores líquidos", value: formatNumber(followsAndUnfollows) },
      ...buildComparisonCards(snapshot, previousSnapshot),
    ],
    performanceSeries: buildPerformanceSeries(snapshot.raw_api_payload),
    viewBreakdowns: {
      followerType: groupBreakdownByLabel(
        mapBreakdownLabels(
          overview.views_by_follower_type ?? [],
          makeFollowerTypeLabel,
        ),
      ),
      mediaProductType: filterVisibleShareBreakdown(
        mapBreakdownLabels(
          overview.views_by_media_product_type ?? [],
          makeMediaProductTypeLabel,
        ),
      ),
      interactionMediaProductType: buildInteractionBreakdownByMediaProductType(
        snapshot.top_content,
      ),
    },
    demographics: buildDemographics(snapshot),
    stories: buildStoriesSummary(snapshot.stories ?? []),
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

export function buildComparedMetricsViewModelSafe(
  snapshot: unknown,
  previousSnapshot: unknown,
): MetricsViewModel | null {
  const parsedSnapshot = parseMetricsSnapshot(snapshot);
  const parsedPreviousSnapshot = previousSnapshot
    ? parseMetricsSnapshot(previousSnapshot)
    : null;

  return parsedSnapshot
    ? buildMetricsViewModel(parsedSnapshot, parsedPreviousSnapshot)
    : null;
}
