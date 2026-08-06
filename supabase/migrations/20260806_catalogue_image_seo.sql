-- Image SEO fields for catalogue (run after 20260806_add_catalogue_images.sql).
-- Caption stays the visible title; alt_text is for accessibility / image search.

alter table public.catalogue_images
  add column if not exists alt_text text;
