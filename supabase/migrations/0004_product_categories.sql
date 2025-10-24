-- Product categories baseline table and seed data

create table if not exists public.product_categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_categories_sort_idx
  on public.product_categories (sort_order asc, name asc);

insert into public.product_categories (id, name, slug, description, sort_order)
values
  ('category-1-classic', 'Classic', 'classic', null, 1),
  ('category-2-french', 'French', 'french', null, 2),
  ('category-3-glitter', 'Glitter', 'glitter', null, 3),
  ('category-4-ombre', 'Ombre', 'ombre', null, 4),
  ('category-5-chrome', 'Chrome', 'chrome', null, 5),
  ('category-6-matte', 'Matte', 'matte', null, 6),
  ('category-7-stiletto', 'Stiletto', 'stiletto', null, 7),
  ('category-8-almond', 'Almond', 'almond', null, 8),
  ('category-9-coffin', 'Coffin', 'coffin', null, 9),
  ('category-10-square', 'Square', 'square', null, 10)
on conflict (id) do nothing;
