-- Design catalogue images for homepage (admin-managed, SEO-friendly captions).
-- Run in Supabase SQL Editor (or via CLI) before using /admin/catalogue.

create table if not exists public.catalogue_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text not null,
  caption text not null,
  seo_title text,
  seo_description text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists catalogue_images_sort_idx
  on public.catalogue_images (sort_order, created_at desc);

alter table public.catalogue_images enable row level security;

grant select on table public.catalogue_images to anon, authenticated;

drop policy if exists "Anyone can read published catalogue images" on public.catalogue_images;
create policy "Anyone can read published catalogue images"
on public.catalogue_images
for select
to anon, authenticated
using (published = true);

drop policy if exists "Authenticated users can manage catalogue images" on public.catalogue_images;
create policy "Authenticated users can manage catalogue images"
on public.catalogue_images
for all
to authenticated
using (true)
with check (true);
