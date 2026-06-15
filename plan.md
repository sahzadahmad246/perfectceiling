# Perfect Ceiling Website Plan

## Project Goal

Build an SEO-optimized business website for **Perfect Ceiling**, a ceiling and POP work service business offering:

- POP false ceiling
- PVC ceiling
- Wooden ceiling
- Gypsum ceiling
- POP wall/design work
- Ceiling repair and finishing work
- Related interior ceiling services

The website should work as both:

1. A public SEO website that ranks for local ceiling and POP work searches.
2. An admin business tool for managing leads, customers, quotations, invoices, services, projects, and blog content.

The first version should use a free or low-cost stack as much as possible.

## Recommended Tech Stack

### Core App

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Icons:** lucide-react
- **Forms:** React Hook Form
- **Validation:** Zod

### Backend

- **Database:** Supabase Postgres
- **Authentication:** Supabase Auth with Google login
- **File Storage:** Supabase Storage
- **Server Actions/API:** Next.js Server Actions and Route Handlers

### Documents

- **PDF Generation:** Start with printable HTML, then add `@react-pdf/renderer` if needed.
- **Quotation Sharing:** Download PDF and WhatsApp share link.
- **Invoice Sharing:** Download PDF and WhatsApp share link.

### Hosting

Recommended free/low-cost options:

- **Netlify Free:** Good option for a business site starting out.
- **Cloudflare Pages:** Also worth considering.
- **Vercel:** Great for Next.js, but check commercial usage limits before using free Hobby for a business.

### SEO Tools

- Google Search Console
- Google Analytics, optional at first
- Google Business Profile
- Sitemap
- Robots.txt
- JSON-LD structured data
- Open Graph images

## Design Direction

The site should be **mobile-first**.

Even on desktop, the main content should stay close to a mobile app width:

- Public site max width: around `430px` to `520px`
- Admin dashboard max width can be slightly wider, but still mobile-first
- Sticky bottom CTA on public pages: Call, WhatsApp, Get Quote
- Fast, clean, one-column layout
- Large tap targets
- Real project photos whenever possible
- Avoid heavy desktop-style layouts

The design should feel local, trustworthy, practical, and professional.

## Public Website Pages

### 1. Home Page

URL: `/`

Purpose:

- Explain what Perfect Ceiling does.
- Show main services.
- Push users toward calling, WhatsApp, or requesting a quote.
- Build trust with photos, service areas, and project highlights.

Sections:

- Hero with business name and primary service message
- Call/WhatsApp/Get Quote buttons
- Services overview
- Why choose Perfect Ceiling
- Recent work/gallery preview
- Service areas
- FAQs
- Contact CTA

### 2. Service Pages

Each service should have its own SEO page.

Initial service pages:

- `/services/pop-false-ceiling`
- `/services/pvc-ceiling`
- `/services/wooden-ceiling`
- `/services/gypsum-ceiling`
- `/services/pop-design-work`
- `/services/ceiling-repair`

Each service page should include:

- SEO title
- Meta description
- H1 with the service keyword
- Service explanation
- Benefits
- Approximate pricing guidance
- Work process
- Photos
- FAQs
- Internal links to related services
- Call/WhatsApp/Get Quote CTA

### 3. Location Pages

Location pages are important for local SEO.

Example URL patterns:

- `/pop-false-ceiling-in-city-name`
- `/false-ceiling-contractor-in-city-name`
- `/pvc-ceiling-in-city-name`
- `/pop-work-in-area-name`

Each location page should include:

- Service + location keyword
- Local introduction
- Services offered in that area
- Photos/projects from nearby areas if available
- FAQs
- CTA

Important: only create location pages for real service areas. Do not create spammy pages with fake locations.

### 4. Gallery / Projects

URL: `/projects`

Purpose:

- Show real completed work.
- Improve trust.
- Support SEO with image alt text and project descriptions.

Project fields:

- Project title
- Location
- Service type
- Area/size
- Short description
- Before image
- After image
- More images
- Date completed

### 5. Blog

URL: `/blog`

Purpose:

- Rank for informational searches.
- Educate customers.
- Internally link to service pages.

Initial blog ideas:

- POP ceiling vs PVC ceiling: which is better?
- False ceiling cost per square foot
- Best ceiling design for living room
- PVC ceiling for bathroom and kitchen
- Wooden ceiling design ideas
- POP ceiling maintenance tips
- How to choose a false ceiling contractor
- Gypsum ceiling vs POP ceiling

Each blog post should include:

- Title
- Slug
- Meta title
- Meta description
- Featured image
- Helpful content
- Internal links to service pages
- FAQ section when useful

### 6. Contact / Get Quote

URL: `/contact` or `/get-quote`

Lead form fields:

