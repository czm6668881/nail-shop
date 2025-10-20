-- Inventory and performance enhancements for real-time commerce flows
create extension if not exists "pgcrypto";

create table if not exists public.inventory_events (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products (id) on delete cascade,
  delta integer not null,
  previous_quantity integer not null,
  new_quantity integer not null,
  reason text not null,
  reference_type text,
  reference_id text,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists inventory_events_product_created_idx
  on public.inventory_events (product_id, created_at desc);

create or replace function public.adjust_inventory(
  p_product_id text,
  p_delta integer,
  p_reason text default 'manual_adjustment',
  p_reference_type text default null,
  p_reference_id text default null,
  p_context jsonb default '{}'::jsonb
) returns public.inventory_events
language plpgsql
security definer
as $$
declare
  current_quantity integer;
  new_quantity integer;
  event_row public.inventory_events;
begin
  if p_delta = 0 then
    raise exception 'Inventory delta must not be zero';
  end if;

  select stock_quantity into current_quantity
  from public.products
  where id = p_product_id
  for update;

  if current_quantity is null then
    raise exception 'Product not found'
      using errcode = 'P0002',
            detail = jsonb_build_object(
              'product_id', p_product_id
            )::text;
  end if;

  new_quantity := current_quantity + p_delta;

  if new_quantity < 0 then
    raise exception 'Insufficient stock'
      using errcode = 'P0001',
            detail = jsonb_build_object(
              'product_id', p_product_id,
              'requested_delta', p_delta,
              'available_quantity', current_quantity
            )::text;
  end if;

  update public.products
  set
    stock_quantity = new_quantity,
    in_stock = new_quantity > 0,
    updated_at = now()
  where id = p_product_id;

  insert into public.inventory_events (
    product_id,
    delta,
    previous_quantity,
    new_quantity,
    reason,
    reference_type,
    reference_id,
    context
  )
  values (
    p_product_id,
    p_delta,
    current_quantity,
    new_quantity,
    coalesce(nullif(trim(p_reason), ''), 'manual_adjustment'),
    nullif(trim(p_reference_type), ''),
    nullif(trim(p_reference_id), ''),
    coalesce(p_context, '{}'::jsonb)
  )
  returning * into event_row;

  return event_row;
end;
$$;

create or replace function public.apply_order_inventory()
returns trigger
language plpgsql
security definer
as $$
declare
  item jsonb;
  product_id text;
  quantity integer;
  order_context jsonb;
begin
  order_context := jsonb_build_object(
    'order_number', new.order_number,
    'status', new.status
  );

  for item in
    select value
    from jsonb_array_elements(coalesce(new.items, '[]'::jsonb))
  loop
    product_id := coalesce(item ->> 'productId', item -> 'product' ->> 'id');
    quantity := (item ->> 'quantity')::integer;

    if product_id is null or quantity is null then
      continue;
    end if;

    perform public.adjust_inventory(
      product_id,
      -quantity,
      'order_created',
      'order',
      new.id,
      order_context
    );
  end loop;

  return new;
end;
$$;

create or replace function public.revert_order_inventory()
returns trigger
language plpgsql
security definer
as $$
declare
  item jsonb;
  product_id text;
  quantity integer;
  order_context jsonb;
begin
  if old.status = 'cancelled' or new.status <> 'cancelled' then
    return new;
  end if;

  order_context := jsonb_build_object(
    'order_number', new.order_number,
    'previous_status', old.status
  );

  for item in
    select value
    from jsonb_array_elements(coalesce(new.items, '[]'::jsonb))
  loop
    product_id := coalesce(item ->> 'productId', item -> 'product' ->> 'id');
    quantity := (item ->> 'quantity')::integer;

    if product_id is null or quantity is null then
      continue;
    end if;

    perform public.adjust_inventory(
      product_id,
      quantity,
      'order_cancelled',
      'order',
      new.id,
      order_context
    );
  end loop;

  return new;
end;
$$;

drop trigger if exists trg_orders_apply_inventory on public.orders;
create trigger trg_orders_apply_inventory
after insert on public.orders
for each row
execute function public.apply_order_inventory();

drop trigger if exists trg_orders_revert_inventory on public.orders;
create trigger trg_orders_revert_inventory
after update on public.orders
for each row
execute function public.revert_order_inventory();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_products_touch_updated_at on public.products;
create trigger trg_products_touch_updated_at
before update on public.products
for each row
execute function public.touch_updated_at();

drop trigger if exists trg_carts_touch_updated_at on public.carts;
create trigger trg_carts_touch_updated_at
before update on public.carts
for each row
execute function public.touch_updated_at();

create index if not exists idx_orders_user_id_created_at
  on public.orders (user_id, created_at desc);

create index if not exists idx_cart_items_cart_product
  on public.cart_items (cart_id, product_id, size);

create index if not exists idx_reviews_product_created_at
  on public.reviews (product_id, created_at desc);

create index if not exists idx_wishlist_user_created_at
  on public.wishlist_items (user_id, added_at desc);

create index if not exists idx_products_collection_featured
  on public.products (collection_slug, featured desc, created_at desc);
