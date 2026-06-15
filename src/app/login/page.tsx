import { LockKeyhole, LogIn } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { signInWithGoogle } from "@/app/auth/actions";
import { hasSupabaseEnv } from "@/lib/env";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: {
    index: false,
    follow: false,
  },
};

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const isConfigured = hasSupabaseEnv();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col bg-[#fbfbfa] px-6 py-6 text-zinc-950 sm:px-8">
      <header className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <Link className="minimal-link text-sm text-zinc-500" href="/">
          {siteConfig.name}
        </Link>
        <span className="text-sm text-zinc-500">Admin</span>
      </header>

      <section className="flex flex-1 flex-col justify-center py-16">
        <div className="flex size-12 items-center justify-center rounded-full border border-zinc-300 text-zinc-600">
          <LockKeyhole size={21} />
        </div>
        <h1 className="mt-6 text-4xl font-medium leading-tight">
          Sign in to manage the business.
        </h1>
        <p className="mt-4 text-sm leading-7 text-zinc-600">
          Use the approved Google admin account to access customers,
          quotations, invoices, projects, settings, and blog content.
        </p>

        {!isConfigured ? (
          <div className="mt-8 rounded-md border border-zinc-300 bg-white p-4 text-sm leading-6 text-zinc-700">
            Supabase is not configured yet. Add your values to
            <code className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5">
              .env.local
            </code>
            and restart the dev server.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-md border border-zinc-300 bg-white p-4 text-sm text-zinc-700">
            Login could not be completed. Error: {error}
          </div>
        ) : null}

        <form action={signInWithGoogle} className="mt-8">
          <button
            className="inline-flex h-11 items-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition duration-200 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            disabled={!isConfigured}
            type="submit"
          >
            <LogIn size={17} />
            Continue with Google
          </button>
        </form>
      </section>
    </main>
  );
}
