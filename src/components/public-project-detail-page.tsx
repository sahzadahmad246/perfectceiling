import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PublicInquiry, PublicPageHeading, PublicPageLayout } from "@/components/public-page-layout";
import { PublicProjectPreviewCard } from "@/components/public-project-preview-card";
import { ServiceImageCarousel } from "@/components/service-image-carousel";
import { ShareButton } from "@/components/share-button";
import { getPublicBusinessSettings, toWhatsAppLink } from "@/lib/business-settings";
import { getAllPublicProjects, getPublicProjectBySlug } from "@/lib/public-content";
import { getProjectStatusLabel, prepareProjectArticleContent } from "@/lib/projects";
import { buildProjectDetailJsonLd, getProjectPageUrl, getProjectSeoDescription } from "@/lib/project-seo";

function formatCompletedDate(value: string | null) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export async function PublicProjectDetailPage({ slug }: { slug: string }) {
  const [project, settings, projects] = await Promise.all([getPublicProjectBySlug(slug), getPublicBusinessSettings(), getAllPublicProjects()]);
  if (!project) notFound();
  const whatsappHref = toWhatsAppLink(settings.whatsapp, `Hi, I saw your "${project.title}" project and would like similar work for my space.`);
  const articleHtml = prepareProjectArticleContent(project.description, project.title, project.shortDescription ?? "");
  const completedLabel = formatCompletedDate(project.completedAt);
  const seoDescription = getProjectSeoDescription(project, settings);
  const images = project.galleryImages.length ? project.galleryImages : project.imageUrl ? [{ url: project.imageUrl, caption: project.title }] : [];
  const related = projects.filter((item) => item.id !== project.id && item.status === "completed").slice(0, 2);
  return <PublicPageLayout settings={settings} whatsappHref={whatsappHref}>
    <JsonLd data={buildProjectDetailJsonLd(project, settings)} />
    <article itemScope itemType="https://schema.org/Article">
      <meta content={project.title} itemProp="headline" /><meta content={seoDescription} itemProp="description" /><meta content={getProjectPageUrl(project.slug)} itemProp="url" />
      <PublicPageHeading href="/projects" backLabel="Our portfolio" eyebrow={project.serviceType || "Project story"} title={project.title} share={<ShareButton variant="icon" label="Share project" title={`${project.title} — ${settings.businessName}`} text={seoDescription} url={getProjectPageUrl(project.slug)} className="border-[#d8d0c3] bg-transparent" />}>
        {project.shortDescription ? <p className="mt-4 text-sm leading-7 text-[#746e63]">{project.shortDescription}</p> : null}
        <span className="mt-4 inline-flex rounded-full bg-[#e8e1d5] px-3 py-1.5 text-[10px] font-medium text-[#746e63]">{getProjectStatusLabel(project.status)}</span>
      </PublicPageHeading>
      <ServiceImageCarousel images={images} title={project.title} />
      <section aria-labelledby="project-details-heading" className="mt-7 border-y border-[#e1dbcf] py-5"><h2 id="project-details-heading" className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#91704a]">Project at a glance</h2><dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-5">
        {project.location ? <div><dt className="text-[10px] text-[#827563]">Location</dt><dd className="mt-1.5 text-xs font-medium leading-5">{project.location}</dd></div> : null}
        {project.serviceType ? <div><dt className="text-[10px] text-[#827563]">Work</dt><dd className="mt-1.5 text-xs font-medium leading-5">{project.serviceType}</dd></div> : null}
        {completedLabel && project.status === "completed" ? <div><dt className="text-[10px] text-[#827563]">Completed</dt><dd className="mt-1.5 text-xs font-medium leading-5">{completedLabel}</dd></div> : null}
        <div><dt className="text-[10px] text-[#827563]">Status</dt><dd className="mt-1.5 text-xs font-medium leading-5">{getProjectStatusLabel(project.status)}</dd></div>
      </dl></section>
      {articleHtml ? <section className="mt-8"><p className="mb-5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#91704a]">The project story</p><div className="article-editor-preview public-reading-content" dangerouslySetInnerHTML={{ __html: articleHtml }} itemProp="articleBody" /></section> : null}
    </article>
    <PublicInquiry settings={settings} whatsappHref={whatsappHref} title="Inspired by this space?" description="Tell us what you love about this project. Send your room photos and measurements to discuss a similar finish." />
    {related.length ? <section className="mt-10"><div className="flex items-center justify-between gap-3"><h2 className="font-primary text-xl font-medium tracking-tight">More finished spaces</h2><Link href="/projects" className="inline-flex min-h-10 items-center gap-1 text-[11px] text-[#91704a]">All projects<ArrowUpRight aria-hidden size={14} /></Link></div><div className="mt-5 space-y-8">{related.map((item) => <PublicProjectPreviewCard key={item.id} project={item} />)}</div></section> : null}
  </PublicPageLayout>;
}
