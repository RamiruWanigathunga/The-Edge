# THE EDGE

**Your campus, served faster.**  
A high-performance, real-time PWA for campus food discovery and ordering.

---

## App Architecture & Flow

### Customer Journey
```mermaid
graph TD
    A[Landing/Home] --> B[Browse Shops]
    B --> C[Shop Profile]
    C --> D[Menu Item Modal]
    D --> E[Real-time Cart]
    E --> F[Checkout]
    F --> G[Order Receipt]
    G --> H[Order History]
```

### Vendor Operations
```mermaid
graph LR
    V[Vendor Login] --> D[Kitchen Dashboard]
    D --> O[Live Order Tracking]
    D --> M[Menu Management]
    D --> S[Shop Settings]
```

---

## Mechanics & Tech Stack

### Authentication System
- **Sign Up (`/signup`)**: Standard Google OAuth. Creates a new profile in Supabase.
- **Log In (`/login`)**: Verified Google OAuth. If no account exists, the session is rejected to prevent accidental duplicates.
- **Vendor Access (`/vendor/login`)**: **Strictly Restricted.** Vendors must have their email manually added to the Supabase database by an administrator. There is no public "Vendor Sign Up" flow to ensure only authorized shops can access the platform.

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

### Handling Shop Registrations
When a user submits a request via `/shop-registration`, it enters a `pending` state. Admins must manually approve these requests to create a shop and grant vendor access.

#### 1. Open/Close Registration
Run this in the Supabase SQL Editor:
- **Open**: `select private.set_shop_registration_enabled(true);`
- **Close**: `select private.set_shop_registration_enabled(false);`

#### 2. Approve a Shop
1. Find the `id` of the request in the `shop_registrations` table.
2. Run in SQL Editor: `select private.approve_shop_registration('ID_HERE');`
   - *This automatically creates the shop row and links the owner's Google ID.*

#### 3. Reject a Request
Run in SQL Editor: `select private.reject_shop_registration('ID_HERE');`

### Vendor Access Troubleshooting
If a vendor is approved but cannot log in:
1. Ensure `shops.owner_id` matches their `auth.users` UUID.
2. Verify `shops.is_approved` is `true`.
3. Check that the vendor is using the **exact same Google account** they used to apply.
├── lib/                  # Core Utilities
│   ├── supabase/         # Client/Server/Admin Supabase Helpers
│   └── designSystem.ts   # Design Tokens & Palette
├── store/                # Zustand State Management (Cart, Profile)
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
