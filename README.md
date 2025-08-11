Perfect Ceiling - Contractor Website with Quotations

Tech: Next.js 15 (App Router), React 19, Tailwind v4, Prisma + Postgres (Neon), Auth.js (Google), Cloudinary (optional), @react-pdf/renderer.

Quick start

1) Create .env.local

Copy and fill the following:

```
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
AUTH_SECRET=replace-with-a-long-random-string
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

2) Install and migrate

```
npm i
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Auth

- Visit /signin and sign in with Google. Dashboard pages are protected by middleware.

Core URLs

- Public site: `/`
- Dashboard: `/dashboard`
- Quotations: `/dashboard/quotations`
- New Quotation: `/dashboard/quotations/new`
- Settings: `/dashboard/settings`
- Download PDF: `/api/quotations/:id/pdf`

Notes

- PDF is rendered server-side from @react-pdf/renderer.
- WhatsApp share opens a chat with a prefilled link to the PDF.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
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

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
