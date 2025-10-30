-- Add size_lengths column to products for storing per-size lengths in centimetres

alter table if exists public.products
  add column if not exists size_lengths jsonb default '{}'::jsonb;

comment on column public.products.size_lengths is 'Per-size length map in centimetres';
