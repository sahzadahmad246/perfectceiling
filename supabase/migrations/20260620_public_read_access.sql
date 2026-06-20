-- Public read access for the marketing site (no login required).
-- Run this in the Supabase SQL editor if anonymous users cannot see business settings.

grant usage on schema public to anon, authenticated;

grant select on table public.business_settings to anon, authenticated;
grant select on table public.projects to anon, authenticated;
grant select on table public.blog_posts to anon, authenticated;

drop policy if exists "Public can read business settings" on public.business_settings;
create policy "Public can read business settings"
on public.business_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can read published projects" on public.projects;
create policy "Anyone can read published projects"
on public.projects
for select
to anon, authenticated
using (published = true);

drop policy if exists "Anyone can read published blog posts" on public.blog_posts;
create policy "Anyone can read published blog posts"
on public.blog_posts
for select
to anon, authenticated
using (published = true);

-- hero_slides (safe if table already exists from earlier migration)
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  media_type text not null check (media_type in ('image', 'video')),
  media_url text not null,
  poster_url text,
  overlay_title text not null,
  overlay_subtitle text,
  duration_ms int not null default 8000,
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hero_slides enable row level security;

grant select on table public.hero_slides to anon, authenticated;

drop policy if exists "Anyone can read published hero slides" on public.hero_slides;
create policy "Anyone can read published hero slides"
on public.hero_slides
for select
to anon, authenticated
using (published = true);

drop policy if exists "Authenticated users can manage hero slides" on public.hero_slides;
create policy "Authenticated users can manage hero slides"
on public.hero_slides
for all
to authenticated
using (true)
with check (true);