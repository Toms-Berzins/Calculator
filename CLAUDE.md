# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint via next lint
npm run test         # Vitest (watch mode)
npm run test:run     # Vitest (single run, no watch)
npm run test:coverage # Coverage report
```

Run a single test file:
```bash
npx vitest run src/hooks/useQuoteCalculator.test.ts
```

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Supabase** for auth and database (PostgreSQL)
- **Tailwind CSS v4** for styling, plus CSS Modules for component-scoped styles
- **Vitest** + Testing Library for tests (jsdom environment)
- **@react-pdf/renderer** for PDF generation

## Architecture

### Route Groups

- `src/app/(app)/` — authenticated app routes (dashboard, jobs, customers, quotes). The layout at `src/app/(app)/layout.tsx` wraps all authenticated pages.
- `src/app/(auth)/` — unauthenticated routes (login, forgot-password).
- `src/app/materials/` — materials/stock management page (outside the `(app)` group, but still auth-gated via middleware).
- `src/app/api/` — API routes (e.g., address search proxy).

### Auth & Middleware

Authentication is handled by Supabase SSR. `src/middleware.ts` calls `updateSession` on every request except static assets. The Supabase client is instantiated differently per context:
- `src/lib/supabase/server.ts` — Server Components / Server Actions (`createServerSupabaseClient`)
- `src/lib/supabase/client.ts` — Client Components
- `src/lib/supabase/middleware.ts` — Middleware session refresh

### Server Actions

All mutations go through Next.js Server Actions in `src/lib/actions/`. Each action creates its own Supabase client and calls `revalidatePath` after mutations. Actions are `'use server'` modules.

### Core Domain: Quote Pricing

The business logic lives in `src/hooks/useQuoteCalculator.ts`:
- `calculate3DPrintPrice(input)` — pure function that computes a full cost breakdown for a single 3D-printed item (material, machine, labor, energy, risk, margin). Margin is a **true profit margin** (profit as % of selling price), not a markup.
- `useQuoteCalculator(items, taxRate)` — React reducer hook managing a list of `LineItem`s plus tax rate, with derived subtotal/total.

Job-level constants (per-job overrides of calculator settings) are managed in `src/components/NewQuoteForm/useJobConstants.ts`.

### Database Schema

Schema is in `supabase/schema.sql`. Key tables:
- `customers` — name, company, email, phone, address, vat_number
- `jobs` — linked to a customer; status enum: `open | won | lost | archived`. Job status auto-updates when a quote is accepted/rejected (all-rejected → lost).
- `quotes` — linked to a job; status: `draft | sent | accepted | rejected`. Only `draft` quotes can be deleted.
- `quote_items` — line items for a quote.
- `calculator_settings` — one row per user; all pricing defaults (rates, margin, overhead, etc.).

### i18n

Two locales: `en` and `lv` (Latvian, the default). Locale is stored in a cookie (`LOCALE_COOKIE`).
- Server Components: `getDict()` / `getLocale()` from `src/i18n/server.ts`
- Client Components: `useT()` / `useLocale()` from `src/i18n/context.tsx` — requires `<TranslationsProvider>` in the layout.

All user-visible strings must be added to both `src/i18n/en.ts` and `src/i18n/lv.ts`.

### Path Alias

`@/` maps to `src/`. Use it for all internal imports.
