import type { Metadata } from "next";
import Link from "next/link";
import { NON_INDEXABLE_ROBOTS } from "@/lib/seo";
export const metadata: Metadata = { title: "Page not found", robots: NON_INDEXABLE_ROBOTS };
export default function NotFound() {
 return <main className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col justify-center bg-[#f3f0e9] px-6 text-[#292720]"><p className="text-xs uppercase tracking-widest text-[#91704a]">404</p><h1 className="mt-4 font-primary text-4xl">Page not found.</h1><p className="mt-4 text-sm leading-7 text-[#746e63]">This page may have moved or is no longer available.</p><Link href="/" className="mt-6 text-sm font-medium underline underline-offset-4">Return home</Link></main>;
}
