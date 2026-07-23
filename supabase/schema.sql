-- The Edge Phase 2 - Production Schema
-- Final version with Multi-shop support, Daily Codes, and Sync

-- 1. EXTENSIONS
create extension if not exists pgcrypto;
create schema if not exists private;

-- 2. TABLES

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  email text not null default '',
  avatar_url text,
  total_orders integer not null default 0,
  created_at timestamptz not null default now()
);

-- Shops
create table public.shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  emoji text default '🍽️',
  banner_url text,
  logo_url text,
  is_open boolean not null default true,
  closed_note text,
  prep_time_minutes integer not null default 10,
  rating numeric not null default 0,
  review_count integer not null default 0,
  tags text[],
  categories text[],
  payment_link text,
  letter_code text, -- 2 letter code for reference numbers (e.g. 'RS' for Rocky Sweets)
  is_approved boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  available_time_slots jsonb not null default '{"default": ["ASAP"]}'::jsonb,
  opening_time time not null default '08:00:00',
  closing_time time not null default '22:00:00',
  owner_name text, -- captured at application time, for admin contact reference
  contact_email text, -- captured at application time, for admin contact reference
  created_at timestamptz not null default now()
);

-- Menu Items
create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  price_lkr integer not null,
  discount_lkr integer,
  category text not null,
  dietary_tags text[],
  estimated_prep_time_minutes integer not null default 10,
  available_slots text[],
  max_per_order integer,
  is_available boolean not null default true,
  badge text,
  is_popular boolean not null default false,
  search_keywords text[],
  item_time_slots jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Daily Code Sequence (tracks the last used pickup code per day)
create table public.daily_code_sequence (
  code_date date primary key,
  last_code integer not null default 0
);

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  shop_id uuid not null references public.shops(id) on delete cascade,
  daily_code text not null, -- 4 digit code (e.g. 0005)
  reference_number text not null unique, -- Long format (e.g. RS 1230 020526 0005)
  status text not null default 'paid' check (status in ('paid', 'preparing', 'ready', 'completed', 'expired', 'customer_late')),
  total_amount_lkr integer not null,
  pickup_time timestamptz,
  scheduled_slot text not null default 'ASAP',
  note text,
  customer_name text not null default 'Guest',
  payment_confirmed boolean not null default true,
  code_date date not null default current_date,
  created_at timestamptz not null default now()
);

-- Order Items
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid references public.menu_items(id) on delete set null,
  shop_id uuid not null references public.shops(id) on delete cascade,
  item_title text not null,
  item_image_url text,
  quantity integer not null default 1,
  unit_price_lkr integer not null,
  notes text,
  dining text not null default 'takeaway' check (dining in ('dine-in', 'takeaway'))
);

-- Real-time Sync: User Cart
create table public.user_cart (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete cascade,
  quantity integer not null default 1,
  notes text,
  dining text not null default 'takeaway' check (dining in ('dine-in', 'takeaway')),
  scheduled_slot text not null default 'ASAP',
  updated_at timestamptz not null default now()
);

-- Real-time Sync: User Favorites
create table public.user_favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, menu_item_id)
);


-- App Settings
create table public.app_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value, description)
values (
  'shop_registration_enabled',
  'true'::jsonb,
  'Controls whether authenticated users can submit shop registration requests.'
)
on conflict (key) do nothing;

-- A user can only have one shop application pending review at a time
create unique index shops_one_pending_per_owner
on public.shops (owner_id)
where status = 'pending';

create index shops_owner_id_idx on public.shops (owner_id);
create index menu_items_shop_id_idx on public.menu_items (shop_id);
create index orders_user_id_idx on public.orders (user_id);
create index orders_shop_id_idx on public.orders (shop_id);
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_menu_item_id_idx on public.order_items (menu_item_id);
create index order_items_shop_id_idx on public.order_items (shop_id);
create index user_cart_user_id_idx on public.user_cart (user_id);
create index user_cart_menu_item_id_idx on public.user_cart (menu_item_id);
create index user_cart_shop_id_idx on public.user_cart (shop_id);
create index user_favorites_menu_item_id_idx on public.user_favorites (menu_item_id);

