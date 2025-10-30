-- Update cart_items uniqueness to support per-length variants

alter table if exists public.cart_items
  drop constraint if exists cart_items_cart_id_product_id_size_key;

create unique index if not exists idx_cart_items_unique_with_length
  on public.cart_items (cart_id, product_id, size, length)
  where length is not null;

create unique index if not exists idx_cart_items_unique_without_length
  on public.cart_items (cart_id, product_id, size)
  where length is null;

drop index if exists idx_cart_items_cart_product;

create index if not exists idx_cart_items_cart_product_length
  on public.cart_items (cart_id, product_id, size, length);
