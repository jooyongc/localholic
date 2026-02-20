-- ============================================================
-- Localholic Database Schema
-- Supabase SQL Editor에서 실행
-- ============================================================

-- 0. Extensions
-- ============================================================
create extension if not exists "pgcrypto";

-- 1. Custom Types (Enums)
-- ============================================================
create type user_role as enum ('admin', 'user');
create type story_status as enum ('draft', 'published', 'archived');
create type product_status as enum ('draft', 'active', 'sold_out', 'archived');
create type travel_status as enum ('draft', 'active', 'closed', 'archived');
create type order_type as enum ('product', 'travel');
create type payment_status as enum ('pending', 'paid', 'cancelled', 'refunded');
create type order_item_type as enum ('product', 'travel');

-- 2. Tables
-- ============================================================

-- 2-1. profiles
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text,
  phone       text,
  avatar_url  text,
  role        user_role not null default 'user',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2-2. stories
create table stories (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  content          text,
  raw_content      text,
  thumbnail_url    text,
  category         text,
  tags             text[] default '{}',
  meta_title       text,
  meta_description text,
  author_id        uuid not null references profiles(id) on delete cascade,
  status           story_status not null default 'draft',
  view_count       integer not null default 0,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 2-3. products
create table products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  description      text,
  content          text,
  price            integer not null default 0,
  sale_price       integer,
  stock_quantity   integer not null default 0,
  category         text,
  region           text,
  images           jsonb not null default '[]'::jsonb,
  thumbnail_url    text,
  status           product_status not null default 'draft',
  meta_title       text,
  meta_description text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- 2-4. travel_programs
create table travel_programs (
  id                    uuid primary key default gen_random_uuid(),
  title                 text not null,
  slug                  text not null unique,
  description           text,
  content               text,
  price                 integer not null default 0,
  max_participants      integer not null default 0,
  current_participants  integer not null default 0,
  region                text,
  duration              text,
  start_date            date,
  end_date              date,
  itinerary             jsonb not null default '[]'::jsonb,
  images                jsonb not null default '[]'::jsonb,
  thumbnail_url         text,
  status                travel_status not null default 'draft',
  meta_title            text,
  meta_description      text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- 2-5. orders
create table orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text not null unique,
  user_id           uuid not null references profiles(id) on delete cascade,
  order_type        order_type not null,
  total_amount      integer not null default 0,
  payment_status    payment_status not null default 'pending',
  payment_key       text,
  shipping_address  jsonb,
  buyer_name        text not null,
  buyer_phone       text not null,
  buyer_email       text not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 2-6. order_items
create table order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders(id) on delete cascade,
  item_type   order_item_type not null,
  item_id     uuid not null,
  item_name   text not null,
  quantity    integer not null default 1,
  unit_price  integer not null default 0,
  total_price integer not null default 0,
  options     jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- 2-7. media
create table media (
  id          uuid primary key default gen_random_uuid(),
  file_name   text not null,
  file_url    text not null,
  file_type   text not null,
  file_size   integer not null default 0,
  uploaded_by uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);

-- 3. Indexes
-- ============================================================

-- stories
create index idx_stories_slug       on stories(slug);
create index idx_stories_status     on stories(status);
create index idx_stories_category   on stories(category);
create index idx_stories_created_at on stories(created_at desc);
create index idx_stories_published  on stories(status, published_at desc)
  where status = 'published';

-- products
create index idx_products_slug       on products(slug);
create index idx_products_status     on products(status);
create index idx_products_category   on products(category);
create index idx_products_region     on products(region);
create index idx_products_created_at on products(created_at desc);

-- travel_programs
create index idx_travel_slug       on travel_programs(slug);
create index idx_travel_status     on travel_programs(status);
create index idx_travel_region     on travel_programs(region);
create index idx_travel_created_at on travel_programs(created_at desc);
create index idx_travel_dates      on travel_programs(start_date, end_date);

-- orders
create index idx_orders_user_id    on orders(user_id);
create index idx_orders_status     on orders(payment_status);
create index idx_orders_created_at on orders(created_at desc);

-- order_items
create index idx_order_items_order on order_items(order_id);
create index idx_order_items_item  on order_items(item_type, item_id);

-- media
create index idx_media_uploaded_by on media(uploaded_by);

-- 4. Functions
-- ============================================================

-- 4-1. updated_at 자동 갱신 트리거
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
  before update on profiles for each row execute function update_updated_at();
create trigger trg_stories_updated_at
  before update on stories for each row execute function update_updated_at();
create trigger trg_products_updated_at
  before update on products for each row execute function update_updated_at();
create trigger trg_travel_updated_at
  before update on travel_programs for each row execute function update_updated_at();
create trigger trg_orders_updated_at
  before update on orders for each row execute function update_updated_at();

-- 4-2. 주문번호 자동 생성 (ORD-YYYYMMDD-XXXXX)
create or replace function generate_order_number()
returns trigger as $$
declare
  seq integer;
begin
  select count(*) + 1 into seq
  from orders
  where created_at::date = current_date;

  new.order_number = 'ORD-' || to_char(current_date, 'YYYYMMDD') || '-' || lpad(seq::text, 5, '0');
  return new;
end;
$$ language plpgsql;

create trigger trg_orders_number
  before insert on orders for each row execute function generate_order_number();

-- 4-3. 회원가입 시 profiles 자동 생성
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- 4-4. admin 권한 확인 헬퍼
create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer stable;

-- 5. Row Level Security
-- ============================================================

alter table profiles        enable row level security;
alter table stories         enable row level security;
alter table products        enable row level security;
alter table travel_programs enable row level security;
alter table orders          enable row level security;
alter table order_items     enable row level security;
alter table media           enable row level security;

-- ── profiles ──

create policy "profiles_select_own"
  on profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_all"
  on profiles for all
  to authenticated
  using (is_admin());

-- ── stories ──

create policy "stories_select_published"
  on stories for select
  to anon, authenticated
  using (status = 'published');

create policy "stories_admin_all"
  on stories for all
  to authenticated
  using (is_admin());

-- ── products ──

create policy "products_select_active"
  on products for select
  to anon, authenticated
  using (status = 'active');

create policy "products_admin_all"
  on products for all
  to authenticated
  using (is_admin());

-- ── travel_programs ──

create policy "travel_select_active"
  on travel_programs for select
  to anon, authenticated
  using (status = 'active');

create policy "travel_admin_all"
  on travel_programs for all
  to authenticated
  using (is_admin());

-- ── orders ──

create policy "orders_select_own"
  on orders for select
  to authenticated
  using (user_id = auth.uid());

create policy "orders_insert_own"
  on orders for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "orders_admin_all"
  on orders for all
  to authenticated
  using (is_admin());

-- ── order_items ──

create policy "order_items_select_own"
  on order_items for select
  to authenticated
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "order_items_insert_own"
  on order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "order_items_admin_all"
  on order_items for all
  to authenticated
  using (is_admin());

-- ── media ──

create policy "media_select_all"
  on media for select
  to anon, authenticated
  using (true);

create policy "media_insert_auth"
  on media for insert
  to authenticated
  with check (uploaded_by = auth.uid());

create policy "media_admin_all"
  on media for all
  to authenticated
  using (is_admin());
