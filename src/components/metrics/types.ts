import type { InstagramSnapshot } from "@/lib/instagram/types";

export type MetricsSnapshotRow = InstagramSnapshot;

export type OverviewCard = {
  label: string;
  value: string;
};

export type PerformancePoint = {
  label: string;
  reach: number;
  views: number;
};

export type RankedContentItem = InstagramSnapshot["top_content"][number] & {
  rank: number;
  publishedAtLabel: string;
  shortCaption: string;
};

export type MetricsViewModel = {
  periodLabel: string;
  collectedAtLabel: string;
  profileHandle: string;
  overviewCards: OverviewCard[];
  performanceSeries: PerformancePoint[];
  demographics: InstagramSnapshot["demographics"];
  topContent: RankedContentItem[];
};
