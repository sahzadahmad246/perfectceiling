-- View counts for catalogue photos, blog articles, and service pages.
-- Run in Supabase → SQL Editor (or supabase db push).
-- Existing rows start at 0; no backfill of historical traffic is possible.

alter table public.catalogue_group_images
  add column if not exists view_count integer not null default 0;

alter table public.blog_posts
  add column if not exists view_count integer not null default 0;

alter table public.services
  add column if not exists view_count integer not null default 0;

create index if not exists catalogue_group_images_view_count_idx
  on public.catalogue_group_images (view_count desc);

create index if not exists blog_posts_view_count_idx
  on public.blog_posts (view_count desc);

create index if not exists services_view_count_idx
  on public.services (view_count desc);

comment on column public.catalogue_group_images.view_count is
  'Public views of this photo (counted when a visitor actually looks at it).';
comment on column public.blog_posts.view_count is
  'Public page views of this article (once per browser session).';
comment on column public.services.view_count is
  'Public page views of this service article (once per browser session).';

-- Anonymous clients cannot UPDATE these tables. Increment only through this RPC.
create or replace function public.increment_content_view(
  p_kind text,
  p_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  if p_kind = 'catalogue_image' then
    update public.catalogue_group_images as image
    set view_count = image.view_count + 1
    from public.catalogue_groups as grp
    where image.id = p_id
      and image.group_id = grp.id
      and grp.published = true
    returning image.view_count into new_count;
  elsif p_kind = 'blog' then
    update public.blog_posts
    set view_count = view_count + 1
    where id = p_id
      and published = true
    returning view_count into new_count;
  elsif p_kind = 'service' then
    update public.services
    set view_count = view_count + 1
    where id = p_id
      and published = true
    returning view_count into new_count;
  else
    return null;
  end if;

  return new_count;
end;
$$;

revoke all on function public.increment_content_view(text, uuid) from public;
grant execute on function public.increment_content_view(text, uuid) to anon, authenticated;
