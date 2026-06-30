import { graphGet } from "./client";
import {
  normalizeDemographicBreakdowns,
  normalizeMediaInsightMetric,
  normalizeOverviewMetrics,
  shortCaption,
  sortTopContentByViews,
} from "./normalize";
import type {
  InstagramOverviewMetrics,
  InstagramProfile,
  InstagramSnapshot,
  InstagramTopContentItem,
} from "./types";

import { getServerEnv } from "../env";

type ProfileResponse = InstagramProfile;

type MediaItemResponse = {
  id: string;
  caption?: string;
  media_type?: string;
  media_product_type?: string;
  thumbnail_url?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
};

type MediaResponse = {
  data?: MediaItemResponse[];
};

type SafeGraphResult<T> = {
  data: T | null;
  error: string | null;
};

const mediaInsightMetrics = [
  "views",
  "reach",
  "likes",
  "comments",
  "shares",
  "saved",
  "total_interactions",
] as const;

type GraphParams = Record<string, string | number | boolean | undefined | null>;

type OverviewInsightRequest = {
  key: keyof InstagramOverviewMetrics | "views_daily";
  params: GraphParams;
  required: boolean;
};

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function unixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export function buildOverviewInsightRequests(
  since: number,
  until: number,
): OverviewInsightRequest[] {
  const totalValueMetrics = [
    "views",
    "profile_views",
    "profile_links_taps",
    "accounts_engaged",
    "total_interactions",
    "follows_and_unfollows",
  ] as const satisfies readonly (keyof InstagramOverviewMetrics)[];

  return [
    {
      key: "reach",
      params: {
        metric: "reach",
        period: "day",
        since,
        until,
      },
      required: true,
    },
    {
      key: "views_daily",
      params: {
        metric: "views",
        period: "day",
        since,
        until,
      },
      required: false,
    },
    ...totalValueMetrics.map((metric) => ({
      key: metric,
      // Keep these as one-metric calls. Meta's total_value compatibility varies
      // across account insight metrics, so grouping here would make fallback
      // less precise and could hide which metric failed.
      params: {
        metric,
        period: "day",
        metric_type: "total_value",
        since,
        until,
      },
      required: metric === "views",
    })),
    {
      key: "views_by_follower_type",
      params: {
        metric: "views",
        period: "day",
        metric_type: "total_value",
        breakdown: "follow_type",
        since,
        until,
      },
      required: false,
    },
    {
      key: "views_by_media_product_type",
      params: {
        metric: "views",
        period: "day",
        metric_type: "total_value",
        breakdown: "media_product_type",
        since,
        until,
      },
      required: false,
    },
    {
      key: "follows_and_unfollows_by_type",
      params: {
        metric: "follows_and_unfollows",
        period: "day",
        metric_type: "total_value",
        breakdown: "follow_type",
        since,
        until,
      },
      required: false,
    },
  ];
}

export function buildMediaInsightsParams(): GraphParams {
  return {
    metric: mediaInsightMetrics.join(","),
  };
}

export function selectRecentMediaCandidates(
  media: MediaItemResponse[],
  periodStart: Date,
  periodEnd: Date,
): MediaItemResponse[] {
  const startTime = periodStart.getTime();
  const endTime = periodEnd.getTime();

  return media
    .filter((item) => {
      if (!item.timestamp) {
        return false;
      }

      const timestamp = Date.parse(item.timestamp);
      return (
        Number.isFinite(timestamp) && timestamp >= startTime && timestamp <= endTime
      );
    })
    .slice(0, 20);
}

export function collectOptionalGraphError(
  errors: Record<string, string[]>,
  area: string,
  result: SafeGraphResult<unknown>,
) {
  if (!result.error) {
    return;
  }

  errors[area] ??= [];
  errors[area].push(result.error);
}

async function safeGraphGet<T>(
  path: string,
  params: GraphParams = {},
): Promise<SafeGraphResult<T>> {
  try {
    return { data: await graphGet<T>(path, params), error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown Meta API error",
    };
  }
}

async function getOptionalAccountInsights(
  accountId: string,
  since: number,
  until: number,
  errors: Record<string, string[]>,
) {
  const responses: Partial<Record<keyof InstagramOverviewMetrics, unknown>> = {};
  const raw: Record<string, unknown> = {};
  const requests = buildOverviewInsightRequests(since, until);

  for (const request of requests) {
    if (request.required) {
      const response = await graphGet<unknown>(
        `${accountId}/insights`,
        request.params,
      );

      raw[request.key] = { data: response, error: null };
      if (request.key !== "views_daily") {
        responses[request.key] = response;
      }
      continue;
    }

    const result = await safeGraphGet<unknown>(
      `${accountId}/insights`,
      request.params,
    );

    raw[request.key] = result;
    if (request.key !== "views_daily") {
      responses[request.key] = result.data;
    }
    collectOptionalGraphError(errors, `overview.${request.key}`, result);
  }

  return {
    metrics: normalizeOverviewMetrics(responses),
    raw,
  };
}