- Name
- Phone
- WhatsApp number, optional
- Location
- Service needed
- Approximate area
- Message

After submission:

- Save lead in Supabase
- Show success message
- Offer WhatsApp follow-up

## SEO Strategy

### Main Keyword Targets

- POP false ceiling
- POP ceiling work
- false ceiling contractor
- false ceiling work near me
- PVC ceiling
- wooden ceiling
- gypsum ceiling
- POP design work
- ceiling repair
- false ceiling cost per square foot
- POP work contractor

### SEO Requirements

Every public page should have:

- Unique title
- Unique meta description
- Clean URL
- One clear H1
- Proper heading structure
- Internal links
- Optimized images with alt text
- Canonical URL
- Open Graph metadata

Technical SEO:

- `sitemap.xml`
- `robots.txt`
- JSON-LD structured data
- Fast loading pages
- Mobile-first layout
- Server-rendered public content
- No hidden important content behind client-only JavaScript

Structured data:

- LocalBusiness schema
- Service schema
- BlogPosting schema
- BreadcrumbList schema
- FAQPage schema where relevant

### Local SEO

Must create and optimize:

- Google Business Profile
- Business name, address, phone consistency
- Photos of completed work
- Service areas
- Reviews
- Website link

The website should show:

- Business name
- Phone number
- WhatsApp number
- Service areas
- Address, if available
- Opening hours, if available

## Admin Dashboard

URL: `/admin`

Access:

- Google login with Supabase Auth
- Restrict access to approved admin emails only

### Dashboard Home

Show:

- Total leads
- Total customers
- Total quotations
- Total invoices
- Pending quotations
- Pending payments
- Recent leads
- Recent quotations

### Customers

Fields:

- Name
- Phone
- WhatsApp
- Email
- Address
- City/area
- Notes
- Created date

Features:

- Add customer
- Edit customer
- Search customers
- View quotation/invoice history

### Leads

Fields:

- Name
- Phone
- Location
- Service requested
- Approximate area
- Message
- Status: new, contacted, converted, closed
- Created date

Features:

- Convert lead to customer
- Create quotation from lead
- Add notes

### Quotations

Quotation fields:

- Quotation number
- Customer
- Date
- Valid until
- Work title
- Items
- Subtotal
- Discount type: fixed or percentage
- Discount amount
- Tax/GST, optional
- Grand total
- Terms and conditions
- Status: draft, sent, accepted, rejected, expired

Features:

- Create quotation
- Add unlimited items
- Support area-based, running-foot, piece-based, and lump-sum items
- Auto-calculate totals
- Save as draft
- Download/print PDF
- Share via WhatsApp
- Convert quotation to invoice

### Invoices

Invoice fields:

- Invoice number
- Customer
- Invoice date
- Due date
- Items
- Subtotal
- Discount
- Tax/GST, optional
- Grand total
- Paid amount
- Balance amount
- Payment status: unpaid, partial, paid
- Payment method
- Notes

Features:

- Create invoice from quotation
- Create invoice manually
- Add payment record
- Download/print PDF
- Share via WhatsApp

### Services Manager

Fields:

- Title
- Slug
- Short description
- Full content
- Starting price text
- Images
- FAQs
- SEO title
- SEO description
- Published status

### Blog Manager

Fields:

- Title
- Slug
- Excerpt
- Content
- Featured image
- Category
- SEO title
- SEO description
- Published status
- Published date

Features:

- Draft/publish
- Edit post
- Delete post
- SEO preview

### Project Gallery Manager

Fields:

- Title
- Slug
- Location
- Service type
- Description
- Images
- Before/after images
- Completed date
- Published status

## Quotation and Invoice Item System

Each quotation/invoice can have many line items.

Item types:

| Type | Example | Calculation |
| --- | --- | --- |
| Square foot | POP false ceiling, 250 sq ft at rate 120 | quantity × rate |
| Running foot | Cove border, 80 running ft at rate 150 | quantity × rate |
| Piece | Light cutout, 12 pcs at rate 100 | quantity × rate |
| Lump sum | Repair and finishing work for 8000 | fixed amount |

Item fields:

- Description
- Unit type: `sq_ft`, `running_ft`, `piece`, `lump_sum`
- Quantity
- Rate
- Amount
- Notes

Rules:

- For normal items, amount = quantity × rate.
- For lump-sum items, amount = fixed amount.
- Subtotal = sum of item amounts.
- Grand total = subtotal - discount + tax.

## Database Plan

### `profiles`

- `id`
- `email`
- `full_name`
- `avatar_url`
- `role`
- `created_at`

### `customers`

- `id`
- `name`
- `phone`
- `whatsapp`
- `email`
- `address`
- `city`
- `notes`
- `created_at`
- `updated_at`

### `leads`

