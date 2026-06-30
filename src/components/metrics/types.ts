import type {
  InstagramBreakdownItem,
  InstagramSnapshot,
  InstagramStoryMetricItem,
} from "@/lib/instagram/types";

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

export type StoryDailyPoint = {
  label: string;
  views: number;
  reach: number;
  linkClicks: number;
  stories: number;
};

export type StoriesSummary = {
  totalStories: number;
  totalViews: number;
  averageViewsPerStory: number;
  totalLinkClicks: number;
  averageLinkClicksPerStory: number;
  daily: StoryDailyPoint[];
  items: InstagramStoryMetricItem[];
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
  viewBreakdowns: {
    followerType: InstagramBreakdownItem[];
    mediaProductType: InstagramBreakdownItem[];
  };
  demographics: InstagramSnapshot["demographics"];
  stories: StoriesSummary;
  topContent: RankedContentItem[];
};