-- 3. FUNCTIONS & RPCs

-- Daily Code Generator
create or replace function public.fn_next_daily_code(p_date date)
returns integer
language plpgsql
set search_path = public
as $$
declare
  v_next integer;
begin
  insert into public.daily_code_sequence (code_date, last_code)
  values (p_date, 1)
  on conflict (code_date) do update
  set last_code = daily_code_sequence.last_code + 1
  returning last_code into v_next;
  
  return v_next;
end;
$$;

-- Reference Number Generator
create or replace function public.fn_generate_reference(
  p_shop_id uuid,
  p_date date,
  p_code integer
)
returns text
language plpgsql
set search_path = public
as $$
declare
  v_shop_code text;
  v_time_part text;
  v_date_part text;
begin
  select coalesce(letter_code, 'XX') into v_shop_code from public.shops where id = p_shop_id;
  v_time_part := to_char(now(), 'HH24MI');
  v_date_part := to_char(p_date, 'DDMMYY');
  
  return v_shop_code || ' ' || v_time_part || ' ' || v_date_part || ' ' || lpad(p_code::text, 4, '0');
end;
$$;

-- Atomic Order Creation (Handles code generation and cart cleanup)
create or replace function public.fn_create_order(
  p_user_id uuid,
  p_shop_id uuid,
  p_total integer,
  p_slot text,
  p_note text,
  p_customer_name text,
  p_items jsonb -- Array of {menu_item_id, title, qty, price, notes, dining, image_url}
)
returns text -- Returns the reference number
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_daily_int integer;
  v_daily_str text;
  v_ref text;
  v_item jsonb;
  v_qty integer;
  v_item_id uuid;
  v_item_title text;
  v_item_image_url text;
  v_item_price integer;
  v_computed_total integer := 0;
begin
  if p_user_id is null then
    raise exception 'Order requires an authenticated user';
  end if;

  -- Auto-create profile if missing
  insert into public.profiles (id, email, display_name)
  select u.id, coalesce(u.email, ''), coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', p_customer_name, '')
  from auth.users u
  where u.id = p_user_id
  on conflict (id) do nothing;

  if not exists (
    select 1
    from public.shops
    where id = p_shop_id
      and is_approved = true
      and status = 'approved'
      and is_open = true
  ) then
    raise exception 'Shop is not available for orders';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order requires at least one item';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_item_id := (v_item->>'menu_item_id')::uuid;
    v_qty := greatest(1, (v_item->>'qty')::integer);

    select title, image_url, price_lkr
    into v_item_title, v_item_image_url, v_item_price
    from public.menu_items
    where id = v_item_id
      and shop_id = p_shop_id
      and is_available = true;

    if v_item_title is null then
      raise exception 'Order contains an unavailable item';
    end if;

    v_computed_total := v_computed_total + (v_item_price * v_qty);
  end loop;

  if p_total <> v_computed_total then
    raise exception 'Order total does not match current menu prices';
  end if;

  -- 1. Get next code
  v_daily_int := public.fn_next_daily_code(current_date);
  v_daily_str := lpad(v_daily_int::text, 4, '0');
  v_ref := public.fn_generate_reference(p_shop_id, current_date, v_daily_int);

  -- 2. Create Order
  insert into public.orders (
    user_id, shop_id, daily_code, reference_number, 
    total_amount_lkr, scheduled_slot, note, customer_name
  ) values (
    p_user_id, p_shop_id, v_daily_str, v_ref,
    p_total, p_slot, p_note, p_customer_name
  ) returning id into v_order_id;

  -- 3. Add Items
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_item_id := (v_item->>'menu_item_id')::uuid;
    v_qty := greatest(1, (v_item->>'qty')::integer);

    select title, image_url, price_lkr
    into v_item_title, v_item_image_url, v_item_price
    from public.menu_items
    where id = v_item_id
      and shop_id = p_shop_id
      and is_available = true;

    insert into public.order_items (
      order_id, shop_id, menu_item_id, item_title,
      item_image_url, quantity, unit_price_lkr, notes, dining
    ) values (
      v_order_id, p_shop_id, v_item_id, v_item_title,
      v_item_image_url, v_qty, v_item_price,
      v_item->>'notes', coalesce(v_item->>'dining', 'takeaway')
    );
  end loop;

  -- 4. Increment User Total Orders
  update public.profiles 
  set total_orders = total_orders + 1 
  where id = p_user_id;

  -- 5. Clear items for this shop from user's cart
  delete from public.user_cart 
  where user_id = p_user_id and shop_id = p_shop_id;

  return v_ref;
