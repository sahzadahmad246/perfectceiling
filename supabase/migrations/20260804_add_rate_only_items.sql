-- Rate-only line items: show rate without contributing to totals.
-- Safe to re-run: uses IF NOT EXISTS.
alter table public.quotation_items
  add column if not exists is_rate_only boolean not null default false;

alter table public.invoice_items
  add column if not exists is_rate_only boolean not null default false;
