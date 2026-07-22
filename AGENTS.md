# Repository Guidelines

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


## Project Structure & Module Organization

This is a Next.js App Router application. Route files live in `app/`, with pages such as `app/browse/page.tsx`, dynamic routes like `app/shop/[slug]/page.tsx`, and API/auth handlers under `app/auth/`. Shared UI belongs in `components/`, grouped by purpose: `layout`, `shop`, `ui`, and `auth`. Utilities live in `lib/`; Supabase helpers are in `lib/supabase/`. Zustand stores are in `store/`. Static PWA assets, icons, and images are in `public/`. Database schema reference lives in `supabase/schema.sql`.

## Build, Test, and Development Commands

- `npm run dev`: start the local Next.js development server.
- `npm run build`: create a production build and catch type/build errors.
- `npm run start`: serve the production build after `npm run build`.
- `npm run lint`: run ESLint with Next.js Core Web Vitals and TypeScript rules.
- `npm run lint:fix`: auto-fix lint issues where possible.

No dedicated test command is configured; use lint and build as minimum PR verification.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Follow Next.js App Router conventions: `page.tsx`, `layout.tsx`, `route.ts`, and bracketed dynamic segments such as `[slug]`. Use the `@/*` path alias for root-relative imports. Prefer PascalCase components, hooks as `useSomething`, and utility files in lower camel case or existing local style. Keep ESLint warnings actionable; `@typescript-eslint/no-explicit-any` is allowed only as a warning, not a default choice.

## Testing Guidelines

There is no test framework wired in yet. When one is introduced, prefer colocated `*.test.ts` or `*.test.tsx` files for logic-heavy changes. Until then, manually verify affected browser flows and run lint/build checks.

## Commit & Pull Request Guidelines

Recent history uses short, descriptive commit messages such as `receipt refined` and `vendor login added`. Keep commits focused and use concise subject lines. PRs should include a short summary, verification steps, linked issue or task when available, and screenshots for UI changes, especially mobile views.

## Security & Configuration Tips

Do not expose Supabase service-role keys in client code. Keep browser-safe clients separate from server/admin helpers in `lib/supabase/`. Review `supabase/schema.sql` and row-level security expectations before changing vendor, order, profile, or shop data access.

## Agent-Specific Instructions

- Try running the `npm run build` at the end.
- Do not explain anything, keep it short; give only the one-line commit message summary.

## Maintenance Notes
- **README Updated**: A full visual guide and codebase walkthrough is now available in `README.md`.
- **Auth URLs**: Separate routes for `/login` and `/signup` have been implemented.
- **Vendor Access**: Vendor login is at `/vendor/login` and requires manual whitelisting in Supabase by an admin.
- **Shop Registration**: New shops apply at `/shop-registration`, inserted directly into `public.shops` with `status='pending'` (no separate staging table). Admins approve via SQL editor (`select private.approve_shop('ID')`). See `README.md` for details.
