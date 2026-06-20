create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null,
  content text,
  starting_price numeric(12,2),
  rate_unit text,
  seo_title text,
  seo_description text,
  featured_image_url text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;

grant select on table public.services to anon, authenticated;

drop policy if exists "Anyone can read published services" on public.services;
create policy "Anyone can read published services"
on public.services
for select
to anon, authenticated
using (published = true);

drop policy if exists "Authenticated users can manage services" on public.services;
create policy "Authenticated users can manage services"
on public.services
for all
to authenticated
using (true)
with check (true);