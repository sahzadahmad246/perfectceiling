import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { PublicProjectPreviewCard } from "@/components/public-project-preview-card";
import { SiteHeader } from "@/components/site-header";
import {
  getPublicBusinessSettings,
  toTelLink,
  toWhatsAppLink,
} from "@/lib/business-settings";
import { getAllPublicProjects } from "@/lib/public-content";
import { buildProjectsListJsonLd } from "@/lib/project-seo";
import { siteConfig } from "@/lib/site";

export async function PublicProjectsPage() {
  const [settings, projects] = await Promise.all([
    getPublicBusinessSettings(),
    getAllPublicProjects(),
  ]);

  const whatsappHref = toWhatsAppLink(
    settings.whatsapp,
    "Hi Perfect Ceiling, I saw your completed projects and want a similar quotation.",
  );
  const telHref = toTelLink(settings.phone);

  const listDescription = `Browse completed POP, PVC, gypsum, and false ceiling projects from ${settings.businessName} in ${settings.city}.`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 pb-10 text-foreground sm:px-8">
      <JsonLd data={buildProjectsListJsonLd(projects, settings)} />

      <SiteHeader />

      <nav aria-label="Breadcrumb" className="mt-4 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="minimal-link" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-foreground">Projects</li>
        </ol>
      </nav>

      <section className="mt-6">
        <p className="text-sm text-muted">Projects</p>
        <h1 className="mt-2 font-primary text-3xl font-medium">
          Completed ceiling projects in {settings.city}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">{listDescription}</p>
      </section>

      {projects.length > 0 ? (
        <section aria-label="Project list" className="mt-8 space-y-4">
          {projects.map((project) => (
            <PublicProjectPreviewCard key={project.id} project={project} />
          ))}
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-border-soft bg-surface-muted/70 p-5 text-center">
          <p className="text-sm font-medium text-foreground">Projects coming soon</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Published projects from admin will appear here automatically.
          </p>
        </section>
      )}

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
        <Link className="minimal-link" href="/">
          Back to {siteConfig.name}
        </Link>
      </footer>
    </main>
  );
}