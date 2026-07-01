create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  password_hash text not null,
  role text not null default 'admin',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.admin_users(id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create table if not exists public.site_page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  referrer text,
  ip_hash text,
  user_agent_hash text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.site_page_views enable row level security;

create index if not exists admin_users_email_idx on public.admin_users (lower(email));
create index if not exists admin_sessions_token_hash_idx on public.admin_sessions (token_hash);
create index if not exists admin_sessions_expires_at_idx on public.admin_sessions (expires_at);
create index if not exists site_page_views_created_at_idx on public.site_page_views (created_at desc);
create index if not exists site_page_views_path_idx on public.site_page_views (path);
