export type InstagramBreakdownItem = {
  label: string;
  value: number;
};

export type InstagramStoryMetricItem = {
  story_id: string;
  collected_on: string;
  collected_at: string;
  story_timestamp: string | null;
  media_type: string | null;
  media_url: string | null;
  permalink: string | null;
  metrics: {
    views: number;
    reach: number;
    replies: number;
    shares: number;
    total_interactions: number;
    navigation: number;
    link_clicks: number;
  };
};

export type InstagramProfile = {
  id: string;
  username: string;
  name: string | null;
  followers_count: number;
  follows_count: number;
  media_count: number;
  profile_picture_url: string | null;
};

export type InstagramOverviewMetrics = {
  reach: number;
  views: number;
  profile_views: number;
  profile_links_taps: number;
  website_clicks?: number;
  accounts_engaged: number;
  total_interactions: number;
  follows_and_unfollows: number;
  follows_and_unfollows_by_type?: InstagramBreakdownItem[];
  views_by_follower_type?: InstagramBreakdownItem[];
  views_by_media_product_type?: InstagramBreakdownItem[];
};

export type InstagramDemographics = {
  gender: InstagramBreakdownItem[];
  age: InstagramBreakdownItem[];
  city: InstagramBreakdownItem[];
  country: InstagramBreakdownItem[];
};

export type InstagramTopContentItem = {
  id: string;
  caption: string;
  media_type: string | null;
  media_product_type: string | null;
  thumbnail_url: string | null;
  media_url: string | null;
  permalink: string | null;
  timestamp: string | null;
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saved: number;
  total_interactions: number;
};

export type InstagramSnapshot = {
  period_start: string;
  period_end: string;
  collected_at: string;
  profile: InstagramProfile;
  overview_metrics: InstagramOverviewMetrics;
  demographics: InstagramDemographics;
  top_content: InstagramTopContentItem[];
  stories?: InstagramStoryMetricItem[];
  raw_api_payload: unknown;
};
