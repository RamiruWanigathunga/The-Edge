# Shop Registration Maintenance

## Open or Close New Shop Requests

Use Supabase Dashboard -> SQL Editor.

Open registration:

```sql
select private.set_shop_registration_enabled(true);
```

Close registration:

```sql
select private.set_shop_registration_enabled(false);
```

When closed, `/shop-registration` shows a closed message and the database blocks new requests.

## Review Requests

Use Supabase Dashboard -> Table Editor -> `shops`.

Check rows where:

```text
status = pending
```

Review the shop name, slug, owner name (`owner_name`), email (`contact_email`), payment link, description, and category (`tagline`/`categories`).

## Approve a Request

Copy the `id` from the pending `shops` row.

Use Supabase Dashboard -> SQL Editor:

```sql
select private.approve_shop('PASTE_SHOP_ID_HERE');
```

This flips `is_approved`/`status` to approved on that same row and assigns a `letter_code` if it doesn't already have one — there's no separate registration row to sync.

After approval, the vendor signs in with the same Google account at:

```text
/vendor/login
```

## Reject a Request

Copy the `id` from the pending `shops` row.

Use Supabase Dashboard -> SQL Editor:

```sql
select private.reject_shop('PASTE_SHOP_ID_HERE');
```

This marks the shop as `rejected`. It stays in the table (for reference) but is not visible publicly and grants no vendor access.

## Vendor Access Rules

Vendors must sign in with Google.

Only a user whose Google account owns an approved shop can access `/vendor/[slug]`.

Pending or rejected shops cannot sell, create menus, or view vendor orders.

## If a Vendor Cannot Log In

Check these in Supabase, on the `shops` row for that vendor:

1. A row exists in `shops` with `owner_id` matching the vendor's `auth.users.id`.
2. `shops.is_approved` is `true`.
3. `shops.status` is `approved`.
