import { ArrowUpRight, BookOpen, Images, MapPin } from "lucide-react";
import Image from "next/image";
import { shouldBypassImageOptimization } from "@/lib/image-loading";
import Link from "next/link";

import { formatBlogPublishedDate, getBlogContentPreview, getBlogPublicPath } from "@/lib/blog";
import { PublicCatalogueCard } from "@/components/public-catalogue-card";
import { getProjectPublicPath } from "@/lib/projects";
import type { PublicBlogPost, PublicCatalogueGroup, PublicProject } from "@/lib/public-content";

function SectionHeading({ label, title }: { label: string; title: string }) {
  return <div><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#80603e]">{label}</p><h2 className="mt-2 font-primary text-[26px] font-medium leading-tight tracking-[-0.035em] text-[#292720]">{title}</h2></div>;
}

function ViewAll({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#ccc4b7] px-4 text-xs font-medium text-[#292720] transition hover:bg-[#f3f0e9] focus-visible:outline-2 focus-visible:outline-offset-4">{label}<ArrowUpRight aria-hidden size={15} /></Link>;
}

function Photo({ src, title, sizes = "(max-width: 560px) calc(100vw - 32px), 496px" }: { src: string | null; title: string; sizes?: string }) {
  return src ? <Image alt={title} src={src} fill sizes={sizes} className="object-cover transition duration-300 group-hover:scale-[1.025] motion-reduce:transform-none" unoptimized={shouldBypassImageOptimization(src)} /> : <div className="flex h-full items-center justify-center bg-[#e8e2d8] text-[#80603e]"><Images aria-hidden size={28} strokeWidth={1.2} /></div>;
}

export function HomeCatalogueSection({ items }: { items: PublicCatalogueGroup[] }) {
  if (!items.length) return null;
  return <section id="catalogue" className="px-4 py-9 sm:px-8">
    <SectionHeading label="The design collection" title="Ceiling catalogue" />
    <div className="mt-6 space-y-6">
      {items.map((item, index) => <PublicCatalogueCard item={item} key={item.id} delayMs={6000 + index * 450} />)}
    </div>
    <ViewAll href="/catalogue" label="View all catalogue designs" />
  </section>;
}

export function HomeProjectsSection({ projects }: { projects: PublicProject[] }) {
  const completed = projects.filter((project) => project.status === "completed");
  if (!completed.length) return null;
  return <section id="projects" className="bg-[#f3f0e9] px-4 py-9 sm:px-8">
    <SectionHeading label="From design to reality" title="Completed projects" />
    <div className="mt-6 space-y-6">{completed.slice(0, 3).map((project) => {
      const cover = project.imageUrl || project.galleryImages[0]?.url || null;
      return <article key={project.id}><Link href={getProjectPublicPath(project.slug)} className="group block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91704a]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Photo src={cover} title={project.title} /></div>
        <div className="pt-4">{project.serviceType ? <p className="text-[10px] uppercase tracking-[0.1em] text-[#80603e]">{project.serviceType}</p> : null}<div className="mt-1.5 flex items-start justify-between gap-3"><h3 className="font-primary text-lg font-medium leading-snug text-[#292720]">{project.title}</h3><ArrowUpRight aria-hidden className="mt-1 shrink-0 text-[#80603e]" size={18} /></div>{project.location ? <p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-[#6c665c]"><MapPin aria-hidden className="mt-0.5 shrink-0" size={13} />{project.location}</p> : null}</div>
      </Link></article>;
    })}</div>
    <ViewAll href="/projects" label="View all projects" />
  </section>;
}

export function HomeArticlesSection({ posts }: { posts: PublicBlogPost[] }) {
  if (!posts.length) return null;
  const [lead, ...remaining] = posts;
  const leadExcerpt = lead.excerpt?.trim() || getBlogContentPreview(lead.content || "");
  return <section id="blog" className="px-4 py-9 sm:px-8">
    <SectionHeading label="Ideas & advice" title="The interior journal" />
    <article className="mt-6"><Link href={getBlogPublicPath(lead.slug)} className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91704a]">
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-[#e8e2d8]"><Photo src={lead.featuredImageUrl || lead.imageUrl} title={lead.title} /></div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-[9px] font-medium uppercase tracking-[0.1em] text-[#80603e]"><span>{lead.category || "Design ideas"}</span>{lead.publishedAt ? <span className="normal-case tracking-normal text-[#746653]">{formatBlogPublishedDate(lead.publishedAt)}</span> : null}</div>
      <h3 className="mt-2 font-primary text-[22px] font-semibold leading-[1.3] tracking-[-0.03em] text-[#292720]">{lead.title}</h3>
      {leadExcerpt ? <p className="mt-3 line-clamp-2 text-xs leading-6 text-[#6c665c]">{leadExcerpt}</p> : null}
      <span className="mt-3 inline-flex min-h-9 items-center gap-2 text-[11px] font-medium text-[#80603e]">Read the story<ArrowUpRight aria-hidden size={15} /></span>
    </Link></article>
    {remaining.length ? <div className="mt-5 border-t border-[#e5e0d7] divide-y divide-[#e5e0d7]">{remaining.map((post) => {
      const excerpt = post.excerpt?.trim() || getBlogContentPreview(post.content || "");
      return <article key={post.id} className="py-5"><Link href={getBlogPublicPath(post.slug)} className="group flex items-start gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91704a]">
        <div className="min-w-0 flex-1"><p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#80603e]">{post.category || "Design ideas"}</p><h3 className="mt-2 line-clamp-2 font-primary text-base font-semibold leading-snug tracking-[-0.02em] text-[#292720]">{post.title}</h3>{excerpt ? <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#6c665c]">{excerpt}</p> : null}<span className="mt-2 flex items-center gap-1.5 text-[10px] text-[#80603e]">Read story<ArrowUpRight aria-hidden size={13} /></span></div>
        <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-lg bg-[#e8e2d8]">{post.featuredImageUrl || post.imageUrl ? <Photo src={post.featuredImageUrl || post.imageUrl} title={post.title} sizes="96px" /> : <div className="flex h-full items-center justify-center text-[#80603e]"><BookOpen aria-hidden size={25} strokeWidth={1.2} /></div>}</div>
      </Link></article>;
    })}</div> : null}
    <ViewAll href="/blog" label="View all articles" />
  </section>;
}
