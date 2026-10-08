"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight, Check, FileText, Globe, MapPin, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { localityPath, slugifyLocalityName, validateLocality, type LocalityPage } from "@/lib/localities";
import { saveLocality, deleteLocality } from "./actions";

type Draft = Omit<LocalityPage, "id" | "updated_at"> & { id?: string };
const newDraft = (): Draft => ({ name: "", city: "", city_slug: "", slug: "", intro: "", content: "", local_details: "", seo_title: "", seo_description: "", service_ids: [], project_ids: [], faqs: [], published: false });
function toDraft(page: LocalityPage): Draft {
  const { id, name, city, city_slug, slug, intro, content, local_details, seo_title, seo_description, service_ids, project_ids, faqs, published } = page;
  return { id, name, city, city_slug, slug, intro, content, local_details, seo_title, seo_description, service_ids, project_ids, faqs, published };
}
const inputClass = "mt-2 w-full rounded-xl border border-[#ddd5c8] bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-[#a39b8e] focus:border-[#91704a] focus:ring-2 focus:ring-[#91704a]/10 disabled:bg-[#eee9df]";
const steps = ["Location", "Page content", "Services & work", "SEO & publish"];

export function LocalityEditor({ pages, services, projects, enabled = true, businessName }: { businessName: string; pages: LocalityPage[]; services: { id: string; title: string }[]; projects: { id: string; title: string }[]; enabled?: boolean }) {
  const [draft, setDraft] = useState<Draft>(newDraft);
  const [baseline, setBaseline] = useState<Draft>(newDraft);
  const [kind, setKind] = useState<"city" | "locality">("city");
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline);
  const cities = pages.filter(page => !page.slug);
  const path = localityPath({ city_slug: draft.city_slug || "city", slug: draft.slug });
  const locked = Boolean(draft.id && baseline.published);
  const publishIssue = kind === "locality" && !draft.slug ? "Enter a locality URL slug before publishing." : validateLocality({ ...draft, published: true });
  const canPublish = !publishIssue;
  function update(patch: Partial<Draft>) { setDraft(current => ({ ...current, ...patch })); setNotice(null); }
  function open(page?: LocalityPage) {
    if (pending || (dirty && !window.confirm("Discard your unsaved changes?"))) return;
    const next = page ? toDraft(page) : newDraft();
    setDraft(next); setBaseline(next); setKind(next.slug ? "locality" : "city"); setStep(0); setNotice(null);
  }
  function textField(key: "intro" | "content" | "local_details" | "seo_title" | "seo_description", label: string, hint: string, max: number, rows?: number) {
    const props = { className: inputClass, value: draft[key], maxLength: max, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update({ [key]: event.target.value }) };
    return <label className="block"><span className="text-sm font-medium">{label}</span><span className="mt-1 block text-xs leading-5 text-[#746653]">{hint}</span>{rows ? <textarea {...props} rows={rows} /> : <input {...props} />}<span className="mt-1 block text-right text-[10px] text-[#746653]">{draft[key].length.toLocaleString()} / {max.toLocaleString()}</span></label>;
  }
  function save(publish: boolean) {
    if (kind === "locality" && !draft.slug) { setNotice({ text: "Enter a locality URL slug before saving.", error: true }); setStep(0); return; }
    const next = { ...draft, published: publish };
    const error = validateLocality(next);
    if (error) { setNotice({ text: error, error: true }); return; }
    start(async () => {
      try {
        const result = await saveLocality(next);
        if (result.error) { setNotice({ text: result.error, error: true }); return; }
        const saved = { ...next, id: result.id };
        setDraft(saved); setBaseline(saved); setNotice({ text: publish ? "Page published. It is now available in your service areas and sitemap." : "Draft saved. It stays private until you publish it." });
      } catch { setNotice({ text: "Could not save. Your edits are still here; please retry.", error: true }); }
    });
  }
  return <div className="mt-6 pb-5 text-[#292720]">
    <section className="rounded-2xl bg-[#f3f0e9] p-4">
      <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-medium">Your area pages</p><p className="mt-1 text-[11px] text-[#746653]">{pages.length} pages · {pages.filter(page => page.published).length} published</p></div><button type="button" disabled={pending || !enabled} onClick={() => open()} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#292720] px-3.5 text-xs font-medium text-white disabled:opacity-50"><Plus size={14} />New page</button></div>
      {pages.length ? <><label className="relative mt-4 block"><Search aria-hidden size={15} className="absolute left-3 top-3.5 text-[#746653]" /><input aria-label="Find an area page" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a city or locality…" className="min-h-11 w-full rounded-xl border border-[#ddd5c8] bg-white pl-9 pr-3 text-xs outline-none focus:border-[#91704a]" /></label><div className="mt-3 max-h-56 space-y-1 overflow-y-auto">{pages.filter(page => `${page.name} ${page.city}`.toLowerCase().includes(search.toLowerCase())).map(page => <button key={page.id} type="button" disabled={pending} onClick={() => open(page)} className={`flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${draft.id === page.id ? "bg-white shadow-sm" : "hover:bg-white/60"}`}><MapPin aria-hidden size={16} className="shrink-0 text-[#80603e]" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{page.name}</span><span className="mt-0.5 block text-[10px] text-[#746653]">{page.slug ? `Locality · ${page.city}` : "City page"}</span></span><span className={`rounded-full px-2 py-1 text-[9px] font-medium ${page.published ? "bg-[#e5eddf] text-[#425d38]" : "bg-[#eee9df] text-[#746653]"}`}>{page.published ? "Live" : "Draft"}</span></button>)}</div></> : <p className="mt-4 text-xs leading-6 text-[#746653]">Start with a city page, then add localities beneath it.</p>}
    </section>

    <form className="mt-6" onSubmit={event => { event.preventDefault(); save(draft.published); }}>
      <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[0.14em] text-[#80603e]">{draft.id ? "Edit area page" : "Create an area page"}</p><h2 className="mt-2 font-primary text-2xl tracking-tight">{draft.name || "A new place to work."}</h2></div><span className="mt-1 rounded-full bg-[#eee9df] px-2.5 py-1 text-[10px] text-[#746653]">{dirty ? "Unsaved" : baseline.published ? "Published" : "Draft"}</span></div>
      <nav aria-label="Editor steps" className="mt-5 grid grid-cols-4 gap-1 border-b border-[#ddd5c8]">{steps.map((label, index) => <button key={label} type="button" onClick={() => setStep(index)} aria-current={step === index ? "step" : undefined} className={`min-h-16 border-b-2 px-1 pb-3 text-[10px] leading-4 ${step === index ? "border-[#80603e] font-semibold text-[#292720]" : "border-transparent text-[#746653]"}`}><span className={`mx-auto mb-1.5 flex size-6 items-center justify-center rounded-full text-[10px] ${step === index ? "bg-[#292720] text-white" : "bg-[#eee9df]"}`}>{index + 1}</span>{label}</button>)}</nav>
      <fieldset disabled={pending || !enabled} className="mt-6 space-y-5 disabled:opacity-60">
        {step === 0 ? <>
          <div className="grid grid-cols-2 gap-2">{(["city", "locality"] as const).map(value => <button key={value} type="button" disabled={Boolean(draft.id)} aria-pressed={kind === value} onClick={() => { if (kind === value) return; setKind(value); update({ slug: "", name: "", city: "", city_slug: "" }); }} className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border text-xs font-medium ${kind === value ? "border-[#80603e] bg-[#f3f0e9]" : "border-[#ddd5c8] bg-white"}`}><MapPin size={15} />{value === "city" ? "City page" : "Locality page"}</button>)}</div>
          {kind === "locality" ? <label className="block text-sm font-medium">Parent city<select className={inputClass} value={draft.city_slug} disabled={locked} onChange={event => { const city = cities.find(page => page.city_slug === event.target.value); if (city) update({ city: city.city, city_slug: city.city_slug }); }}><option value="">Choose a city page</option>{cities.map(city => <option key={city.id} value={city.city_slug}>{city.name}{city.published ? "" : " (draft)"}</option>)}{draft.city_slug && !cities.some(city => city.city_slug === draft.city_slug) ? <option value={draft.city_slug}>{draft.city} (parent page missing)</option> : null}</select>{!cities.length ? <span className="mt-2 block text-xs leading-5 text-[#746653]">Create a city page first. Publish it before publishing its localities.</span> : null}</label> : null}
          <label className="block text-sm font-medium">{kind === "city" ? "City name" : "Locality name"}<input className={inputClass} maxLength={kind === "city" ? 100 : 160} value={draft.name} placeholder={kind === "city" ? "e.g. Thane" : "e.g. Hiranandani Estate"} onChange={event => { const name = event.target.value; update({ name, ...(kind === "city" ? { city: name, ...(!draft.id ? { city_slug: slugifyLocalityName(name) } : {}) } : !draft.id ? { slug: slugifyLocalityName(name) } : {}) }); }} /></label>
          <div className="rounded-xl bg-[#f3f0e9] p-4"><p className="text-[10px] uppercase tracking-wider text-[#746653]">Page address</p><p className="mt-2 break-all text-xs font-medium">{path}</p><p className="mt-2 text-[11px] leading-5 text-[#746653]">{locked ? "The published address stays fixed to preserve existing links." : "The address is generated from the name. You can adjust it below."}</p></div>
          <details><summary className="cursor-pointer text-xs font-medium text-[#80603e]">Edit URL slugs</summary><label className="mt-3 block text-xs">City slug<input className={inputClass} value={draft.city_slug} disabled={locked || kind === "locality"} onChange={event => update({ city_slug: event.target.value })} maxLength={100} /></label>{kind === "locality" ? <label className="mt-3 block text-xs">Locality slug<input className={inputClass} value={draft.slug} disabled={locked} onChange={event => update({ slug: event.target.value })} maxLength={100} /></label> : null}</details>
        </> : null}
        {step === 1 ? <>
          {textField("intro", "Introduction", "A short overview of the services available in this area.", 2000, 3)}
          {textField("content", "Work & service information", "Explain scope, finishes and quotation considerations. Separate paragraphs with a blank line.", 30000, 7)}
          {textField("local_details", "Local information", "Add actual coverage, site-access considerations or nearby work. Keep project locations accurate.", 10000, 4)}
          <section className="border-t border-[#ddd5c8] pt-5"><div className="flex items-center justify-between"><h3 className="text-sm font-medium">Questions & answers</h3><button type="button" disabled={draft.faqs.length >= 30} onClick={() => update({ faqs: [...draft.faqs, { question: "", answer: "" }] })} className="inline-flex min-h-10 items-center gap-1 text-xs font-medium text-[#80603e]"><Plus size={14} />Add question</button></div>{draft.faqs.length === 0 ? <p className="mt-2 text-xs text-[#746653]">Optional answers to questions customers ask about this area.</p> : null}{draft.faqs.map((faq, index) => <div key={index} className="mt-4 rounded-xl bg-[#f3f0e9] p-4"><div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-wider text-[#746653]">Question {index + 1}</span><button type="button" aria-label={`Remove question ${index + 1}`} onClick={() => update({ faqs: draft.faqs.filter((_, i) => i !== index) })} className="inline-flex size-9 items-center justify-center text-[#80603e]"><Trash2 size={14} /></button></div><label className="block text-xs">Question<input className={inputClass} value={faq.question} maxLength={500} onChange={event => update({ faqs: draft.faqs.map((f, i) => i === index ? { ...f, question: event.target.value } : f) })} /></label><label className="mt-3 block text-xs">Answer<textarea rows={3} className={inputClass} value={faq.answer} maxLength={4000} onChange={event => update({ faqs: draft.faqs.map((f, i) => i === index ? { ...f, answer: event.target.value } : f) })} /></label></div>)}</section>
        </> : null}
        {step === 2 ? <>{([['service_ids', 'Available services', 'Choose the services genuinely offered here. Their descriptions and rates come from your service records.', services], ['project_ids', 'Related completed work', 'Select relevant examples; the public page shows each project’s actual location.', projects]] as const).map(([key, label, hint, items]) => <section key={key}><h3 className="text-sm font-medium">{label}<span className="ml-2 rounded-full bg-[#eee9df] px-2 py-0.5 text-[10px]">{draft[key].length}</span></h3><p className="mt-1 text-xs leading-5 text-[#746653]">{hint}</p>{draft[key].some(id => !items.some(item => item.id === id)) ? <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900"><p>Some selected records are no longer available for publishing.</p><button type="button" className="mt-2 min-h-9 font-medium underline" onClick={() => update({ [key]: draft[key].filter(id => items.some(item => item.id === id)) })}>Remove unavailable selections</button></div> : null}<div className="mt-3 space-y-2">{items.map(item => <label key={item.id} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs ${draft[key].includes(item.id) ? "border-[#91704a] bg-[#f3f0e9]" : "border-[#ddd5c8] bg-white"}`}><input type="checkbox" className="size-4 accent-[#80603e]" checked={draft[key].includes(item.id)} onChange={event => update({ [key]: event.target.checked ? [...draft[key], item.id] : draft[key].filter(id => id !== item.id) })} /><span className="flex-1 font-medium">{item.title}</span>{draft[key].includes(item.id) ? <Check size={14} className="text-[#80603e]" /> : null}</label>)}{!items.length ? <p className="rounded-xl bg-[#f3f0e9] p-4 text-xs text-[#746653]">No published records available yet.</p> : null}</div></section>)}</> : null}
        {step === 3 ? <>
          {textField("seo_title", "Search title", "Optional. Leave blank to use the locality and business name automatically.", 250)}
          {textField("seo_description", "Search description", "Optional. Leave blank to use the introduction.", 1000, 3)}
          <section className="rounded-xl border border-[#ddd5c8] bg-white p-4"><p className="text-[10px] uppercase tracking-wider text-[#746653]">Search preview</p><p className="mt-3 break-all text-[10px] text-[#746653]">{path}</p><p className="mt-1 text-base text-[#3d5272]">{draft.seo_title || `Ceiling & interior services in ${draft.name || "your area"}`} · {businessName}</p><p className="mt-2 line-clamp-3 text-xs leading-6 text-[#6c665c]">{draft.seo_description || draft.intro || "Your introduction will appear here."}</p></section>
          <div className="flex items-start gap-3 rounded-xl bg-[#f3f0e9] p-4"><Globe size={18} className="mt-0.5 shrink-0 text-[#80603e]" /><div><p className="text-sm font-medium">{canPublish ? "Ready for publishing" : "Finish the page before publishing"}</p><p className="mt-1 text-xs leading-5 text-[#746653]">{canPublish ? "The server also checks that selected services and the parent city are published." : publishIssue}</p></div></div>
        </> : null}
      </fieldset>
      <div className="mt-6 flex items-center justify-between border-t border-[#ddd5c8] pt-4"><button type="button" disabled={step === 0} onClick={() => setStep(value => value - 1)} className="inline-flex min-h-11 items-center gap-1.5 text-xs text-[#746653] disabled:opacity-30"><ArrowLeft size={14} />Previous</button>{step < 3 ? <button type="button" onClick={() => setStep(value => value + 1)} className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-[#80603e]">Continue<ArrowRight size={14} /></button> : draft.id && baseline.published ? <Link href={path} target="_blank" className="inline-flex min-h-11 items-center gap-1 text-xs text-[#80603e]">View live page<ArrowUpRight size={14} /></Link> : null}</div>
      {notice ? <p role={notice.error ? "alert" : "status"} className={`mt-4 rounded-xl px-4 py-3 text-xs leading-6 ${notice.error ? "bg-red-50 text-red-800" : "bg-[#e5eddf] text-[#425d38]"}`}>{notice.text}</p> : null}
      <div className="sticky bottom-20 z-10 mt-5 rounded-2xl border border-[#ddd5c8] bg-[#fbfbfa]/95 p-3 shadow-sm backdrop-blur"><div className="flex gap-2"><button type="button" disabled={pending || !enabled} onClick={() => save(false)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#ddd5c8] text-xs font-medium disabled:opacity-50"><FileText size={14} />{pending ? "Saving…" : baseline.published ? "Unpublish & save" : "Save draft"}</button><button type="button" disabled={pending || !enabled} onClick={() => save(true)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#292720] text-xs font-medium text-white disabled:opacity-50"><Globe size={14} />{baseline.published ? "Update live page" : "Publish page"}</button></div></div>
      {draft.id ? <button type="button" disabled={pending || !enabled} className="mt-4 inline-flex min-h-11 items-center gap-2 text-xs text-red-800" onClick={() => { if (!window.confirm("Permanently delete this area page?")) return; start(async () => { try { const result = await deleteLocality(draft.id!); if (result.error) setNotice({ text: result.error, error: true }); else { const next = newDraft(); setDraft(next); setBaseline(next); setKind("city"); setStep(0); setNotice({ text: "Page deleted." }); } } catch { setNotice({ text: "Could not delete this page. Please retry.", error: true }); } }); }}><Trash2 size={14} />Delete page</button> : null}
    </form>
  </div>;
}