end;
$$;

-- Auth Hook for Profile Creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- User cart updated_at trigger helper
create or replace function public.handle_cart_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_cart_update
before update on public.user_cart
for each row execute function public.handle_cart_updated_at();

-- Admin helper: approve a pending shop application
create or replace function private.approve_shop(p_shop_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_shop public.shops%rowtype;
  v_letter_code text;
begin
  select *
  into v_shop
  from public.shops
  where id = p_shop_id
    and status = 'pending'
  for update;

  if not found then
    raise exception 'Pending shop not found';
  end if;

  v_letter_code := coalesce(
    nullif(v_shop.letter_code, ''),
    upper(left(regexp_replace(v_shop.name, '[^a-zA-Z0-9]+', '', 'g'), 2))
  );

  update public.shops
  set is_approved = true,
      status = 'approved',
      letter_code = coalesce(nullif(v_letter_code, ''), 'XX')
  where id = p_shop_id;
end;
$$;

-- Admin helper: reject a pending shop application
create or replace function private.reject_shop(p_shop_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  update public.shops
  set status = 'rejected'
  where id = p_shop_id
    and status = 'pending';
end;
$$;

-- Admin helper: open or close public shop registration requests
create or replace function private.set_shop_registration_enabled(p_enabled boolean)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  insert into public.app_settings (key, value, description, updated_at)
  values (
    'shop_registration_enabled',
    to_jsonb(p_enabled),
    'Controls whether authenticated users can submit shop registration requests.',
    now()
  )
  on conflict (key) do update
  set value = excluded.value,
      description = excluded.description,
      updated_at = now();
end;
$$;

revoke all on schema private from public, anon, authenticated;
revoke execute on all functions in schema private from public, anon, authenticated;
revoke execute on function public.fn_create_order(uuid, uuid, integer, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.fn_create_order(uuid, uuid, integer, text, text, text, jsonb) to service_role;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_cart_updated_at() from public, anon, authenticated;

-- 4. RLS POLICIES

alter table public.profiles enable row level security;
alter table public.shops enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.user_cart enable row level security;
alter table public.user_favorites enable row level security;
alter table public.app_settings enable row level security;

-- Profiles: Users can read/update their own
create policy "Users can read own profile" on public.profiles
  for select to authenticated
  using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- App Settings: anyone can read non-secret public settings, only admins edit from Supabase
create policy "Public can read app settings" on public.app_settings
  for select to anon, authenticated
  using (true);

-- Shops: anyone can read approved shops, or your own row (pending or approved) —
-- the old "approved owner" read policy was a strict subset of "own row" so it's folded in.
-- Approved owners can update safe shop fields.
create policy "Read shops (public approved + own)" on public.shops
  for select to anon, authenticated
  using (
    (is_approved = true and status = 'approved')
    or auth.uid() = owner_id
  );
create policy "Approved owners can update own shops" on public.shops
  for update to authenticated
  using (auth.uid() = owner_id and is_approved = true and status = 'approved')
  with check (auth.uid() = owner_id and is_approved = true and status = 'approved');

-- Shops: applicants can submit their own pending application (while registration is open).
-- (Reading their own application is covered by "Read shops (public approved + own)" above.)
create policy "Applicants can submit own pending shop" on public.shops
  for insert to authenticated
  with check (
    auth.uid() = owner_id
    and is_approved = false
    and status = 'pending'
    and exists (
      select 1 from public.app_settings
      where key = 'shop_registration_enabled'
        and value = 'true'::jsonb
    )
  );

-- Menu Items: public sees available items from approved shops; owners also see their own
-- items regardless of availability — merged into one policy since an owner match already
-- implies the shop is theirs.
create policy "Read menu items (public available + own shop)" on public.menu_items
  for select to anon, authenticated
  using (
    (is_available = true and exists (
      select 1 from public.shops
      where id = menu_items.shop_id and is_approved = true and status = 'approved'
    ))
    or exists (
      select 1 from public.shops
      where id = menu_items.shop_id
        and owner_id = (select auth.uid())
        and is_approved = true and status = 'approved'
    )
  );
create policy "Approved owners can insert own menu items" on public.menu_items
  for insert to authenticated
  with check (
    exists (
      select 1 from public.shops
      where id = menu_items.shop_id
        and owner_id = auth.uid()
        and is_approved = true
        and status = 'approved'
    )
  );
create policy "Approved owners can update own menu items" on public.menu_items
  for update to authenticated
  using (
    exists (
      select 1 from public.shops
      where id = menu_items.shop_id
        and owner_id = auth.uid()
        and is_approved = true
        and status = 'approved'
    )
  )
  with check (
    exists (
      select 1 from public.shops
      where id = menu_items.shop_id
        and owner_id = auth.uid()
        and is_approved = true
        and status = 'approved'
    )
  );
create policy "Approved owners can delete own menu items" on public.menu_items
  for delete to authenticated
  using (
    exists (
      select 1 from public.shops
      where id = menu_items.shop_id
        and owner_id = auth.uid()
        and is_approved = true
        and status = 'approved'
    )
  );

-- Orders: users read their own orders, vendors read their shop's orders — merged into one policy.
create policy "Read orders (own order + own shop)" on public.orders
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.shops
      where id = orders.shop_id
        and owner_id = (select auth.uid())
        and is_approved = true
        and status = 'approved'
    )
  );
create policy "Vendors can update approved shop order status" on public.orders
  for update to authenticated
  using (
    exists (
      select 1 from public.shops
      where id = orders.shop_id
        and owner_id = auth.uid()
        and is_approved = true
        and status = 'approved'
    )
  )
  with check (
    exists (
      select 1 from public.shops
      where id = orders.shop_id
        and owner_id = auth.uid()
        and is_approved = true
        and status = 'approved'
    )
  );

create policy "Vendors can delete approved shop orders" on public.orders
  for delete to authenticated
  using (
    exists (
      select 1 from public.shops
      where id = orders.shop_id
        and owner_id = auth.uid()
        and is_approved = true
        and status = 'approved'
    )
  );

-- Order Items: customer reads own order's items, vendor reads own shop's — merged into one policy.
create policy "Read order items (own order + own shop)" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders
      where id = order_items.order_id
        and user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.shops
      where id = order_items.shop_id
        and owner_id = (select auth.uid())
        and is_approved = true
        and status = 'approved'
    )
  );

-- User Cart: Strictly owner only
create policy "Users can manage own cart" on public.user_cart
  for all to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.shops
      where id = user_cart.shop_id
        and is_approved = true
        and status = 'approved'
    )
    and exists (
      select 1 from public.menu_items
      where id = user_cart.menu_item_id
        and shop_id = user_cart.shop_id
        and is_available = true
    )
  );

-- User Favorites: Strictly owner only
create policy "Users can manage own favorites" on public.user_favorites
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke delete on public.shops from authenticated;

revoke insert on public.shops from authenticated;
grant insert (
  owner_id,
  slug,
  name,
  tagline,
  description,
  payment_link,
  logo_url,
  banner_url,
  categories,
  owner_name,
  contact_email
) on public.shops to authenticated;

revoke update on public.shops from authenticated;
grant update (
  name,
  tagline,
  description,
  emoji,
  banner_url,
  logo_url,
  is_open,
  closed_note,
  prep_time_minutes,
  tags,
  categories,
  payment_link,
  available_time_slots,
  opening_time,
  closing_time
) on public.shops to authenticated;

revoke update on public.orders from authenticated;
grant update (status) on public.orders to authenticated;

-- 5. REALTIME
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
