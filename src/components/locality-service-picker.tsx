"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LocalityServicePicker({ path, services, selectedSlug = "" }: { path: string; services: { id: string; title: string; slug: string }[]; selectedSlug?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return <label className="mt-5 block text-xs font-medium text-[#6c665c]">Choose a service for this area<select disabled={pending} value={selectedSlug} onChange={event => { const slug = event.target.value; start(() => router.replace(`${path}${slug ? `?service=${encodeURIComponent(slug)}` : ""}`, { scroll: false })); }} className="mt-2 min-h-12 w-full rounded-xl border border-[#ddd5c8] bg-white px-3 text-sm text-[#292720] outline-none focus:border-[#91704a] disabled:opacity-60"><option value="">All available services</option>{services.map(service => <option key={service.id} value={service.slug}>{service.title}</option>)}</select><span role="status" className="mt-2 block min-h-4 text-[10px] text-[#746653]">{pending ? "Updating service details…" : "Service information and quotation messages match your selection."}</span></label>;
}
