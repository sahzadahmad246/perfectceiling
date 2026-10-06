"use client";

import { Search, X } from "lucide-react";
import { useId, useState } from "react";
import { PublicBlogPreviewCard } from "@/components/public-blog-preview-card";
import { PublicProjectPreviewCard } from "@/components/public-project-preview-card";
import { PublicServicePreviewCard } from "@/components/public-service-preview-card";
import type { PublicBlogPost, PublicProject, PublicService } from "@/lib/public-content";

function SearchField({ query, onChange, placeholder }: { query: string; onChange: (value: string) => void; placeholder: string }) {
  const id = useId();
  return <div className="flex min-h-12 items-center gap-2 rounded-xl border border-[#ded6c9] bg-[#faf8f3] px-3.5"><Search aria-hidden size={16} className="shrink-0 text-[#91704a]" /><label htmlFor={id} className="sr-only">{placeholder}</label><input id={id} type="search" value={query} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent py-3 text-xs outline-none placeholder:text-[#958875] focus-visible:underline" />{query ? <button aria-label="Clear search" onClick={() => onChange("")} type="button" className="flex size-8 items-center justify-center text-[#827563]"><X aria-hidden size={14} /></button> : null}</div>;
}
function Filters({ options, active, onChange }: { options: string[]; active: string; onChange: (value: string) => void }) {
  return <div aria-label="Filter results" className="mt-3 flex flex-wrap gap-2">{options.map((option) => <button type="button" key={option} aria-pressed={active === option} onClick={() => onChange(option)} className={`min-h-9 rounded-full px-3.5 text-[11px] transition focus-visible:outline-2 focus-visible:outline-offset-2 ${active === option ? "bg-[#292720] text-white" : "bg-[#eee9df] text-[#746e63] hover:bg-[#e3dccf]"}`}>{option}</button>)}</div>;
}
function EmptyResults({ reset }: { reset: () => void }) {
  return <div className="py-12 text-center"><p className="font-primary text-lg">No matches found.</p><button type="button" onClick={reset} className="mt-3 min-h-10 text-xs text-[#91704a] underline underline-offset-4">Clear filters</button></div>;
}

export function ServicesBrowser({ services }: { services: PublicService[] }) {
  const [query, setQuery] = useState("");
  const filtered = services.filter((service) => `${service.title} ${service.shortDescription}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section aria-label="Our services" className="-mx-4 bg-[#f3f0e9] px-4 pb-7 sm:-mx-8 sm:px-8">
    <SearchField query={query} onChange={setQuery} placeholder="Find a service or finish" />
    <p aria-live="polite" className="mt-4 text-[10px] text-[#827563]">{filtered.length} {filtered.length === 1 ? "service" : "services"}</p>
    {filtered.length ? <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">{filtered.map((service, index) => <PublicServicePreviewCard key={service.id} service={service} lcpImage={index === 0} />)}</div> : services.length ? <EmptyResults reset={() => setQuery("")} /> : <p className="py-8 text-sm text-[#746e63]">Our services will be available here soon. Contact us to discuss your space.</p>}
  </section>;
}

export function ArticlesBrowser({ posts }: { posts: PublicBlogPost[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All articles");
  const categories = [...new Set(posts.map((post) => post.category).filter((value): value is string => Boolean(value)))].filter((value) => value !== "All articles");
  const filtered = posts.filter((post) => (category === "All articles" || post.category === category) && `${post.title} ${post.excerpt || ""} ${post.category || ""}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section aria-label="Articles" className="mt-6">
    <SearchField query={query} onChange={setQuery} placeholder="Search ideas and guides" />
    {categories.length > 1 ? <Filters options={["All articles", ...categories]} active={category} onChange={setCategory} /> : null}
    <p aria-live="polite" className="my-5 text-[10px] text-[#827563]">{filtered.length} {filtered.length === 1 ? "story" : "stories"}</p>
    {filtered.length ? filtered.map((post, index) => <PublicBlogPreviewCard key={post.id} post={post} featured={index === 0} lcpImage={index === 0} />) : posts.length ? <EmptyResults reset={() => { setQuery(""); setCategory("All articles"); }} /> : <p className="py-8 text-sm text-[#746e63]">New stories are on their way.</p>}
  </section>;
}

export function ProjectsBrowser({ projects }: { projects: PublicProject[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(projects.some((project) => project.status === "completed") ? "Completed" : "All projects");
  const filtered = projects.filter((project) => (status === "All projects" || (status === "Completed" ? project.status === "completed" : project.status === "ongoing")) && `${project.title} ${project.location || ""} ${project.serviceType || ""}`.toLowerCase().includes(query.trim().toLowerCase()));
  const options = ["All projects", ...(projects.some((project) => project.status === "completed") ? ["Completed"] : []), ...(projects.some((project) => project.status === "ongoing") ? ["Ongoing"] : [])];
  return <section aria-label="Project portfolio" className="mt-6">
    <SearchField query={query} onChange={setQuery} placeholder="Search projects, places or materials" />
    {options.length > 1 ? <Filters options={options} active={status} onChange={setStatus} /> : null}
    <p aria-live="polite" className="mt-4 text-[10px] text-[#827563]">{filtered.length} {filtered.length === 1 ? "project" : "projects"}</p>
    {filtered.length ? <div className="mt-5 space-y-9">{filtered.map((project, index) => <PublicProjectPreviewCard key={project.id} project={project} index={index} lcpImage={index === 0} />)}</div> : projects.length ? <EmptyResults reset={() => { setQuery(""); setStatus("All projects"); }} /> : <p className="py-8 text-sm text-[#746e63]">Our project portfolio is coming soon.</p>}
  </section>;
}
