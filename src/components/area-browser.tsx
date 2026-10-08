"use client";

import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { localityPath, type LocalityPage } from "@/lib/localities";

type AreaSummary = Pick<LocalityPage, "id" | "name" | "city" | "city_slug" | "slug" | "intro" | "service_ids">;
const storageKey = "perfect-ceiling-area";
const preferenceEvent = "perfect-ceiling-area-change";
function subscribePreference(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(preferenceEvent, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(preferenceEvent, callback); };
}
function readPreference() { try { return window.localStorage.getItem(storageKey) || ""; } catch { return ""; } }
function rememberArea(id: string) { try { window.localStorage.setItem(storageKey, id); window.dispatchEvent(new Event(preferenceEvent)); } catch { /* Browsing also works without persistent storage. */ } }
const selectClass = "mt-2 min-h-12 w-full rounded-xl border border-[#ddd5c8] bg-white px-3 text-sm text-[#292720] outline-none focus:border-[#91704a]";

export function AreaBrowser({ areas, services }: { areas: AreaSummary[]; services: { id: string; title: string; slug: string }[] }) {
  const remembered = useSyncExternalStore(subscribePreference, readPreference, () => "");
  const [chosen, setChosen] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState("");
  const visible = serviceId ? areas.filter(area => area.service_ids.includes(serviceId)) : areas;
  const selected = visible.find(area => area.id === (chosen ?? remembered));
  const selectedService = services.find(service => service.id === serviceId);
  const cities = [...new Set(visible.map(area => area.city_slug))];
  if (!areas.length) return null;
  return <>
    <section className="mt-6 rounded-2xl bg-[#eee7db] p-5" aria-labelledby="area-picker-heading">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#80603e]">Your space, your area</p>
      <h2 id="area-picker-heading" className="mt-2 font-primary text-2xl tracking-tight">Find the right local services.</h2>
      <label className="mt-5 block text-xs font-medium">What do you need?<select className={selectClass} value={serviceId} onChange={event => setServiceId(event.target.value)}><option value="">All ceiling & interior services</option>{services.map(service => <option key={service.id} value={service.id}>{service.title}</option>)}</select></label>
      <label className="mt-4 block text-xs font-medium">Choose your city or locality<select className={selectClass} value={selected?.id || ""} onChange={event => setChosen(event.target.value)}><option value="">Select an area</option>{cities.map(city => <optgroup key={city} label={visible.find(area => area.city_slug === city)?.city}>{visible.filter(area => area.city_slug === city).map(area => <option key={area.id} value={area.id}>{area.name}{area.slug ? "" : " · city overview"}</option>)}</optgroup>)}</select></label>
      <p className="mt-3 text-[11px] leading-5 text-[#746653]">{selected?.id === remembered ? "Your last selected area. You can change it anytime." : "Choose an area to see its services, work details and contact options."}</p>
      {selected ? <Link onClick={() => rememberArea(selected.id)} href={`${localityPath(selected)}${selectedService ? `?service=${encodeURIComponent(selectedService.slug)}` : ""}`} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#292720] px-4 text-xs font-medium text-white">Explore {selected.name}<ArrowUpRight aria-hidden size={14} /></Link> : <span className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#292720]/10 px-4 text-xs text-[#746653]">Choose an area to continue</span>}
    </section>
    <div aria-live="polite" className="mt-8">{cities.map(city => <section key={city} className="pb-8"><h2 className="font-primary text-2xl tracking-tight">{visible.find(area => area.city_slug === city)?.city}</h2><div className="mt-4 space-y-3">{visible.filter(area => area.city_slug === city).map(area => <Link key={area.id} onClick={() => rememberArea(area.id)} href={`${localityPath(area)}${selectedService ? `?service=${encodeURIComponent(selectedService.slug)}` : ""}`} className="group flex gap-3 rounded-xl border border-[#e4ded3] p-4 transition hover:bg-[#f3f0e9]"><MapPin aria-hidden size={17} className="mt-0.5 shrink-0 text-[#80603e]" /><div className="min-w-0 flex-1"><h3 className="text-sm font-medium">{area.name}</h3><p className="mt-1 line-clamp-2 text-xs leading-6 text-[#6c665c]">{area.intro}</p><span className="mt-2 block text-[10px] text-[#746653]">{area.service_ids.length} available {area.service_ids.length === 1 ? "service" : "services"}</span></div><ArrowUpRight aria-hidden size={15} className="shrink-0 text-[#80603e]" /></Link>)}</div></section>)}{!visible.length ? <p className="rounded-xl bg-[#f3f0e9] p-5 text-sm leading-7 text-[#6c665c]">No published areas list this service yet. Contact us with your address to confirm availability.</p> : null}</div>
  </>;
}
