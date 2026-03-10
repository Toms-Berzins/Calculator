-- ============================================================
-- QuoteCalc — Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension (already enabled on Supabase by default)
create extension if not exists "pgcrypto";

-- ── Customers ────────────────────────────────────────────────
create table if not exists public.customers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  company    text,
  email      text,
  phone      text,
  created_at timestamptz not null default now()
);

-- ── Jobs ─────────────────────────────────────────────────────
create type if not exists job_status as enum ('open', 'won', 'lost', 'archived');

create table if not exists public.jobs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  customer_id uuid not null references public.customers(id) on delete cascade,
  status      job_status not null default 'open',
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz not null default now()
);

-- ── Quotes ───────────────────────────────────────────────────
create type if not exists quote_status as enum ('draft', 'sent', 'accepted', 'rejected');

create table if not exists public.quotes (
  id         uuid primary key default gen_random_uuid(),
  job_id     uuid not null references public.jobs(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  status     quote_status not null default 'draft',
  subtotal   numeric(10, 2) not null default 0,
  tax_rate   numeric(5, 2) not null default 0,
  total      numeric(10, 2) not null default 0,
  notes      text,
  pdf_url    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger quotes_updated_at
  before update on public.quotes
  for each row execute procedure public.set_updated_at();

-- ── Quote Items ───────────────────────────────────────────────
create table if not exists public.quote_items (
  id          uuid primary key default gen_random_uuid(),
  quote_id    uuid not null references public.quotes(id) on delete cascade,
  description text not null,
  quantity    numeric(10, 3) not null default 1,
  unit_price  numeric(10, 2) not null default 0,
  subtotal    numeric(10, 2) not null default 0,
  sort_order  integer not null default 0
);

-- ── Row Level Security ────────────────────────────────────────
-- Both authenticated employees can read/write everything.
-- Adjust if you later need per-user restrictions.

alter table public.customers enable row level security;
alter table public.jobs enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;

-- Customers
create policy "employees_all_customers"
  on public.customers for all
  to authenticated
  using (true)
  with check (true);

-- Jobs
create policy "employees_all_jobs"
  on public.jobs for all
  to authenticated
  using (true)
  with check (true);

-- Quotes
create policy "employees_all_quotes"
  on public.quotes for all
  to authenticated
  using (true)
  with check (true);

-- Quote items
create policy "employees_all_quote_items"
  on public.quote_items for all
  to authenticated
  using (true)
  with check (true);

-- ── Storage bucket for PDFs ───────────────────────────────────
-- Run in Supabase Dashboard → Storage → New bucket: "pdfs" (public)
-- Or via API:
-- insert into storage.buckets (id, name, public) values ('pdfs', 'pdfs', true);

-- Allow authenticated users to upload/read PDFs
create policy "employees_pdf_upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'pdfs');

create policy "employees_pdf_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'pdfs');

create policy "employees_pdf_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'pdfs');

-- ── Realtime ──────────────────────────────────────────────────
-- Enable realtime on quotes table (Dashboard → Database → Replication)
-- Or via SQL:
alter publication supabase_realtime add table public.quotes;
