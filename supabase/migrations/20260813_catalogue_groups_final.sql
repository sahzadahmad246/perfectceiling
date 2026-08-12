-- Perfect Ceiling: catalogue image GROUPS schema (final).
-- Use this after storage files are already deleted from Dashboard.
--
-- Run once in Supabase → SQL Editor.
-- Safe to re-run (idempotent).

-- ---------------------------------------------------------------------------
-- 0) Drop old flat-image tables if they still exist
-- ---------------------------------------------------------------------------
drop table if exists public.catalogue_images_legacy;
drop table if exists public.catalogue_images;

-- ---------------------------------------------------------------------------
-- 1) Groups (e.g. "Moldings", "False ceiling")
-- ---------------------------------------------------------------------------
create table if not exists public.catalogue_groups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists catalogue_groups_sort_idx
  on public.catalogue_groups (sort_order, created_at desc);

alter table public.catalogue_groups enable row level security;

grant select on table public.catalogue_groups to anon, authenticated;

drop policy if exists "Anyone can read published catalogue groups" on public.catalogue_groups;
create policy "Anyone can read published catalogue groups"
on public.catalogue_groups
for select
to anon, authenticated
using (published = true);

drop policy if exists "Authenticated users can manage catalogue groups" on public.catalogue_groups;
create policy "Authenticated users can manage catalogue groups"
on public.catalogue_groups
for all
to authenticated
using (true)
with check (true);

-- ---------------------------------------------------------------------------
-- 2) Group images (each photo + optional subtitle / alt)
-- ---------------------------------------------------------------------------
create table if not exists public.catalogue_group_images (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.catalogue_groups(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  subtitle text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists catalogue_group_images_group_id_idx
  on public.catalogue_group_images (group_id, sort_order, created_at);

alter table public.catalogue_group_images enable row level security;

grant select on table public.catalogue_group_images to anon, authenticated;

drop policy if exists "Anyone can read published catalogue group images"
  on public.catalogue_group_images;
create policy "Anyone can read published catalogue group images"
on public.catalogue_group_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.catalogue_groups g
    where g.id = group_id
      and g.published = true
  )
);

drop policy if exists "Authenticated users can manage catalogue group images"
  on public.catalogue_group_images;
create policy "Authenticated users can manage catalogue group images"
on public.catalogue_group_images
for all
to authenticated
using (true)
with check (true);

-- ---------------------------------------------------------------------------
-- 3) Clear any leftover rows so catalogue starts empty
-- ---------------------------------------------------------------------------
truncate table public.catalogue_group_images restart identity cascade;
truncate table public.catalogue_groups restart identity cascade;
