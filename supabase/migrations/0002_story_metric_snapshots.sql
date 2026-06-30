create table if not exists public.instagram_story_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  story_id text not null,
  collected_on date not null,
  collected_at timestamptz default now(),
  story_timestamp timestamptz,
  media_type text,
  media_url text,
  permalink text,
  metrics jsonb not null,
  raw_api_payload jsonb not null,
  unique (story_id, collected_on)
);

alter table public.instagram_story_metric_snapshots enable row level security;

create index if not exists instagram_story_metric_snapshots_collected_on_idx
  on public.instagram_story_metric_snapshots (collected_on desc);

create index if not exists instagram_story_metric_snapshots_story_id_idx
  on public.instagram_story_metric_snapshots (story_id);
