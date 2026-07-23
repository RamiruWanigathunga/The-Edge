-- Cleanup pass: drop duplicate indexes and merge redundant permissive RLS policies.
-- Purely a performance/maintenance change — every merged policy is verified to grant
-- the exact same access as the union of the policies it replaces, nothing more/less.

-- 1. Duplicate indexes (identical btree indexes on the same column, just double-created)
drop index if exists public.idx_menu_items_shop;
drop index if exists public.idx_order_items_order;
drop index if exists public.idx_user_cart_user;

-- 2. menu_items SELECT: merge "public can read available items from approved shops"
--    with "owners can read own items" (owners see their own items regardless of availability)
drop policy if exists "Public can read available menu items from approved shops" on public.menu_items;
drop policy if exists "Approved owners can read own menu items" on public.menu_items;
create policy "Read menu items (public available + own shop)" on public.menu_items
  for select to anon, authenticated
  using (
    (is_available = true and exists (
      select 1 from public.shops
      where shops.id = menu_items.shop_id and shops.is_approved = true and shops.status = 'approved'
    ))
    or exists (
      select 1 from public.shops
      where shops.id = menu_items.shop_id
        and shops.owner_id = (select auth.uid())
        and shops.is_approved = true and shops.status = 'approved'
    )
  );

-- 3. order_items SELECT: merge "customer reads own order items" with "vendor reads own shop's order items"
drop policy if exists "Users can read own order items" on public.order_items;
drop policy if exists "Vendors can read approved shop order items" on public.order_items;
create policy "Read order items (own order + own shop)" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id and orders.user_id = (select auth.uid())
    )
    or exists (
      select 1 from public.shops
      where shops.id = order_items.shop_id
        and shops.owner_id = (select auth.uid())
        and shops.is_approved = true and shops.status = 'approved'
    )
  );

-- 4. orders SELECT: merge "customer reads own orders" with "vendor reads own shop's orders"
drop policy if exists "Users can read own orders" on public.orders;
drop policy if exists "Vendors can read approved shop orders" on public.orders;
create policy "Read orders (own order + own shop)" on public.orders
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.shops
      where shops.id = orders.shop_id
        and shops.owner_id = (select auth.uid())
        and shops.is_approved = true and shops.status = 'approved'
    )
  );

-- 5. shops SELECT: "Approved owners can read own shops" was a strict subset of
--    "Applicants can read own shop application" (owner_id match alone already grants
--    read regardless of approval status), so it added nothing — folding all three
--    down to: public can read approved shops, OR you own the row (pending or approved).
drop policy if exists "Public can read approved shops" on public.shops;
drop policy if exists "Applicants can read own shop application" on public.shops;
drop policy if exists "Approved owners can read own shops" on public.shops;
create policy "Read shops (public approved + own)" on public.shops
  for select to anon, authenticated
  using (
    (is_approved = true and status = 'approved')
    or auth.uid() = owner_id
  );
