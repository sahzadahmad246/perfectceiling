-- Catalogue image groups: one group (e.g. "Moldings") with many photos.
-- Each photo has an optional subtitle (also used as alt text).
-- Migrates existing flat catalogue_images rows into groups (1 image each).
-- Old catalogue_images table is renamed to catalogue_images_legacy (safe to drop later).

-- ---------------------------------------------------------------------------
-- Groups
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
-- Group images
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

-- Public can read images belonging to published groups.
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
-- Migrate existing flat catalogue_images → groups + one image each
-- (preserves IDs so /catalogue/[id] URLs stay valid)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.catalogue_images') is not null
     and not exists (select 1 from public.catalogue_groups limit 1)
  then
    insert into public.catalogue_groups (
      id,
      title,
      description,
      published,
      sort_order,
      created_by,
      created_at,
      updated_at
    )
    select
      id,
      caption,
      nullif(trim(coalesce(seo_description, '')), ''),
      published,
      sort_order,
      created_by,
      created_at,
      updated_at
    from public.catalogue_images;

    insert into public.catalogue_group_images (
      group_id,
      image_url,
      storage_path,
      subtitle,
      sort_order,
      created_at
    )
    select
      id,
      image_url,
      storage_path,
      nullif(trim(coalesce(alt_text, '')), ''),
      0,
      created_at
    from public.catalogue_images;
  end if;
end $$;

-- Keep old table as legacy backup (drop manually after verifying migration).
do $$
begin
  if to_regclass('public.catalogue_images') is not null
     and to_regclass('public.catalogue_images_legacy') is null
  then
    alter table public.catalogue_images rename to catalogue_images_legacy;
  end if;
end $$;