async function getOptionalDemographics(
  accountId: string,
  errors: Record<string, string[]>,
) {
  const raw: Record<string, SafeGraphResult<unknown>> = {};
  const combined = { data: [] as unknown[] };

  for (const breakdown of ["gender", "age", "city", "country"] as const) {
    const result = await safeGraphGet<{ data?: unknown[] }>(
      `${accountId}/insights`,
      {
        metric: "follower_demographics",
        period: "lifetime",
        metric_type: "total_value",
        breakdown,
      },
    );

    raw[breakdown] = result;
    collectOptionalGraphError(errors, `demographics.${breakdown}`, result);

    if (Array.isArray(result.data?.data)) {
      combined.data.push(...result.data.data);
    }
  }

  return {
    demographics: normalizeDemographicBreakdowns(combined),
    raw,
  };
}

async function getOptionalMediaInsights(
  mediaId: string,
  errors: Record<string, string[]>,
) {
  const raw: Record<string, unknown> = {};
  const values: Record<(typeof mediaInsightMetrics)[number], number> = {
    views: 0,
    reach: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saved: 0,
    total_interactions: 0,
  };

  const groupedResult = await safeGraphGet<unknown>(
    `${mediaId}/insights`,
    buildMediaInsightsParams(),
  );

  raw.grouped = groupedResult;

  if (groupedResult.data) {
    for (const metric of mediaInsightMetrics) {
      values[metric] = normalizeMediaInsightMetric(groupedResult.data, metric);
    }

    return { values, raw };
  }

  collectOptionalGraphError(errors, `media_insights.${mediaId}.grouped`, groupedResult);

  const viewsFallback = await safeGraphGet<unknown>(`${mediaId}/insights`, {
    metric: "views",
  });
  raw.views_fallback = viewsFallback;
  collectOptionalGraphError(
    errors,
    `media_insights.${mediaId}.views_fallback`,
    viewsFallback,
  );

  if (viewsFallback.data) {
    values.views = normalizeMediaInsightMetric(viewsFallback.data, "views");
  }

  return { values, raw };
}

export async function refreshInstagramSnapshot(): Promise<InstagramSnapshot> {
  const env = getServerEnv();
  const periodEnd = new Date();
  const periodStart = new Date(periodEnd);
  periodStart.setUTCDate(periodStart.getUTCDate() - 30);

  const since = unixSeconds(periodStart);
  const until = unixSeconds(periodEnd);
  const accountId = env.META_INSTAGRAM_ACCOUNT_ID;

  const profile = await graphGet<ProfileResponse>(accountId, {
    fields:
      "id,username,name,followers_count,follows_count,media_count,profile_picture_url",
  });

  const media = await graphGet<MediaResponse>(`${accountId}/media`, {
    fields:
      "id,caption,media_type,media_product_type,thumbnail_url,media_url,permalink,timestamp,like_count,comments_count",
    limit: 50,
  });

  const errors: Record<string, string[]> = {};
  const overview = await getOptionalAccountInsights(accountId, since, until, errors);
  const demographics = await getOptionalDemographics(accountId, errors);
  const rawMediaInsights: Record<string, unknown> = {};
  const topContentCandidates: InstagramTopContentItem[] = [];
  const mediaCandidates = selectRecentMediaCandidates(
    media.data ?? [],
    periodStart,
    periodEnd,
  );

  for (const item of mediaCandidates) {
    const insights = await getOptionalMediaInsights(item.id, errors);
    rawMediaInsights[item.id] = insights.raw;

    const likes = insights.values.likes || Number(item.like_count ?? 0);
    const comments = insights.values.comments || Number(item.comments_count ?? 0);
    const totalInteractions =
      insights.values.total_interactions ||
      likes + comments + insights.values.shares + insights.values.saved;

    topContentCandidates.push({
      id: item.id,
      caption: shortCaption(item.caption),
      media_type: item.media_type ?? null,
      media_product_type: item.media_product_type ?? null,
      thumbnail_url: item.thumbnail_url ?? null,
      media_url: item.media_url ?? null,
      permalink: item.permalink ?? null,
      timestamp: item.timestamp ?? null,
      views: insights.values.views,
      reach: insights.values.reach,
      likes,
      comments,
      shares: insights.values.shares,
      saved: insights.values.saved,
      total_interactions: totalInteractions,
    });
  }

  const collectedAt = new Date().toISOString();
  const snapshot: InstagramSnapshot = {
    period_start: isoDate(periodStart),
    period_end: isoDate(periodEnd),
    collected_at: collectedAt,
    profile: {
      id: profile.id,
      username: profile.username,
      name: profile.name ?? null,
      followers_count: Number(profile.followers_count ?? 0),
      follows_count: Number(profile.follows_count ?? 0),
      media_count: Number(profile.media_count ?? 0),
      profile_picture_url: profile.profile_picture_url ?? null,
    },
    overview_metrics: overview.metrics,
    demographics: demographics.demographics,
    top_content: sortTopContentByViews(topContentCandidates),
    raw_api_payload: {
      profile,
      overview: overview.raw,
      demographics: demographics.raw,
      media,
      media_insights: rawMediaInsights,
      errors,
    },
  };

  const { createServiceRoleSupabaseClient } = await import("../supabase/server");
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("instagram_metric_snapshots").insert({
    period_start: snapshot.period_start,
    period_end: snapshot.period_end,
    collected_at: snapshot.collected_at,
    profile: snapshot.profile,
    overview_metrics: snapshot.overview_metrics,
    demographics: snapshot.demographics,
    top_content: snapshot.top_content,
    raw_api_payload: snapshot.raw_api_payload,
  });

  if (error) {
    throw new Error(`Unable to insert Instagram snapshot: ${error.message}`);
  }

  return snapshot;
}