- `id`
- `name`
- `phone`
- `location`
- `service_requested`
- `approx_area`
- `message`
- `status`
- `created_at`
- `updated_at`

### `services`

- `id`
- `title`
- `slug`
- `short_description`
- `content`
- `starting_price`
- `seo_title`
- `seo_description`
- `published`
- `created_at`
- `updated_at`

### `blog_posts`

- `id`
- `title`
- `slug`
- `excerpt`
- `content`
- `featured_image_url`
- `category`
- `seo_title`
- `seo_description`
- `published`
- `published_at`
- `created_at`
- `updated_at`

### `projects`

- `id`
- `title`
- `slug`
- `location`
- `service_type`
- `description`
- `images`
- `before_image_url`
- `after_image_url`
- `completed_at`
- `published`
- `created_at`
- `updated_at`

### `quotations`

- `id`
- `quotation_number`
- `customer_id`
- `date`
- `valid_until`
- `work_title`
- `subtotal`
- `discount_type`
- `discount_value`
- `tax_value`
- `grand_total`
- `terms`
- `status`
- `created_at`
- `updated_at`

### `quotation_items`

- `id`
- `quotation_id`
- `description`
- `unit_type`
- `quantity`
- `rate`
- `amount`
- `notes`
- `sort_order`

### `invoices`

- `id`
- `invoice_number`
- `quotation_id`
- `customer_id`
- `invoice_date`
- `due_date`
- `subtotal`
- `discount_type`
- `discount_value`
- `tax_value`
- `grand_total`
- `paid_amount`
- `balance_amount`
- `payment_status`
- `notes`
- `created_at`
- `updated_at`

### `invoice_items`

- `id`
- `invoice_id`
- `description`
- `unit_type`
- `quantity`
- `rate`
- `amount`
- `notes`
- `sort_order`

### `payments`

- `id`
- `invoice_id`
- `amount`
- `payment_method`
- `payment_date`
- `notes`
- `created_at`

### `settings`

- `id`
- `business_name`
- `logo_url`
- `phone`
- `whatsapp`
- `email`
- `address`
- `city`
- `service_areas`
- `gst_number`
- `bank_details`
- `default_quotation_terms`
- `default_invoice_terms`
- `created_at`
- `updated_at`

## Security Plan

- Use Supabase Row Level Security.
- Public users can only create leads.
- Public users can only read published services, projects, and blog posts.
- Admin users can manage all dashboard data.
- Admin access should be restricted by approved email list.
- Never expose Supabase service role key in the browser.

## Build Phases

### Phase 1: Foundation and Public SEO Site

- Set up Next.js, TypeScript, Tailwind CSS
- Add app layout
- Add mobile-first design system
- Create home page
- Create service pages
- Create contact/get-quote form
- Add sitemap and robots
- Add metadata and structured data
- Set up Google Search Console

### Phase 2: Supabase and Admin Auth

- Create Supabase project
- Add database schema
- Configure Supabase Auth with Google
- Add admin login
- Add protected admin layout
- Add profile/admin role check

### Phase 3: Leads and Customers

- Save public quote requests as leads
- Build leads dashboard
- Build customer CRUD
- Convert lead to customer

### Phase 4: Quotation Generator

- Build quotation form
- Add dynamic line items
- Add unit types
- Add lump-sum support
- Auto-calculate totals
- Save quotation
- Print/download quotation
- Share quotation via WhatsApp

### Phase 5: Invoice Generator

- Create invoice from quotation
- Create invoice manually
- Track paid and balance amount
- Add payment records
- Print/download invoice
- Share invoice via WhatsApp

### Phase 6: Blog and Project Gallery

- Add blog admin
- Add public blog pages
- Add project gallery admin
- Add public projects page
- Add SEO metadata for dynamic pages

### Phase 7: Local SEO Expansion

- Add location pages
- Add more service pages
- Add FAQs
- Add real project case studies
- Improve internal linking
- Add review/testimonial section

## MVP Scope

The first working version should include:

- Public home page
- Public service pages
- Public contact/get-quote form
- Basic SEO setup
- Supabase database
- Google admin login
- Admin leads
- Admin customers
- Quotation generator
- Printable quotation

Invoice, blog, projects, and location pages can come immediately after MVP.

## Future Ideas

- WhatsApp message templates
- Customer public quotation link
- Customer public invoice link
- Payment reminders
- Expense tracking
- Simple profit reports
- Multi-admin roles
- Review collection form
- Before/after project sliders
- Hindi/English language support
- AI-assisted blog draft generator

## Notes

- Ranking takes time. Expect SEO results to improve over weeks and months, not instantly.
- Real photos, local pages, Google Business Profile, and customer reviews will matter a lot.
- The site should be built so new service pages, blogs, and location pages can be added easily from the admin dashboard.
- Start simple, then improve every month.
