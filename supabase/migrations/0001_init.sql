-- Initial schema for the Luxenails storefront
set check_function_bodies = off;

create table if not exists public.users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  first_name text not null,
  last_name text not null,
  avatar text,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id text primary key,
  user_id text not null references public.users (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.collections (
  id text primary key,
  name text not null,
  description text,
  slug text not null unique,
  image text,
  product_count integer not null default 0,
  featured boolean not null default false
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text,
  price numeric not null,
  compare_at_price numeric,
  images jsonb not null default '[]'::jsonb,
  category text not null,
  collection_slug text references public.collections (slug) on delete set null,
  in_stock boolean not null default true,
  stock_quantity integer not null default 0,
  sizes jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  application text,
  materials jsonb not null default '[]'::jsonb,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  featured boolean not null default false,
  rating numeric not null default 0,
  review_count integer not null default 0
);

create table if not exists public.reviews (
  id text primary key,
  product_id text not null references public.products (id) on delete cascade,
  user_id text references public.users (id) on delete set null,
  user_name text not null,
  rating integer not null,
  title text not null,
  comment text not null,
  images jsonb not null default '[]'::jsonb,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id text primary key,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  cover_image text,
  author_name text not null,
  author_avatar text,
  category text not null,
  tags jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  read_time integer not null default 0
);

create table if not exists public.carts (
  id text primary key,
  user_id text references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_items (
  id text primary key,
  cart_id text not null references public.carts (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  size text not null,
  quantity integer not null,
  added_at timestamptz not null default now(),
  unique (cart_id, product_id, size)
);

create table if not exists public.orders (
  id text primary key,
  user_id text references public.users (id) on delete set null,
  order_number text not null unique,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null,
  tax numeric not null,
  shipping numeric not null,
  total numeric not null,
  status text not null,
  shipping_address jsonb not null default '{}'::jsonb,
  billing_address jsonb not null default '{}'::jsonb,
  payment_method text not null,
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id text primary key,
  user_id text not null references public.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null,
  phone text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists addresses_user_id_idx on public.addresses(user_id);

create table if not exists public.wishlist_items (
  id text primary key,
  user_id text not null references public.users (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  added_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.support_tickets (
  id text primary key,
  name text not null,
  email text not null,
  topic text not null,
  order_number text,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.return_requests (
  id text primary key,
  order_number text not null,
  email text not null,
  reason text not null,
  items text not null,
  status text not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  user_id text primary key references public.users (id) on delete cascade,
  marketing_emails boolean not null default true,
  product_alerts boolean not null default true,
  sms_updates boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.password_reset_tokens (
  id text primary key,
  user_id text not null references public.users (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create unique index if not exists password_reset_tokens_user_idx on public.password_reset_tokens(user_id);
