This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Install dependencies and run the development server with [Bun](https://bun.sh):

```bash
bun install
bun dev
```

Other common commands:

```bash
bun run build
bun run start
bun run lint
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

For Google login, set Vercel's `NEXT_PUBLIC_SITE_URL` and Supabase's Site URL
to `https://www.perfectceiling.co.in`. Add
`https://www.perfectceiling.co.in/auth/callback` to Supabase's Redirect URLs.
If the apex domain also serves the app, allow
`https://perfectceiling.co.in/auth/callback` too. Prefer redirecting the apex
domain to `www` in Vercel. Local development needs
`http://localhost:3000/auth/callback`. Custom callback `next` query parameters
also need to be allowed in Supabase's Redirect URLs.

Redeploy after changing Vercel environment variables and start a fresh login.
HTTP 303 from the login Server Action is expected. Login must start and finish
on the same host because the PKCE verifier and session use host-specific cookies.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Google review refresh interval

Apply `supabase/migrations/20261007_google_reviews_cache.sql` in the Supabase SQL
Editor and configure `SUPABASE_SERVICE_ROLE_KEY` in Vercel. The server stores the
last review snapshot and refreshes it on the first visit after three days.
An atomic 60-second lease prevents concurrent instances from each calling Google.
Failed Google requests keep the previous snapshot and retry after one hour.
Homepage updates and redeployments do not clear this database cache. Until the
migration is applied, the app uses a 72-hour Next.js cache as a fallback, which
can still be invalidated by homepage edits.

### Public-page SEO and low-memory builds

Public Supabase/Google images use Next.js responsive image optimization. Only the first likely LCP image on a page loads eagerly with high priority; the homepage requests subsequent carousel photos after the first photo loads. Google review refreshes stream separately so they do not hold up the hero.

Catalogue photo share links retain their individual social preview, but canonicalize to the collection page. The sitemap lists canonical pages, includes image URLs, refreshes hourly, and reports known content edit dates rather than the current request time.

`bun run build` uses Webpack with memory optimizations, one worker, and a 1 GB JavaScript heap limit. This reduces parallel memory usage on smaller machines. Avoid running the development server and production build together.
