create table if not exists public.quotation_item_images (
  id uuid primary key default gen_random_uuid(),
  quotation_item_id uuid not null references public.quotation_items(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists quotation_item_images_item_id_idx
  on public.quotation_item_images (quotation_item_id);

alter table public.quotation_item_images enable row level security;

drop policy if exists "Authenticated users can manage quotation item images"
  on public.quotation_item_images;
create policy "Authenticated users can manage quotation item images"
on public.quotation_item_images
for all
to authenticated
using (true)
with check (true);