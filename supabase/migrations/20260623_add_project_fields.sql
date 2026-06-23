-- Run this in Supabase SQL Editor (or via CLI) before using /admin/projects.
alter table public.projects
  add column if not exists status text not null default 'completed'
    check (status in ('ongoing', 'completed', 'on_hold')),
  add column if not exists featured_image_url text,
  add column if not exists short_description text,
  add column if not exists sort_order int not null default 0,
  add column if not exists show_on_homepage boolean not null default true;