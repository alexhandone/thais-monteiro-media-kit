create extension if not exists pgcrypto;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  company_or_name text not null,
  email text not null,
  phone text not null,
  source text not null default 'metrics_cta',
  created_at timestamptz default now()
);

create table public.metric_access_tokens (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz default now(),
  last_used_at timestamptz
);

create table public.instagram_metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  collected_at timestamptz default now(),
  profile jsonb not null,
  overview_metrics jsonb not null,
  demographics jsonb not null,
  top_content jsonb not null,
  raw_api_payload jsonb not null
);

alter table public.leads enable row level security;
alter table public.metric_access_tokens enable row level security;
alter table public.instagram_metric_snapshots enable row level security;

create index leads_created_at_idx on public.leads (created_at desc);
create index metric_access_tokens_token_hash_idx on public.metric_access_tokens (token_hash);
create index metric_access_tokens_expires_at_idx on public.metric_access_tokens (expires_at);
create index instagram_metric_snapshots_collected_at_idx
  on public.instagram_metric_snapshots (collected_at desc);
