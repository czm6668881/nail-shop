alter table if exists public.users
  add column if not exists google_id text unique;
