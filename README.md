# The Edge

**Your campus, served faster.**  
A high-performance, real-time PWA for campus food discovery and ordering.

---

## Mechanics & Tech Stack

### Authentication System
- **Sign Up (`/signup`) / Log In (`/login`)**: Both are the same Google OAuth flow (Supabase auto-creates a `profiles` row on first sign-in via the `handle_new_user` trigger) — a user can use either button at any time.
- **Vendor Access (`/vendor/login`)**: Same Google account as above. Vendor dashboard access is granted purely by owning an approved `shops` row (`owner_id` + `is_approved=true` + `status='approved'`) — there's no separate vendor identity, so the same email works for both student ordering and, once approved, the vendor dashboard. New shops apply via `/shop-registration` and wait for admin approval (see Admin Management below).

### Real-time Data Sync
- **Cart & Favorites**: Synced across devices instantly using Supabase Realtime.
- **Order Updates**: Vendors and customers receive live status updates (Paid → Preparing → Ready → Completed).

### Order Logic
- **Daily Pickup Codes**: Resets every 24 hours per shop (e.g., `0005`).
- **Reference Numbers**: Unique format for easy lookup: `[SHOP_CODE] [TIME] [DATE] [CODE]` (e.g., `RS 1230 050526 0005`).

---

## Codebase Structure

```bash
├── app/                  # Next.js App Router
│   ├── login/            # Dedicated Login Page (Google OAuth)
│   ├── signup/           # Dedicated Sign Up Page (Google OAuth)
│   ├── browse/           # Shop Discovery & Search
│   ├── shop/[slug]/      # Individual Shop Menus
│   └── vendor/           # Vendor Dashboard & Restricted Portal
├── components/           # UI Component Library
│   ├── auth/             # Auth Layouts & Logic
│   ├── ui/               # Base Design System (buttons, inputs)
│   ├── shop/             # Shop-specific UI
│   └── layout/           # Shared Layouts (Footer, Navbar)

---

## Admin Management

### Handling Shop Applications
When a user submits a request via `/shop-registration`, it's inserted directly into `public.shops` with `status='pending'`, `is_approved=false` (there's no separate staging table — `shops` itself represents pending/approved/rejected). Admins must manually approve these to grant vendor access.

#### 1. Open/Close Registration
Run this in the Supabase SQL Editor:
- **Open**: `select private.set_shop_registration_enabled(true);`
- **Close**: `select private.set_shop_registration_enabled(false);`

#### 2. Approve a Shop
Run one of the following queries in the Supabase SQL Editor:
```sql
-- Approve by shop ID
SELECT private.approve_shop('SHOP_ID_HERE');

-- Or approve by slug
SELECT private.approve_shop(id)
FROM public.shops
WHERE slug = 'my-shop-slug' AND status = 'pending';
```
*This flips `is_approved`/`status` on the same row and assigns a `letter_code` if it doesn't have one yet.*

#### 3. Reject a Request
Run in SQL Editor: `select private.reject_shop('SHOP_ID_HERE');`

### Vendor Access Troubleshooting
If a vendor is approved but cannot log in:
1. Ensure `shops.owner_id` matches their `auth.users` UUID.
2. Verify `shops.is_approved` is `true`.
3. Check that the vendor is using the **exact same Google account** they used to apply.
├── lib/                  # Core Utilities
│   ├── supabase/         # Client/Server/Admin Supabase Helpers
│   └── designSystem.ts   # Design Tokens & Palette
├── store/                # Zustand State Management (Cart)
└── supabase/             # Database Schema & Migrations
```

---

## Getting Started

1. **Environment**: Copy `.env.example` to `.env.local` and fill in Supabase keys.
2. **Install**: `npm install`
3. **Run**: `npm run dev`
4. **Build**: `npm run build` to verify production readiness.

---

## Admin Notes
- **New Vendors**: To add a vendor, manually add their email to the `auth.users` table in Supabase and associate it with a record in the `public.shops` table.
- **Maintenance**: Use `SHOP_REGISTRATION_MAINTENANCE.md` for details on handling shop applications.


## LICENSE

Copyright (c) 2026 Bro Code Collective

All rights reserved.

This source code and all associated files are the exclusive property of the copyright holders.
No permission is granted to use, copy, modify, merge, publish, distribute, sublicense, or sell this software without prior written permission from the copyright holders.
