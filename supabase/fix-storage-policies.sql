-- Run this in the Supabase SQL editor if logo uploads fail with
-- "new row violates row-level security policy".

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'business-assets',
  'business-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can read business assets" on storage.objects;
create policy "Anyone can read business assets"
on storage.objects
for select
to anon
using (bucket_id = 'business-assets');

drop policy if exists "Authenticated users can read business assets" on storage.objects;
create policy "Authenticated users can read business assets"
on storage.objects
for select
to authenticated
using (bucket_id = 'business-assets');

drop policy if exists "Authenticated users can upload business assets" on storage.objects;
create policy "Authenticated users can upload business assets"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'business-assets');

drop policy if exists "Authenticated users can update business assets" on storage.objects;
create policy "Authenticated users can update business assets"
on storage.objects
for update
to authenticated
using (bucket_id = 'business-assets')
with check (bucket_id = 'business-assets');

drop policy if exists "Authenticated users can delete business assets" on storage.objects;
create policy "Authenticated users can delete business assets"
on storage.objects
for delete
to authenticated
using (bucket_id = 'business-assets');