-- Hero slides support for storefront marketing carousel
create extension if not exists "pgcrypto";

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image text not null,
  button_text text,
  button_link text,
  order_index integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_hero_slides_active_order
  on public.hero_slides (active, order_index);

drop trigger if exists trg_hero_slides_touch_updated_at on public.hero_slides;
create trigger trg_hero_slides_touch_updated_at
before update on public.hero_slides
for each row
execute function public.touch_updated_at();

