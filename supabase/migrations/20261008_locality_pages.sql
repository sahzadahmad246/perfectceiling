-- Public readers see published pages only. Admin writes pass through authenticated
-- server actions and the server-only service role, never the browser.
create table if not exists public.locality_pages (
 id uuid primary key default gen_random_uuid(),
 name text not null, city text not null, city_slug text not null,
 slug text not null default '', intro text not null default '',
 content text not null default '', local_details text not null default '',
 seo_title text not null default '', seo_description text not null default '',
 service_ids uuid[] not null default '{}', project_ids uuid[] not null default '{}',
 faqs jsonb not null default '[]', published boolean not null default false,
 updated_at timestamptz not null default now(),
 unique(city_slug, slug),
 check (city_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 check (slug = '' or slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 check (jsonb_typeof(faqs) = 'array')
);
alter table public.locality_pages enable row level security;
drop policy if exists "Read published locality pages" on public.locality_pages;
create policy "Read published locality pages" on public.locality_pages for select to anon, authenticated using (published);
grant select on public.locality_pages to anon, authenticated;
grant all on public.locality_pages to service_role;
