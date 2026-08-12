-- Wipe ALL catalogue DB rows (old flat images + new groups).
-- Storage files cannot be deleted via SQL on hosted Supabase
-- (error 42501: use Storage API). Run the companion script instead:
--
--   bun run scripts/wipe-catalogue-storage.ts
--
-- Safe to re-run. After this + storage wipe, re-upload as groups.
-- Does NOT drop catalogue_groups / catalogue_group_images tables.

-- ---------------------------------------------------------------------------
-- 1) Clear new group tables (if they exist)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.catalogue_group_images') is not null then
    delete from public.catalogue_group_images;
  end if;

  if to_regclass('public.catalogue_groups') is not null then
    delete from public.catalogue_groups;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 2) Clear / drop old-style tables if still present
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.catalogue_images') is not null then
    delete from public.catalogue_images;
  end if;

  if to_regclass('public.catalogue_images_legacy') is not null then
    drop table public.catalogue_images_legacy;
  end if;
end $$;

-- Optional verification:
-- select
--   (select count(*) from public.catalogue_groups) as groups,
--   (select count(*) from public.catalogue_group_images) as images;
