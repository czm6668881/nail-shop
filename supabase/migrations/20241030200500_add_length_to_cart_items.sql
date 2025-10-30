-- Add length column to cart_items for per-size length data

alter table if exists public.cart_items
  add column if not exists length double precision;

comment on column public.cart_items.length is 'Selected length in centimetres for the cart item';
