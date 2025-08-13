# Perfect Ceiling

A Next.js 15 app with Google authentication, MongoDB user storage, Cloudinary image uploads, React Query data fetching, and an admin dashboard for business settings.

## Tech Stack
- Next.js 15 (App Router)
- React 19
- NextAuth (Google OAuth)
- MongoDB + Mongoose
- Cloudinary (image storage)
- @tanstack/react-query
- Tailwind CSS 4

## Getting Started

1) Prerequisites
- Node.js 18+
- MongoDB connection string
- Google OAuth Client (Client ID/Secret)
- Cloudinary account (cloud name, API key/secret)

2) Environment Variables
Create a `.env.local` file in the project root:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
AUTH_SECRET=your-strong-random-secret

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

MONGODB_URI=your-mongodb-uri

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Optional: promote this email to admin at login
ADMIN_EMAIL=you@example.com
```

3) Install & Run
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Features
- Navbar with brand, navigation, and Login/Profile dropdown
- Google login with NextAuth; users stored in MongoDB
- Profile page (SSR shell + Client) to view/update name and profile picture (stored on Cloudinary)
- Protected routes: `/profile` for authenticated users
- Admin dashboard: `/admin/settings` (admin only)
  - Manage business settings: name, primary/secondary phones, status (open/closed/temporary_closed/busy/holiday/by_appointment/maintenance), terms (string array), logo (Cloudinary)
  - CRUD API at `/api/business` (GET/POST/PUT/DELETE)
- Middleware-based protection for `/profile` and `/admin/*`

## Admin Access
- Set `ADMIN_EMAIL` in `.env.local`. The session JWT will include `role=admin` for that email.
- Alternatively, set a user's role to `admin` in the database.

## Scripts
- `npm run dev` – start dev server
- `npm run build` – build production bundle
- `npm run start` – start production server
- `npm run lint` – run lints

## Notes
- Update your Google OAuth callback to `${NEXTAUTH_URL}/api/auth/callback/google`.
- Image domains for Google and Cloudinary are configured in `next.config.ts`.
