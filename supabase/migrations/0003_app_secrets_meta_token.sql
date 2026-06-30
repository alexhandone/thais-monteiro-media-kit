create table if not exists public.app_secrets (
  key text primary key,
  encrypted_value text not null,
  updated_at timestamptz not null default now(),
  tested_at timestamptz,
  last_test_error text
);

alter table public.app_secrets enable row level security;
