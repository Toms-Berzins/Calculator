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

alter table public.customers add column if not exists address     text;
alter table public.customers add column if not exists vat_number  text;

-- ── Jobs ─────────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'job_status'
  ) then
    create type job_status as enum ('open', 'won', 'lost', 'archived');
  end if;
end $$;

create table if not exists public.jobs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  customer_id uuid not null references public.customers(id) on delete cascade,
  status      job_status not null default 'open',
  created_by  uuid not null references auth.users(id),
  created_at  timestamptz not null default now()
);

-- ── Calculator Settings ────────────────────────────────────
create table if not exists public.calculator_settings (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null unique references auth.users(id) on delete cascade,
  material_price_per_kg     numeric(10, 2) not null default 24,
  machine_rate_per_hour     numeric(10, 2) not null default 6,
  labor_rate_per_hour       numeric(10, 2) not null default 20,
  power_consumption_kw      numeric(10, 3) not null default 0.22,
  electricity_rate_per_kwh  numeric(10, 2) not null default 0.18,
  failure_rate_percent      numeric(5, 2) not null default 12,
  margin_percent            numeric(5, 2) not null default 35,
  -- Extra % added to raw filament cost to cover supports, brims, purge lines & waste
  material_overhead_percent numeric(5, 2) not null default 10,
  packaging_cost            numeric(10, 2) not null default 0,
  shipping_cost             numeric(10, 2) not null default 0,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ── Migration: add material_overhead_percent to existing databases ────────────
alter table public.calculator_settings
  add column if not exists material_overhead_percent numeric(5, 2) not null default 10;

alter table public.calculator_settings
  add column if not exists packaging_cost numeric(10, 2) not null default 0;

alter table public.calculator_settings
  add column if not exists shipping_cost numeric(10, 2) not null default 0;

-- ── Migration: add company/supplier info to existing databases ───────────────
alter table public.calculator_settings
  add column if not exists company_name text;

alter table public.calculator_settings
  add column if not exists company_address text;

alter table public.calculator_settings
  add column if not exists company_vat_number text;

alter table public.calculator_settings
  add column if not exists company_email text;

alter table public.calculator_settings
  add column if not exists company_phone text;

alter table public.calculator_settings
  add column if not exists company_website text;

-- ── Quotes ───────────────────────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'quote_status'
  ) then
    create type quote_status as enum ('draft', 'sent', 'accepted', 'rejected');
  end if;
end $$;

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

create trigger calculator_settings_updated_at
  before update on public.calculator_settings
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
alter table public.calculator_settings enable row level security;
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

-- Calculator settings (per-user)
create policy "users_own_calculator_settings"
  on public.calculator_settings for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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
