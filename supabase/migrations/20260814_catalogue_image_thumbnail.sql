-- Mark one image per catalogue group as the list-card thumbnail/cover.
-- Run in Supabase → SQL Editor after catalogue groups schema exists.

alter table public.catalogue_group_images
  add column if not exists is_thumbnail boolean not null default false;

-- At most one thumbnail per group (Postgres partial unique index).
drop index if exists catalogue_group_images_one_thumbnail_idx;
create unique index catalogue_group_images_one_thumbnail_idx
  on public.catalogue_group_images (group_id)
  where is_thumbnail = true;

-- Backfill: first image (by sort_order, created_at) becomes thumbnail when none set.
with ranked as (
  select
    id,
    group_id,
    row_number() over (
      partition by group_id
      order by sort_order asc, created_at asc, id asc
    ) as rn
  from public.catalogue_group_images
),
groups_without_thumb as (
  select g.id as group_id
  from public.catalogue_groups g
  where not exists (
    select 1
    from public.catalogue_group_images i
    where i.group_id = g.id
      and i.is_thumbnail = true
  )
)
update public.catalogue_group_images img
set is_thumbnail = true
from ranked r
join groups_without_thumb g on g.group_id = r.group_id
where img.id = r.id
  and r.rn = 1;
