# Admin Projects — Field Spec

## Supabase SQL required

Before using `/admin/projects`, run this once in **Supabase → SQL Editor**:

```sql
-- File: supabase/migrations/20260623_add_project_fields.sql
alter table public.projects
  add column if not exists status text not null default 'completed'
    check (status in ('ongoing', 'completed', 'on_hold')),
  add column if not exists featured_image_url text,
  add column if not exists short_description text,
  add column if not exists sort_order int not null default 0,
  add column if not exists show_on_homepage boolean not null default true;
```

Without this migration, the admin projects page will error when loading or saving.

---

## Implemented (lightweight v1)

- `/admin/projects` — list, search, add, edit, delete
- Single form (not multi-step): title, slug, locality, service type, descriptions, status, photos, publish toggles
- Multiple photos with featured image picker
- Public homepage reads published projects with `show_on_homepage = true`

---

# Original spec (reference)

Review notes from the original planning document.

**Goal:** Let admin add real ceiling work as projects, then show them on the public site (home page gallery, future `/projects` page, and optionally the hero carousel).

---

## What we already have in the database

The `projects` table already exists with these columns:

| Column | Type | Notes |
|--------|------|--------|
| `title` | text | Required |
| `slug` | text | Required, unique URL |
| `location` | text | Optional — good fit for **locality / society name only** |
| `service_type` | text | Optional — e.g. "POP false ceiling" |
| `description` | text | Optional — short public summary |
| `images` | text[] | Gallery URLs |
| `before_image_url` | text | Optional |
| `after_image_url` | text | Optional |
| `completed_at` | date | Optional |
| `published` | boolean | Default `false` — draft until admin publishes |
| `created_at` / `updated_at` | timestamptz | Auto |

**Public site today uses:** title, location, service type, description, first/after image, completed date, published flag.

---

## Your ideas — recommendation

### 1. Images ✅ (keep + improve)

| Field | Admin | Public | Recommendation |
|-------|-------|--------|----------------|
| **Gallery images** (`images[]`) | Upload multiple | Carousel / grid | Main photo source |
| **Featured image** | Pick one from gallery | Card + hero | **Add** `featured_image_url` so admin chooses cover (instead of always using first image) |
| **Before photo** | Optional upload | Before/after slider | Keep — strong trust signal for ceiling work |
| **After photo** | Optional upload | Before/after slider | Keep |

**Admin UX:** Multi-image upload (same pattern as quotation item images), drag to reorder, set featured, optional before/after pair.

---

### 2. Title ✅ (keep)

| Field | Example |
|-------|---------|
| `title` | "POP false ceiling with cove lighting — master bedroom" |

Auto-generate `slug` from title (editable).

---

### 3. Location — locality only ✅ (keep `location`, clarify usage)

| Field | Admin label | Public display | Do NOT store |
|-------|-------------|----------------|--------------|
| `location` | "Area / society / locality" | "DHA Phase 6", "Bahria Town", "Gulberg" | Full street address, house number, GPS |

Optional **add** for cleaner data:

| New field | Type | Example |
|-----------|------|---------|
| `city` | text | "Lahore" — default from business settings |
| `locality` | text | "DHA Phase 6" |

**Recommendation:** Start with single `location` field (locality text only) + helper text in admin: *"Society or area name only — not full address."* Add `city` only if you often work in multiple cities.

---

### 4. Client name ⚠️ (add — admin-first, public optional)

| Field | Type | Public? | Recommendation |
|-------|------|---------|----------------|
| `client_name` | text | **No by default** | For your records |
| `show_client_name` | boolean | Only if `true` | e.g. show "Ahmed K." or "Private residence" |
| `client_display_name` | text | If shown | Public-safe label: "Homeowner, DHA" instead of full name |

**Why:** Useful internally and for invoices/quotations later, but many clients won't want their name on the website. Default = hidden.

---

### 5. Project status ✅ (add — you said ongoing / completed)

| Field | Type | Values | Public? |
|-------|------|--------|---------|
| `status` | enum | `ongoing`, `completed`, `on_hold` | Yes — badge on card |

| Status | Meaning | Show on public site? |
|--------|---------|----------------------|
| `ongoing` | Work in progress | Optional — good for "live work" trust |
| `completed` | Finished | Yes — main gallery content |
| `on_hold` | Paused / cancelled | Admin only (not published) |

**Note:** This is **project workflow status**, not a star rating review. See §9 for customer reviews.

When `status = completed`, set `completed_at` (date picker).

---

## Additional fields I recommend

### High value (suggest for v1)

| Field | Type | Admin | Public | Why |
|-------|------|-------|--------|-----|
| `linked_service_id` | uuid FK → `services` | Dropdown | Link to service page | Connects project to POP / PVC / Gypsum service |
| `property_type` | enum | Select | Tag/chip | `home`, `shop`, `office`, `restaurant`, `other` |
| `room_or_space` | text | Optional | Subtitle | "Master bedroom", "Shop hall", "Office cabin" |
| `area_sq_ft` | number | Optional | Optional | "Approx. 450 sq ft" — helps leads compare |
| `short_description` | text (160 chars) | Required for publish | Card teaser | 1–2 lines; full `description` can be longer |
| `sort_order` | int | Drag reorder in admin | Home page order | Control which projects appear first |
| `show_on_homepage` | boolean | Toggle | Home section | Not every project needs home visibility |
| `published` | boolean | Toggle | All public pages | Draft vs live (already exists) |

