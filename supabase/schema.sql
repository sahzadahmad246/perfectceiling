create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  provider text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  whatsapp text,
  email text,
  address text,
  city text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  quotation_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  date date not null default current_date,
  valid_until date,
  work_title text,
  subtotal numeric(12, 2) not null default 0,
  discount_type text not null default 'fixed'
    check (discount_type in ('fixed', 'percentage')),
  discount_value numeric(12, 2) not null default 0,
  tax_value numeric(12, 2) not null default 0,
  grand_total numeric(12, 2) not null default 0,
  terms text,
  status text not null default 'draft'
    check (
      status in (
        'draft',
        'created',
        'rejected',
        'expired',
        'in_progress',
        'completed'
      )
    ),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  description text not null,
  unit_type text not null default 'sq_ft'
    check (unit_type in ('sq_ft', 'running_ft', 'piece', 'lump_sum')),
  quantity numeric(12, 2) not null default 1,
  rate numeric(12, 2) not null default 0,
  amount numeric(12, 2) not null default 0,
  notes text,
  sort_order integer not null default 0
);

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

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  quotation_id uuid references public.quotations(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  work_title text,
  invoice_date date not null default current_date,
  due_date date,
  subtotal numeric(12, 2) not null default 0,
  discount_type text not null default 'fixed'
    check (discount_type in ('fixed', 'percentage')),
  discount_value numeric(12, 2) not null default 0,
  tax_value numeric(12, 2) not null default 0,
  grand_total numeric(12, 2) not null default 0,
  paid_amount numeric(12, 2) not null default 0,
  balance_amount numeric(12, 2) not null default 0,
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'partial', 'paid')),
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null,
  unit_type text not null default 'sq_ft'
    check (unit_type in ('sq_ft', 'running_ft', 'piece', 'lump_sum')),
  quantity numeric(12, 2) not null default 1,
  rate numeric(12, 2) not null default 0,
  amount numeric(12, 2) not null default 0,
  notes text,
  sort_order integer not null default 0
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(12, 2) not null,
  payment_method text,
  payment_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Perfect Ceiling',
  logo_url text,
  phone text,
  whatsapp text,
  email text,
  address text,
  city text,
  service_areas text,
  gst_number text,
  bank_details text,
  default_quotation_terms text,
  default_invoice_terms text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.business_settings (business_name)
select 'Perfect Ceiling'
where not exists (select 1 from public.business_settings);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  location text,
  service_type text,
  description text,
  short_description text,
  images text[] not null default '{}',
  featured_image_url text,
  before_image_url text,
  after_image_url text,
  status text not null default 'completed'
    check (status in ('ongoing', 'completed', 'on_hold')),
  completed_at date,
  sort_order int not null default 0,
  show_on_homepage boolean not null default true,
  published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text not null,
  content text,
  starting_price numeric(12,2),
  rate_unit text,
  seo_title text,
  seo_description text,
  featured_image_url text,
  published boolean not null default false,
  sort_order int not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  featured_image_url text,
  category text,
  seo_title text,
  seo_description text,
  published boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customers enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.quotation_item_images enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.business_settings enable row level security;
alter table public.projects enable row level security;
alter table public.hero_slides enable row level security;
alter table public.services enable row level security;
alter table public.blog_posts enable row level security;

drop policy if exists "Authenticated users can manage customers" on public.customers;
create policy "Authenticated users can manage customers"
on public.customers
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage quotations" on public.quotations;
create policy "Authenticated users can manage quotations"
on public.quotations
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage quotation items" on public.quotation_items;
create policy "Authenticated users can manage quotation items"
on public.quotation_items
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage quotation item images"
  on public.quotation_item_images;
create policy "Authenticated users can manage quotation item images"
on public.quotation_item_images
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage invoices" on public.invoices;
create policy "Authenticated users can manage invoices"
on public.invoices
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage invoice items" on public.invoice_items;
create policy "Authenticated users can manage invoice items"
on public.invoice_items
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage payments" on public.payments;
create policy "Authenticated users can manage payments"
on public.payments
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read business settings" on public.business_settings;
create policy "Public can read business settings"
on public.business_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated users can manage business settings" on public.business_settings;
create policy "Authenticated users can manage business settings"
on public.business_settings
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage projects" on public.projects;
create policy "Authenticated users can manage projects"
on public.projects
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Anyone can read published projects" on public.projects;
create policy "Anyone can read published projects"
on public.projects
for select
to anon, authenticated
using (published = true);

drop policy if exists "Anyone can read published services" on public.services;
create policy "Anyone can read published services"
on public.services
for select
to anon, authenticated
using (published = true);

drop policy if exists "Authenticated users can manage services" on public.services;
create policy "Authenticated users can manage services"
on public.services
for all
to authenticated
using (true)
with check (true);

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

drop policy if exists "Authenticated users can manage blog posts" on public.blog_posts;
create policy "Authenticated users can manage blog posts"
on public.blog_posts
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Anyone can read published blog posts" on public.blog_posts;
create policy "Anyone can read published blog posts"
on public.blog_posts
for select
to anon, authenticated
using (published = true);

grant usage on schema public to anon, authenticated;
grant select on table public.business_settings to anon, authenticated;
grant select on table public.projects to anon, authenticated;
grant select on table public.hero_slides to anon, authenticated;
grant select on table public.services to anon, authenticated;
grant select on table public.blog_posts to anon, authenticated;

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
  15728640,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm']
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
