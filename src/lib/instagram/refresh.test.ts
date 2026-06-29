import { describe, expect, it } from "vitest";

import {
  buildMediaInsightsParams,
  buildOverviewInsightRequests,
  collectOptionalGraphError,
  selectRecentMediaCandidates,
} from "./refresh";

describe("instagram refresh helpers", () => {
  it("builds overview requests with the correct shape per metric group", () => {
    expect(buildOverviewInsightRequests(100, 200)).toEqual([
      {
        key: "reach",
        params: {
          metric: "reach",
          period: "day",
          since: 100,
          until: 200,
        },
        required: true,
      },
      {
        key: "views",
        params: {
          metric: "views",
          period: "day",
          metric_type: "total_value",
          since: 100,
          until: 200,
        },
        required: true,
      },
      {
        key: "profile_views",
        params: {
          metric: "profile_views",
          period: "day",
          metric_type: "total_value",
          since: 100,
          until: 200,
        },
        required: false,
      },
      {
        key: "profile_links_taps",
        params: {
          metric: "profile_links_taps",
          period: "day",
          metric_type: "total_value",
          since: 100,
          until: 200,
        },
        required: false,
      },
      {
        key: "accounts_engaged",
        params: {
          metric: "accounts_engaged",
          period: "day",
          metric_type: "total_value",
          since: 100,
          until: 200,
        },
        required: false,
      },
      {
        key: "total_interactions",
        params: {
          metric: "total_interactions",
          period: "day",
          metric_type: "total_value",
          since: 100,
          until: 200,
        },
        required: false,
      },
      {
        key: "follows_and_unfollows",
        params: {
          metric: "follows_and_unfollows",
          period: "day",
          metric_type: "total_value",
          since: 100,
          until: 200,
        },
        required: false,
      },
    ]);
  });

  it("builds one grouped media insights request", () => {
    expect(buildMediaInsightsParams()).toEqual({
      metric: "views,reach,likes,comments,shares,saved,total_interactions",
    });
  });

  it("limits media insights candidates to the first 20 recent items", () => {
    const periodStart = new Date("2026-05-27T00:00:00.000Z");
    const periodEnd = new Date("2026-06-26T00:00:00.000Z");
    const media = Array.from({ length: 25 }, (_, index) => ({
      id: String(index),
      timestamp: `2026-06-${String(25 - index).padStart(2, "0")}T12:00:00+0000`,
    })).concat([
      { id: "old", timestamp: "2026-05-01T12:00:00+0000" },
      { id: "missing" },
    ]);

    const selected = selectRecentMediaCandidates(media, periodStart, periodEnd);

    expect(selected).toHaveLength(20);
    expect(selected.map((item) => item.id)).not.toContain("old");
    expect(selected.map((item) => item.id)).not.toContain("missing");
    expect(selected.at(0)?.id).toBe("0");
  });

  it("records optional Graph API errors by area", () => {
    const errors: Record<string, string[]> = {};

    collectOptionalGraphError(errors, "demographics.gender", {
      data: null,
      error: "permission denied",
    });
    collectOptionalGraphError(errors, "demographics.city", {
      data: { data: [] },
      error: null,
    });

    expect(errors).toEqual({ "demographics.gender": ["permission denied"] });
  });
});
