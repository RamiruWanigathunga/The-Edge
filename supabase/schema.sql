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
  tier text not null default 'bronze' check (tier in ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
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


-- Shop Registrations (applications)
create table public.shop_registrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shop_name text not null,
  slug text not null unique,
  owner_name text not null,
  email text not null,
  payment_link text not null,
  description text,
  category text,
  logo_url text,
  banner_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
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

create unique index shop_registrations_one_pending_per_user
on public.shop_registrations (user_id)
where status = 'pending';

create index shop_registrations_user_id_idx on public.shop_registrations (user_id);
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

-- Admin helper: approve a registration and create the live shop
create or replace function private.approve_shop_registration(p_registration_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_registration public.shop_registrations%rowtype;
  v_shop_id uuid;
  v_letter_code text;
begin
  select *
  into v_registration
  from public.shop_registrations
  where id = p_registration_id
    and status = 'pending'
  for update;

  if not found then
    raise exception 'Pending shop registration not found';
  end if;

  v_letter_code := upper(
    left(regexp_replace(v_registration.shop_name, '[^a-zA-Z0-9]+', '', 'g'), 2)
  );

  insert into public.shops (
    owner_id,
    slug,
    name,
    tagline,
    description,
    logo_url,
    banner_url,
    categories,
    payment_link,
    letter_code,
    is_approved,
    status
  ) values (
    v_registration.user_id,
    v_registration.slug,
    v_registration.shop_name,
    v_registration.category,
    v_registration.description,
    v_registration.logo_url,
    v_registration.banner_url,
    case
      when v_registration.category is null or v_registration.category = '' then null
      else array[v_registration.category]
    end,
    v_registration.payment_link,
    coalesce(nullif(v_letter_code, ''), 'XX'),
    true,
    'approved'
  )
  returning id into v_shop_id;

  update public.shop_registrations
  set status = 'approved'
  where id = p_registration_id;

  return v_shop_id;
end;
$$;

-- Admin helper: reject a pending registration
create or replace function private.reject_shop_registration(p_registration_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  update public.shop_registrations
  set status = 'rejected'
  where id = p_registration_id
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
alter table public.shop_registrations enable row level security;
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

-- Shops: anyone can read approved shops, approved owners can update safe shop fields
create policy "Public can read approved shops" on public.shops
  for select to anon, authenticated
  using (is_approved = true and status = 'approved');
create policy "Approved owners can read own shops" on public.shops
  for select to authenticated
  using (auth.uid() = owner_id and is_approved = true and status = 'approved');
create policy "Approved owners can update own shops" on public.shops
  for update to authenticated
  using (auth.uid() = owner_id and is_approved = true and status = 'approved')
  with check (auth.uid() = owner_id and is_approved = true and status = 'approved');

-- Menu Items: public only sees available items from approved shops; approved owners manage their menus
create policy "Public can read available menu items from approved shops" on public.menu_items
  for select to anon, authenticated
  using (
    is_available = true
    and exists (
      select 1 from public.shops
      where id = menu_items.shop_id
        and is_approved = true
        and status = 'approved'
    )
  );
create policy "Approved owners can read own menu items" on public.menu_items
  for select to authenticated
  using (
    exists (
      select 1 from public.shops
      where id = menu_items.shop_id
        and owner_id = auth.uid()
        and is_approved = true
        and status = 'approved'
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

-- Orders: Users can read own, vendors can read their shop's orders
create policy "Users can read own orders" on public.orders
  for select to authenticated
  using (auth.uid() = user_id);
create policy "Vendors can read approved shop orders" on public.orders
  for select to authenticated
  using (
    exists (
      select 1 from public.shops
      where id = orders.shop_id
        and owner_id = auth.uid()
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

-- Order Items
create policy "Users can read own order items" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders
      where id = order_items.order_id
        and user_id = auth.uid()
    )
  );
create policy "Vendors can read approved shop order items" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.shops
      where id = order_items.shop_id
        and owner_id = auth.uid()
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

-- Registrations: logged-in users can apply only while the Supabase flag is enabled
create policy "Applicants can submit own pending registration when enabled" on public.shop_registrations
  for insert to authenticated
  with check (
    auth.uid() = user_id
    and status = 'pending'
    and exists (
      select 1 from public.app_settings
      where key = 'shop_registration_enabled'
        and value = 'true'::jsonb
    )
  );
create policy "Applicants can read own registration" on public.shop_registrations
  for select to authenticated
  using (auth.uid() = user_id);

revoke insert, delete on public.shops from authenticated;
revoke update on public.shops from authenticated;
grant update (
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
  available_time_slots
) on public.shops to authenticated;

revoke update on public.orders from authenticated;
grant update (status) on public.orders to authenticated;

-- 5. REALTIME
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_items;
