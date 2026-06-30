import { graphGet } from "./client";
import { normalizeMediaInsightMetric } from "./normalize";
import type { InstagramStoryMetricItem } from "./types";

import { getServerEnv } from "../env";
import { createServiceRoleSupabaseClient } from "../supabase/server";

type GraphParams = Record<string, string | number | boolean | undefined | null>;

type SafeGraphResult<T> = {
  data: T | null;
  error: string | null;
};

type StoryResponseItem = {
  id: string;
  media_type?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
};

type StoriesResponse = {
  data?: StoryResponseItem[];
};

const storyInsightMetrics = [
  "views",
  "reach",
  "replies",
  "shares",
  "total_interactions",
  "navigation",
  "link_clicks",
] as const;

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function readError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown Meta API error";
}

async function safeGraphGet<T>(
  path: string,
  params: GraphParams = {},
): Promise<SafeGraphResult<T>> {
  try {
    return { data: await graphGet<T>(path, params), error: null };
  } catch (error) {
    return { data: null, error: readError(error) };
  }
}

async function getStoryInsights(storyId: string) {
  const metrics: InstagramStoryMetricItem["metrics"] = {
    views: 0,
    reach: 0,
    replies: 0,
    shares: 0,
    total_interactions: 0,
    navigation: 0,
    link_clicks: 0,
  };
  const raw: Record<string, SafeGraphResult<unknown>> = {};

  for (const metric of storyInsightMetrics) {
    const result = await safeGraphGet<unknown>(`${storyId}/insights`, {
      metric,
    });

    raw[metric] = result;

    if (result.data) {
      metrics[metric] = normalizeMediaInsightMetric(result.data, metric);
    }
  }

  return { metrics, raw };
}

export async function refreshInstagramStoriesSnapshot() {
  const env = getServerEnv();
  const accountId = env.META_INSTAGRAM_ACCOUNT_ID;
  const collectedAt = new Date();
  const collectedOn = isoDate(collectedAt);
  const storiesResult = await safeGraphGet<StoriesResponse>(`${accountId}/stories`, {
    fields: "id,media_type,media_url,permalink,timestamp",
    limit: 50,
  });
  const stories = storiesResult.data ?? { data: [] };
  const rows: Array<Omit<InstagramStoryMetricItem, "collected_at"> & {
    collected_at: string;
    raw_api_payload: unknown;
  }> = [];

  for (const story of stories.data ?? []) {
    const insights = await getStoryInsights(story.id);

    rows.push({
      story_id: story.id,
      collected_on: collectedOn,
      collected_at: collectedAt.toISOString(),
      story_timestamp: story.timestamp ?? null,
      media_type: story.media_type ?? null,
      media_url: story.media_url ?? null,
      permalink: story.permalink ?? null,
      metrics: insights.metrics,
      raw_api_payload: insights.raw,
    });
  }

  const supabase = createServiceRoleSupabaseClient();

  if (rows.length) {
    const { error } = await supabase
      .from("instagram_story_metric_snapshots")
      .upsert(rows, { onConflict: "story_id,collected_on" });

    if (error) {
      throw new Error(`Unable to upsert Instagram story snapshots: ${error.message}`);
    }
  }

  const retentionLimit = new Date(collectedAt);
  retentionLimit.setUTCDate(retentionLimit.getUTCDate() - 90);

  const { error: cleanupError } = await supabase
    .from("instagram_story_metric_snapshots")
    .delete()
    .lt("collected_on", isoDate(retentionLimit));

  if (cleanupError) {
    throw new Error(`Unable to clean old Instagram story snapshots: ${cleanupError.message}`);
  }

  return {
    collectedOn,
    collectedAt: collectedAt.toISOString(),
    storyCount: rows.length,
    error: storiesResult.error,
  };
}

export async function getRecentStorySnapshots(days = 30) {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);

  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("instagram_story_metric_snapshots")
    .select(
      "story_id, collected_on, collected_at, story_timestamp, media_type, media_url, permalink, metrics",
    )
    .gte("collected_on", isoDate(since))
    .order("collected_on", { ascending: true });

  if (error) {
    if (
      error.message.includes("instagram_story_metric_snapshots") ||
      error.message.includes("does not exist")
    ) {
      return [];
    }

    throw new Error(`Unable to load Instagram story snapshots: ${error.message}`);
  }

  return (data ?? []) as InstagramStoryMetricItem[];
}
