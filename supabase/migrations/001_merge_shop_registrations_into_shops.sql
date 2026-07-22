-- ONE-TIME MIGRATION: merge public.shop_registrations into public.shops
-- Run this once in the Supabase SQL Editor against your existing project.
-- Confirmed with the project owner: no pending/rejected shop_registrations rows
-- need to be preserved, so this is a clean cutover (no data copy step).
--
-- After this runs, supabase/schema.sql reflects the new single-table design —
-- treat that file as the source of truth for a fresh install going forward.

-- 1. New columns on shops (captures what shop_registrations used to capture)
alter table public.shops add column if not exists owner_name text;
alter table public.shops add column if not exists contact_email text;

-- 2. Drop the old staging table and its approve/reject functions
drop table if exists public.shop_registrations;
drop function if exists private.approve_shop_registration(uuid);
drop function if exists private.reject_shop_registration(uuid);

-- 3. New one-pending-per-owner constraint (replaces the old per-user index on shop_registrations)
drop index if exists shops_one_pending_per_owner;
create unique index shops_one_pending_per_owner
on public.shops (owner_id)
where status = 'pending';

-- 4. New approve/reject functions operating directly on shops
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

-- 5. New RLS policies so applicants can submit/read their own pending shop row
drop policy if exists "Applicants can submit own pending shop" on public.shops;
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

drop policy if exists "Applicants can read own shop application" on public.shops;
create policy "Applicants can read own shop application" on public.shops
  for select to authenticated
  using (auth.uid() = owner_id);

-- 6. Column-scoped insert grant (mirrors the existing column-scoped update grant pattern) —
-- deliberately excludes is_approved/status/rating/letter_code/etc, so those can only ever
-- come from column defaults (is_approved=false, status='pending'), never client-supplied.
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
