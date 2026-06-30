import type {
  InstagramBreakdownItem,
  InstagramDemographics,
  InstagramOverviewMetrics,
  InstagramTopContentItem,
} from "./types";

const demographicKeys = ["gender", "age", "city", "country"] as const;

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

function readRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export function sumInsightValues(response: unknown, metricName?: string): number {
  const payload = readRecord(response);
  const data = Array.isArray(payload?.data) ? payload.data : [];

  return data.reduce((sum, item) => {
    const insight = readRecord(item);
    if (!insight) {
      return sum;
    }

    if (metricName && insight.name !== metricName) {
      return sum;
    }

    const values = Array.isArray(insight.values) ? insight.values : [];
    const valuesTotal = values.reduce((innerSum, valueItem) => {
      const valueRecord = readRecord(valueItem);
      return innerSum + toNumber(valueRecord?.value);
    }, 0);

    const totalValue = readRecord(insight.total_value);

    return sum + valuesTotal + toNumber(totalValue?.value);
  }, 0);
}

export function toTopFiveBreakdown(input: unknown): InstagramBreakdownItem[] {
  const entries = Array.isArray(input)
    ? input.map((item) => {
        const record = readRecord(item);
        return [String(record?.label ?? record?.name ?? ""), record?.value] as const;
      })
    : Object.entries(readRecord(input) ?? {});

  return entries
    .map(([label, value]) => ({ label, value: toNumber(value) }))
    .filter((item) => item.label.length > 0 && item.value > 0)
    .sort((first, second) => second.value - first.value)
    .slice(0, 5);
}

export function normalizeInsightBreakdown(
  response: unknown,
  metricName: string,
  maxItems = 8,
): InstagramBreakdownItem[] {
  const collected: Record<string, number> = {};
  const payload = readRecord(response);
  const data = Array.isArray(payload?.data) ? payload.data : [];

  for (const item of data) {
    const insight = readRecord(item);
    if (!insight || insight.name !== metricName) {
      continue;
    }

    const totalValue = readRecord(insight.total_value);
    const breakdowns = Array.isArray(totalValue?.breakdowns)
      ? totalValue.breakdowns
      : [];

    for (const breakdownItem of breakdowns) {
      const breakdown = readRecord(breakdownItem);
      const dimensionKeys = Array.isArray(breakdown?.dimension_keys)
        ? breakdown.dimension_keys
        : [];
      const results = Array.isArray(breakdown?.results) ? breakdown.results : [];

      for (const resultItem of results) {
        const result = readRecord(resultItem);
        const dimensionValues = Array.isArray(result?.dimension_values)
          ? result.dimension_values
          : [];
        const label = dimensionValues
          .slice(0, Math.max(1, dimensionKeys.length))
          .map((value) => String(value ?? "").trim())
          .filter(Boolean)
          .join(" / ");
        const numericValue = toNumber(result?.value);

        if (label && numericValue > 0) {
          collected[label] = (collected[label] ?? 0) + numericValue;
        }
      }
    }
  }

  return Object.entries(collected)
    .map(([label, value]) => ({ label, value }))
    .sort((first, second) => second.value - first.value)
    .slice(0, maxItems);
}

export function shortCaption(caption: unknown, maxLength = 140): string {
  const normalized =
    typeof caption === "string" ? caption.replace(/\s+/g, " ").trim() : "";

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function mergeBreakdown(
  target: Partial<Record<(typeof demographicKeys)[number], Record<string, number>>>,
  key: (typeof demographicKeys)[number],
  label: unknown,
  value: unknown,
) {
  const labelText = String(label ?? "").trim();
  const numericValue = toNumber(value);

  if (!labelText || numericValue <= 0) {
    return;
  }

  target[key] ??= {};
  target[key][labelText] = (target[key][labelText] ?? 0) + numericValue;
}

function applyMetaBreakdowns(
  target: Partial<Record<(typeof demographicKeys)[number], Record<string, number>>>,
  breakdowns: unknown,
) {
  const list = Array.isArray(breakdowns) ? breakdowns : [];

  for (const item of list) {
    const breakdown = readRecord(item);
    const dimensionKeys = Array.isArray(breakdown?.dimension_keys)
      ? breakdown.dimension_keys.map(String)
      : [];
    const key = demographicKeys.find((candidate) =>
      dimensionKeys.includes(candidate),
    );

    if (!key || !Array.isArray(breakdown?.results)) {
      continue;
    }

    const keyIndex = Math.max(0, dimensionKeys.indexOf(key));

    for (const resultItem of breakdown.results) {
      const result = readRecord(resultItem);
      const dimensionValues = Array.isArray(result?.dimension_values)
        ? result.dimension_values
        : [];

      mergeBreakdown(target, key, dimensionValues[keyIndex], result?.value);
    }
  }
}

export function normalizeDemographicBreakdowns(
  response: unknown,
): InstagramDemographics {
  const collected: Partial<
    Record<(typeof demographicKeys)[number], Record<string, number>>
  > = {};
  const payload = readRecord(response);

  for (const key of demographicKeys) {
    const directValue = payload?.[key];
    const directRecord = readRecord(directValue);

    if (directRecord || Array.isArray(directValue)) {
      for (const item of toTopFiveBreakdown(directValue)) {
        mergeBreakdown(collected, key, item.label, item.value);
      }
    }
  }

  const data = Array.isArray(payload?.data) ? payload.data : [];
  for (const item of data) {
    const insight = readRecord(item);
    const totalValue = readRecord(insight?.total_value);
    applyMetaBreakdowns(collected, totalValue?.breakdowns);
  }

  return {
    gender: toTopFiveBreakdown(collected.gender),
    age: toTopFiveBreakdown(collected.age),
    city: toTopFiveBreakdown(collected.city),
    country: toTopFiveBreakdown(collected.country),
  };
}

export function normalizeOverviewMetrics(
  responsesByMetric: Partial<Record<keyof InstagramOverviewMetrics, unknown>>,
): InstagramOverviewMetrics {
  return {
    reach: sumInsightValues(responsesByMetric.reach, "reach"),
    views: sumInsightValues(responsesByMetric.views, "views"),
    profile_views: sumInsightValues(
      responsesByMetric.profile_views,
      "profile_views",
    ),
    profile_links_taps: sumInsightValues(
      responsesByMetric.profile_links_taps,
      "profile_links_taps",
    ),
    accounts_engaged: sumInsightValues(
      responsesByMetric.accounts_engaged,
      "accounts_engaged",
    ),
    total_interactions: sumInsightValues(
      responsesByMetric.total_interactions,
      "total_interactions",
    ),
    follows_and_unfollows: sumInsightValues(
      responsesByMetric.follows_and_unfollows,
      "follows_and_unfollows",
    ),
    follows_and_unfollows_by_type: normalizeInsightBreakdown(
      responsesByMetric.follows_and_unfollows_by_type,
      "follows_and_unfollows",
    ),
    views_by_follower_type: normalizeInsightBreakdown(
      responsesByMetric.views_by_follower_type,
      "views",
    ),
    views_by_media_product_type: normalizeInsightBreakdown(
      responsesByMetric.views_by_media_product_type,
      "views",
    ),
  };
}

export function normalizeMediaInsightMetric(
  response: unknown,
  metricName: string,
): number {
  return sumInsightValues(response, metricName);
}

export function sortTopContentByViews(
  items: InstagramTopContentItem[],
): InstagramTopContentItem[] {
  return [...items].sort((first, second) => second.views - first.views).slice(0, 10);
}