### Medium value (v2)

| Field | Type | Why |
|-------|------|-----|
| `started_at` | date | Timeline: "Started Jan 2026 → Completed Mar 2026" |
| `seo_title` / `seo_description` | text | For future `/projects/[slug]` detail pages |
| `tags` | text[] | Filter: "cove lighting", "repair", "PVC kitchen" |
| `is_featured` | boolean | Pin to hero carousel |

### Lower priority (later)

| Field | Why |
|-------|-----|
| Link to `customer_id` | If same person exists in customers table |
| Link to `quotation_id` / `invoice_id` | Trace project back to paid work |
| `materials_used` | Internal notes |
| `team_size` | Rarely needed publicly |

---

## Customer review vs project status

Please confirm you mean **project status** (ongoing/completed), not Google-style reviews.

If you also want **client feedback** later:

| Field | Type | Public |
|-------|------|--------|
| `client_rating` | 1–5 | Optional |
| `client_testimonial` | text | Only with permission |
| `testimonial_approved` | boolean | Must be true to show |

**Recommendation:** Ship **project status** in v1. Add testimonials in v2 when you collect reviews.

---

## Suggested admin form (single page or step modal)

### Step 1 — Basics
- Title *
- Slug (auto)
- Linked service (dropdown from published services)
- Property type
- Room / space (optional)
- Area (sq ft, optional)

### Step 2 — Location & client
- Locality / society name * (not full address)
- City (default from business settings)
- Client name (admin only)
- Show client on website? (toggle + display name)

### Step 3 — Status & dates
- Status: Ongoing / Completed / On hold
- Started date (optional)
- Completed date (if completed)

### Step 4 — Photos
- Upload gallery (multiple)
- Set featured image
- Before photo (optional)
- After photo (optional)

### Step 5 — Copy & publish
- Short description * (for cards)
- Full description (optional, longer story)
- Show on homepage (toggle)
- Sort order
- Published (toggle)

---

## Public page display (proposed)

### Home page — "Completed projects"
- Featured image (carousel if multiple)
- Service type chip
- Title
- Locality (not full address)
- Short description (2 lines max)
- Status badge if `ongoing` (optional)
- Link → future project detail page

### Future `/projects` page
- Grid of published projects
- Filter by service / property type / status

### Future `/projects/[slug]` page
- Full gallery + before/after
- Description, area, dates, linked service CTA

---

## Database changes summary

### Use as-is (no migration)
- `title`, `slug`, `location`, `service_type`, `description`, `images`, `before_image_url`, `after_image_url`, `completed_at`, `published`

### Recommended new columns (migration)

```sql
-- v1
alter table public.projects
  add column if not exists status text not null default 'completed'
    check (status in ('ongoing', 'completed', 'on_hold')),
  add column if not exists client_name text,
  add column if not exists show_client_name boolean not null default false,
  add column if not exists client_display_name text,
  add column if not exists featured_image_url text,
  add column if not exists short_description text,
  add column if not exists property_type text
    check (property_type in ('home', 'shop', 'office', 'restaurant', 'other')),
  add column if not exists room_or_space text,
  add column if not exists area_sq_ft numeric(10,2),
  add column if not exists linked_service_id uuid references public.services(id) on delete set null,
  add column if not exists started_at date,
  add column if not exists sort_order int not null default 0,
  add column if not exists show_on_homepage boolean not null default true;
```

---

## MVP scope for `/admin/projects` (after you confirm)

1. List projects (draft / published / status filters)
2. Add project modal or page
3. Edit / delete project
4. Image upload to Supabase storage
5. Publish toggle
6. Wire home page to new fields (`short_description`, `featured_image_url`, `status`)

**Out of scope for first build** (unless you ask):
- Public `/projects/[slug]` detail page
- Testimonials / star ratings
- Before/after slider component
- Customer / quotation linking

---

## Decisions needed from you

Please reply with ✅ or changes:

1. **Location** — Single `location` field (locality only) OK? Or split into `city` + `locality`?
2. **Client name** — Admin-only by default, optional public display name?
3. **Status** — `ongoing` | `completed` | `on_hold` — correct list?
4. **Images** — Add `featured_image_url` + keep before/after?
5. **Link to service** — Dropdown to existing services (POP, PVC, etc.)?
6. **Property type** — home / shop / office / restaurant / other?
7. **Short vs full description** — Both fields?
8. **Show ongoing projects** on public site, or only completed?
9. **Customer reviews** — Skip for v1?
10. **Anything to remove** from the list above?

Once you confirm, we implement admin add/edit projects and connect the public home gallery.