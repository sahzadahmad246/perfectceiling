-- Customer honorific title (Mr., Mrs., Ms., Dr., M/s) shown before the name.
-- Safe to re-run: uses IF NOT EXISTS.
alter table public.customers
  add column if not exists title text;
