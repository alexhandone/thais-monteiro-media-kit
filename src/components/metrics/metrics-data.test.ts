import { describe, expect, it } from "vitest";

import { buildMetricsViewModel, buildMetricsViewModelSafe } from "./metrics-data";
import type { MetricsSnapshotRow } from "./types";

describe("buildMetricsViewModel", () => {
  it("maps a Supabase snapshot into metric cards, chart series and ranked content", () => {
    const snapshot: MetricsSnapshotRow = {
      period_start: "2026-05-27",
      period_end: "2026-06-26",
      collected_at: "2026-06-26T12:00:00.000Z",
      profile: {
        id: "ig-1",
        username: "thais.msilva",
        name: "Thais",
        followers_count: 12345,
        follows_count: 234,
        media_count: 456,
        profile_picture_url: null,
      },
      overview_metrics: {
        reach: 1000,
        views: 2500,
        profile_views: 120,
        profile_links_taps: 30,
        accounts_engaged: 80,
        total_interactions: 95,
        follows_and_unfollows: 12,
        views_by_follower_type: [
          { label: "FOLLOWER", value: 930 },
          { label: "NON_FOLLOWER", value: 1570 },
        ],
        views_by_media_product_type: [
          { label: "REELS", value: 1800 },
          { label: "STORY", value: 500 },
          { label: "FEED", value: 200 },
        ],
      },
      demographics: {
        gender: [
          { label: "F", value: 80 },
          { label: "M", value: 20 },
        ],
        age: [{ label: "25-34", value: 45 }],
        city: [{ label: "Osasco", value: 50 }],
        country: [],
      },
      top_content: Array.from({ length: 12 }, (_, index) => ({
        id: `media-${index}`,
        caption: `Conteúdo ${index}`,
        media_type: "VIDEO",
        media_product_type: "REELS",
        thumbnail_url: null,
        media_url: null,
        permalink: `https://instagram.com/p/${index}`,
        timestamp: "2026-06-20T10:00:00.000Z",
        views: 120 - index,
        reach: 80 - index,
        likes: 10,
        comments: 2,
        shares: 3,
        saved: 4,
        total_interactions: 19,
      })),
      stories: [
        {
          story_id: "story-1",
          collected_on: "2026-06-25",
          collected_at: "2026-06-25T23:00:00.000Z",
          story_timestamp: "2026-06-25T18:00:00.000Z",
          media_type: "IMAGE",
          media_url: null,
          permalink: null,
          metrics: {
            views: 400,
            reach: 320,
            replies: 2,
            shares: 1,
            total_interactions: 3,
            navigation: 120,
            link_clicks: 8,
          },
        },
      ],
      raw_api_payload: {
        overview: {
          reach: {
            data: {
              data: [
                {
                  name: "reach",
                  values: [
                    { end_time: "2026-06-24T00:00:00+0000", value: 100 },
                    { end_time: "2026-06-25T00:00:00+0000", value: 140 },
                  ],
                },
              ],
            },
          },
          views: {
            data: {
              data: [
                {
                  name: "views",
                  values: [
                    { end_time: "2026-06-24T00:00:00+0000", value: 220 },
                    { end_time: "2026-06-25T00:00:00+0000", value: 260 },
                  ],
                },
              ],
            },
          },
        },
      },
    };

    const viewModel = buildMetricsViewModel(snapshot);

    expect(viewModel.overviewCards).toContainEqual({
      label: "Seguidores",
      value: "12.345",
    });
    expect(viewModel.overviewCards).toContainEqual({
      label: "Seguidores líquidos",
      value: "12",
    });
    expect(viewModel.performanceSeries).toEqual([
      { label: "24/06", reach: 100, views: 220 },
      { label: "25/06", reach: 140, views: 260 },
    ]);
    expect(viewModel.viewBreakdowns.followerType).toEqual([
      { label: "Seguidores", value: 930 },
      { label: "Não seguidores", value: 1570 },
    ]);
    expect(viewModel.viewBreakdowns.mediaProductType).toEqual([
      { label: "Reels", value: 1800 },
      { label: "Stories", value: 500 },
      { label: "Posts", value: 200 },
    ]);
    expect(viewModel.stories).toMatchObject({
      totalStories: 1,
      totalViews: 400,
      averageViewsPerStory: 400,
      totalLinkClicks: 8,
    });
    expect(viewModel.topContent).toHaveLength(10);
    expect(viewModel.topContent[0]?.rank).toBe(1);
  });

  it("returns null for malformed Supabase JSONB instead of throwing", () => {
    const invalidSnapshot = {
      period_start: "2026-05-27",
      period_end: "not-a-date",
      collected_at: "2026-06-26T12:00:00.000Z",
      profile: { username: "thais.msilva" },
      overview_metrics: null,
      demographics: { gender: "bad" },
      top_content: {},
      raw_api_payload: {},
    };

    expect(buildMetricsViewModelSafe(invalidSnapshot)).toBeNull();
  });

  it("adds UNKNOWN audience views to non-followers", () => {
    const snapshot: MetricsSnapshotRow = {
      period_start: "2026-06-01",
      period_end: "2026-07-01",
      collected_at: "2026-07-01T12:00:00.000Z",
      profile: {
        id: "ig-1",
        username: "thais.msilva",
        name: "Thais",
        followers_count: 7000,
        follows_count: 1000,
        media_count: 100,
        profile_picture_url: null,
      },
      overview_metrics: {
        reach: 1000,
        views: 1876211,
        profile_views: 0,
        profile_links_taps: 0,
        accounts_engaged: 0,
        total_interactions: 0,
        follows_and_unfollows: 0,
        views_by_follower_type: [
          { label: "NON_FOLLOWER", value: 625 },
          { label: "FOLLOWER", value: 369 },
          { label: "UNKNOWN", value: 6 },
        ],
        views_by_media_product_type: [],
      },
      demographics: {
        gender: [],
        age: [],
        city: [],
        country: [],
      },
      top_content: [],
      stories: [],
      raw_api_payload: {},
    };

    expect(buildMetricsViewModel(snapshot).viewBreakdowns.followerType).toEqual([
      { label: "Não seguidores", value: 631 },
      { label: "Seguidores", value: 369 },
    ]);
  });

  it("removes zero-value media formats from the format breakdown", () => {
    const snapshot: MetricsSnapshotRow = {
      period_start: "2026-06-01",
      period_end: "2026-07-01",
      collected_at: "2026-07-01T12:00:00.000Z",
      profile: {
        id: "ig-1",
        username: "thais.msilva",
        name: "Thais",
        followers_count: 7000,
        follows_count: 1000,
        media_count: 100,
        profile_picture_url: null,
      },
      overview_metrics: {
        reach: 1000,
        views: 1000,
        profile_views: 0,
        profile_links_taps: 0,
        accounts_engaged: 0,
        total_interactions: 0,
        follows_and_unfollows: 0,
        views_by_follower_type: [],
        views_by_media_product_type: [
          { label: "REEL", value: 1151037 },
          { label: "STORY", value: 636374 },
          { label: "CAROUSEL", value: 86851 },
          { label: "FEED", value: 1921 },
          { label: "IGTV", value: 22 },
          { label: "DEFAULT_DO_NOT_USE", value: 6 },
        ],
      },
      demographics: {
        gender: [],
        age: [],
        city: [],
        country: [],
      },
      top_content: [],
      stories: [],
      raw_api_payload: {},
    };

    expect(buildMetricsViewModel(snapshot).viewBreakdowns.mediaProductType).toEqual([
      { label: "Reels", value: 1151037 },
      { label: "Stories", value: 636374 },
      { label: "Carrossel", value: 86851 },
      { label: "Posts", value: 1921 },
    ]);
  });

  it("uses percentage growth as the main value for comparison cards", () => {
    const snapshot: MetricsSnapshotRow = {
      period_start: "2026-06-01",
      period_end: "2026-07-01",
      collected_at: "2026-07-01T12:00:00.000Z",
      profile: {
        id: "ig-1",
        username: "thais.msilva",
        name: "Thais",
        followers_count: 7000,
        follows_count: 1000,
        media_count: 100,
        profile_picture_url: null,
      },
      overview_metrics: {
        reach: 1000,
        views: 2000,
        profile_views: 0,
        profile_links_taps: 0,
        accounts_engaged: 0,
        total_interactions: 0,
        follows_and_unfollows: 0,
        views_by_follower_type: [{ label: "NON_FOLLOWER", value: 1500 }],
        views_by_media_product_type: [
          { label: "REELS", value: 800 },
          { label: "FEED", value: 200 },
        ],
      },
      demographics: {
        gender: [],
        age: [],
        city: [],
        country: [],
      },
      top_content: [],
      stories: [],
      raw_api_payload: {},
    };
    const previousSnapshot: MetricsSnapshotRow = {
      ...snapshot,
      period_start: "2026-05-01",
      period_end: "2026-05-31",
      overview_metrics: {
        ...snapshot.overview_metrics,
        views_by_follower_type: [{ label: "NON_FOLLOWER", value: 1000 }],
        views_by_media_product_type: [
          { label: "REELS", value: 400 },
          { label: "FEED", value: 100 },
        ],
      },
    };

    expect(buildMetricsViewModel(snapshot, previousSnapshot).overviewCards).toEqual(
      expect.arrayContaining([
        {
          label: "Visualizações de reels e posts",
          value: "+100%",
          changeLabel: "em relação à coleta anterior",
        },
        {
          label: "Visualizações de não seguidores",
          value: "+50%",
          changeLabel: "em relação à coleta anterior",
        },
      ]),
    );
  });
});
