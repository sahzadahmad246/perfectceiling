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

update storage.buckets
set
  file_size_limit = 15728640,
  allowed_mime_types = array[
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'video/mp4',
    'video/webm'
  ]
where id = 'business-assets';