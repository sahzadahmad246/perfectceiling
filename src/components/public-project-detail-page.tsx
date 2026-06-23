import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { SiteHeader } from "@/components/site-header";
import { ServiceImageCarousel } from "@/components/service-image-carousel";
import {
  getPublicBusinessSettings,
  toTelLink,
  toWhatsAppLink,
} from "@/lib/business-settings";
import { getPublicProjectBySlug } from "@/lib/public-content";
import {
  getProjectStatusLabel,
  prepareProjectArticleContent,
} from "@/lib/projects";
import {
  buildProjectDetailJsonLd,
  getProjectPageUrl,
  getProjectSeoDescription,
} from "@/lib/project-seo";

type PublicProjectDetailPageProps = {
  slug: string;
};

function formatCompletedDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export async function PublicProjectDetailPage({
  slug,
}: PublicProjectDetailPageProps) {
  const [project, settings] = await Promise.all([
    getPublicProjectBySlug(slug),
    getPublicBusinessSettings(),
  ]);

  if (!project) {
    notFound();
  }

  const whatsappHref = toWhatsAppLink(
    settings.whatsapp,
    `Hi Perfect Ceiling, I saw your ${project.title} project and want a similar quotation.`,
  );
  const telHref = toTelLink(settings.phone);
  const articleHtml = prepareProjectArticleContent(
    project.description,
    project.title,
    project.shortDescription ?? "",
  );
  const completedLabel = formatCompletedDate(project.completedAt);

  const seoDescription = getProjectSeoDescription(project, settings);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 pb-10 text-foreground sm:px-8">
      <JsonLd data={buildProjectDetailJsonLd(project, settings)} />

      <SiteHeader />

      <nav aria-label="Breadcrumb" className="mt-4 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="minimal-link" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link className="minimal-link" href="/projects">
              Projects
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="line-clamp-1 text-foreground">{project.title}</li>
        </ol>
      </nav>

      <article itemScope itemType="https://schema.org/Article">
        <meta content={project.title} itemProp="headline" />
        <meta content={seoDescription} itemProp="description" />
        <meta content={getProjectPageUrl(project.slug)} itemProp="url" />
        <header className="mt-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted">
              {project.serviceType ?? "Ceiling work"}
            </p>
            {project.status !== "completed" ? (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                {getProjectStatusLabel(project.status)}
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 font-primary text-3xl font-medium">
            {project.title}
          </h1>
          {project.location ? (
            <p className="mt-2 text-sm text-muted">{project.location}</p>
          ) : null}
          {completedLabel ? (
            <p className="mt-2 text-sm font-medium text-foreground">
              Completed {completedLabel}
            </p>
          ) : null}
        </header>

        {project.galleryImages.length > 0 ? (
          <ServiceImageCarousel
            images={project.galleryImages}
            title={project.title}
          />
        ) : null}

        <section className="mt-6">
          {project.shortDescription ? (
            <p className="text-sm leading-7 text-foreground">
              {project.shortDescription}
            </p>
          ) : null}

          {articleHtml ? (
            <div
              className="article-editor-preview mt-6 text-sm leading-7 text-foreground"
              dangerouslySetInnerHTML={{ __html: articleHtml }}
            />
          ) : null}
        </section>
      </article>

      <section className="mt-10 rounded-2xl bg-surface-muted/80 px-4 py-5">
        <p className="text-sm text-muted">Want similar work?</p>
        <h2 className="mt-2 text-2xl font-medium">
          Tell us about your space and we will quote it clearly.
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition duration-200 hover:bg-primary-hover"
            href={whatsappHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageCircle size={17} />
            WhatsApp
          </a>
          <a
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border-strong px-5 text-sm font-medium text-foreground transition duration-200 hover:border-primary"
            href={telHref}
          >
            <Phone size={17} />
            Call now
          </a>
        </div>
      </section>

      <footer className="mt-8 border-t border-border-soft pt-5 text-sm text-muted">
        <Link className="minimal-link" href="/projects">
          Back to all projects
        </Link>
      </footer>
    </main>
  );
}