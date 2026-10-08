# Local SEO and Google reporting setup

## Supabase

Run these files in the Supabase SQL Editor, in order:

1. `supabase/migrations/20261008_locality_pages.sql`
2. `supabase/migrations/20261008_catalogue_dimensions.sql`
3. `supabase/migrations/20261008_editorial_cleanup.sql`

Add `SUPABASE_SERVICE_ROLE_KEY` to server environment variables (local `.env.local` and Vercel). Never prefix this secret with `NEXT_PUBLIC_`. It is separate from the public anon/publishable key. It enables authenticated admin locality writes and the existing persistent review cache. Public locality reads use the anon key and RLS only exposes published records.

In Admin → Locality pages, create a city page with a blank locality slug. Create locality pages beneath its city slug. Supply genuine introduction, service information, local details and available services before publishing. Select actual related projects; their true locations remain visible. Text fields are plain text, not executable HTML. Drafts are excluded from public pages and the sitemap. Publish a city before its localities; unpublish children before unpublishing the city. Published URLs stay unchanged to preserve links. No invented locality pages are seeded.

For existing catalogue photos, run a dry run, then apply verified dimensions. This script processes one image at a time and accepts only public Storage images belonging to this Supabase project:

```sh
bun --env-file=.env.local scripts/backfill-catalogue-dimensions.ts
bun --env-file=.env.local scripts/backfill-catalogue-dimensions.ts --apply
```

New admin uploads record dimensions automatically. Older images retain fallback sizes until backfilled. The migration must be applied before saving new catalogue uploads.

## Search Console

If the site is already verified, no new verification is necessary. Submit `https://www.perfectceiling.co.in/sitemap.xml` in the correct property. Admin → SEO & search links to the property tools and sitemap.

Optional HTML verification: set `GOOGLE_SITE_VERIFICATION` to the **content token**, not the entire HTML tag, and redeploy. Domain properties use DNS verification instead.

Optional read-only query reporting inside admin:

1. Create a Google Cloud OAuth client for a web application and enable the **Google Search Console API**.
2. Authorize the Google account that has access to your property with the scope `https://www.googleapis.com/auth/webmasters.readonly`. Request offline access to obtain a refresh token. You can use Google's OAuth Playground with your own OAuth client; register `https://developers.google.com/oauthplayground` as its redirect URI if using that tool. Keep credentials/tokens out of chat, source control and browser code.
3. Configure these **server-only** Vercel variables:
   - `GOOGLE_SEARCH_CONSOLE_CLIENT_ID`
   - `GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET`
   - `GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN`
   - `GOOGLE_SEARCH_CONSOLE_PROPERTY`: exact property identifier, e.g. `sc-domain:perfectceiling.co.in` for a domain property, or `https://www.perfectceiling.co.in/` for a URL-prefix property.
4. Redeploy, then click **Load search data** in Admin → SEO & search.

The report requests the top 20 queries for a 28-day period ending three days ago. Rows are not site-wide totals. It does not submit indexing requests, change property permissions, or alter rankings. Google admin login through Supabase remains separate. OAuth apps in Google's Testing publishing state can have expiring refresh tokens; complete the appropriate consent-screen setup for a durable production connection.

Official references: https://developers.google.com/webmaster-tools/v1/prereqs and https://developers.google.com/webmaster-tools/v1/how-tos/authorizing

## PageSpeed

The earlier HTTP 429 was Google's shared unauthenticated API quota, not a site failure. Use your own Google Cloud project, enable **PageSpeed Insights API**, and set server-only `PAGESPEED_API_KEY`. Restrict it to that API. Redeploy and use **Check PageSpeed** in admin. The homepage mobile audit is requested on demand and cached for 24 hours, including failures, to prevent repeated quota consumption. The direct PageSpeed website link works without configuring the app's API key.

API keys do not eliminate quota limits. An audit may also time out; use Google's web interface if it exceeds the server's 55-second request timeout. The dashboard does not fabricate scores or claim a Core Web Vitals pass from a lab run.

Official reference: https://developers.google.com/speed/docs/insights/v5/get-started

## Content requiring business confirmation

The `/services/false-celing` service and existing project mix POP and gypsum wording. Confirm the actual materials before editing those claims. Confirm actual city coverage, primary business number, public address policy, hours and Google Business Profile URL in business settings. The current call and WhatsApp numbers remain separate. No private address or unverified hours are published.

Validate representative pages in Google Rich Results Test and Search Console URL Inspection after deployment. Track enquiries and query performance; no score or page count guarantees local rankings.

## Updated locality editor and visitor selectors

The editor now groups the existing fields into four steps: Location, Page content, Services & work, SEO & publish. City pages automatically get a city slug; locality pages select a saved parent city and get a locality slug. Published URL fields remain locked. Saved page types cannot be switched, and city URLs with child pages are protected. Incomplete FAQs can be saved in drafts; published FAQs need both a question and an answer.

No additional columns or migration are required for this update. If the original table has not been created, run `supabase/migrations/20261008_locality_pages.sql`. Existing locality records and content are retained. No locality content is generated or published automatically.

The public `/areas` page offers an area/service selector and remembers the last area explicitly visited through it in local storage. The website menu includes “Choose your area”. There is no IP lookup, location permission prompt or automatic redirect. Google’s search query and private location signals are not used.

Area details support `?service=<published-service-slug>` for services selected for that area. The page heading, displayed service description/rate and WhatsApp quotation message use the selected record and area. Unknown or unavailable services fall back to the general area view. Query variants canonicalize to the original city/locality URL and are not separate sitemap entries. This does not generate a matrix of service-by-locality SEO pages.

Shared descriptions, prices and images come from existing service records. Project links show only published completed work and retain its real location. Client selectors receive summary fields rather than full service content. Actual locality-specific introduction, work information, local details and FAQ content remain editable in admin.
