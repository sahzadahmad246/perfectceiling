import {
  ArrowUpRight,
  MessageCircle,
  Phone,
} from "lucide-react";
import Link from "next/link";

import { HeroMediaCarousel } from "@/components/hero-media-carousel";
import { JsonLd } from "@/components/json-ld";
import { PublicBlogPreviewCard } from "@/components/public-blog-preview-card";
import { PublicProjectPreviewCard } from "@/components/public-project-preview-card";
import { PublicServicePreviewCard } from "@/components/public-service-preview-card";
import { SiteHeader } from "@/components/site-header";
import { getAdminClient } from "@/lib/auth/admin";
import {
  buildHomeJsonLd,
  collectHomePreviewImages,
} from "@/lib/home-seo";
import {
  getPublicBusinessSettings,
  toTelLink,
  toWhatsAppLink,
} from "@/lib/business-settings";
import {
  getPublicBlogPosts,
  getPublicHeroSlides,
  getPublicProjectCount,
  getPublicProjects,
  getPublicServices,
} from "@/lib/public-content";

import { siteConfig } from "@/lib/site";

const serviceHighlights = [
  ["01", "POP false ceiling for homes, shops, offices & halls"],
  ["02", "PVC ceiling for kitchens, bathrooms & utility spaces"],
  ["03", "Gypsum ceiling with cove lighting & modern designs"],
] as const;

const processSteps = [
  {
    title: "Share the space",
    text: "Send room photos, measurements, and the finish you want on WhatsApp.",
  },
  {
    title: "Get a clear quote",
    text: "We break the work into measured line items so the total is easy to review.",
  },
  {
    title: "Finish with care",
    text: "Installation, lighting cutouts, repairs, and final cleanup handled in one flow.",
  },
] as const;

export async function LandingPage() {
  const [settings, slides, projects, projectCount, services, blogPosts, adminSession] =
    await Promise.all([
      getPublicBusinessSettings(),
      getPublicHeroSlides(),
      getPublicProjects(6),
      getPublicProjectCount(),
      getPublicServices(),
      getPublicBlogPosts(),
      getAdminClient(),
    ]);

  const publishedServices = services.filter(
    (service) => !service.id.startsWith("fallback-"),
  );
  const recentBlogPosts = blogPosts.slice(0, 3);
  const isAdminLoggedIn = Boolean(adminSession);
  const previewImages = collectHomePreviewImages(
    slides,
    publishedServices,
    projects,
    blogPosts,
    settings.logoUrl,
  );

  const whatsappHref = toWhatsAppLink(
    settings.whatsapp,
    "Hi Perfect Ceiling, I want a quotation for ceiling work.",
  );
  const telHref = toTelLink(settings.phone);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 pb-10 text-foreground sm:px-8">
      <JsonLd
        data={buildHomeJsonLd(
          settings,
          publishedServices,
          projects,
          blogPosts,
          previewImages,
        )}
      />

      <div className="grid -mx-4 sm:-mx-8">
        <HeroMediaCarousel
          badge={`False ceiling contractor in ${settings.city}`}
          className="col-start-1 row-start-1"
          extendUnderHeader
          slides={slides}
        >
        <div className="flex flex-wrap gap-3">
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
        </HeroMediaCarousel>

        <SiteHeader
          className="col-start-1 row-start-1 self-start"
          overlay
        />
      </div>

      <div className="landing-flow -mx-4 sm:-mx-8">
        <section className="landing-section landing-bg-shade -mt-3 px-4 sm:px-8">
          <div aria-hidden className="landing-section-bg" />
          <div className="landing-section-content">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-surface-muted px-3 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  Service area
                </p>
                <p className="mt-2 font-primary text-lg font-semibold leading-snug text-foreground whitespace-pre-line line-clamp-3 sm:text-xl">
                  {settings.serviceAreas}
                </p>
              </div>
              <div className="rounded-2xl bg-surface-muted px-3 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  Projects
                </p>
                <p className="mt-2 font-primary text-2xl font-semibold leading-none text-foreground">
                  {projectCount > 0 ? projectCount : "—"}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {projectCount > 0 ? "Published on site" : "Gallery coming soon"}
                </p>
              </div>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-border-soft bg-surface-raised/80">
              {serviceHighlights.map(([number, label]) => (
                <div
                  className="grid grid-cols-[2.75rem_1fr] items-center border-b border-border-soft px-3 py-3 last:border-b-0 sm:grid-cols-[3rem_1fr] sm:px-4 sm:py-3.5"
                  key={number}
                >
                  <span className="text-xs text-subtle sm:text-sm">{number}</span>
                  <p className="text-[14px] text-foreground sm:text-[15px]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="landing-section landing-bg-grid px-4 sm:px-8"
          id="services"
        >
          <div aria-hidden className="landing-section-bg" />
          <div className="landing-section-content">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-muted">Services</p>
                <h2 className="mt-2 text-2xl font-medium">What we do</h2>
              </div>
              <Link
                className="minimal-link inline-flex items-center gap-1 text-sm"
                href="/services"
              >
                View all
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              {services.slice(0, 4).map((service) => (
                <PublicServicePreviewCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </section>

        <section
          className="landing-section landing-bg-shade-warm px-4 sm:px-8"
          id="projects"
        >
          <div aria-hidden className="landing-section-bg" />
          <div className="landing-section-content">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-muted">Recent work</p>
                <h2 className="mt-2 text-2xl font-medium">Completed projects</h2>
              </div>
              {projectCount > 0 ? (
                <Link
                  className="minimal-link inline-flex items-center gap-1 text-sm"
                  href="/projects"
                >
                  View all
                  <ArrowUpRight size={14} />
                </Link>
              ) : null}
            </div>
            <p className="mt-4 text-sm leading-7 text-muted">
              Published projects from admin appear here automatically once photos
              are added.
            </p>

            {projects.length > 0 ? (
              <div className="mt-6 space-y-4">
                {projects.map((project) => (
                  <PublicProjectPreviewCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-surface-muted px-4 py-5">
                <p className="text-sm font-medium text-foreground">
                  Project gallery is ready
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Add completed work in admin and mark it published to show real
                  photos here and in the homepage carousel.
                </p>
              </div>
            )}
          </div>
        </section>

        {recentBlogPosts.length > 0 ? (
          <section
            className="landing-section landing-bg-grid px-4 sm:px-8"
            id="blog"
          >
            <div aria-hidden className="landing-section-bg" />
            <div className="landing-section-content">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm text-muted">Blog</p>
                  <h2 className="mt-2 text-2xl font-medium">Recent articles</h2>
                </div>
                <Link
                  className="minimal-link inline-flex items-center gap-1 text-sm"
                  href="/blog"
                >
                  View all
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                {recentBlogPosts.map((post) => (
                  <PublicBlogPreviewCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="landing-section landing-bg-plain px-4 sm:px-8">
          <div aria-hidden className="landing-section-bg" />
          <div className="landing-section-content">
            <p className="text-sm text-muted">How it works</p>
            <h2 className="mt-2 text-2xl font-medium">
              Simple from first message to final coat
            </h2>

            <div className="mt-6 space-y-3">
              {processSteps.map((step, index) => (
                <article
                  className="rounded-xl border border-border-soft bg-surface-raised/70 p-4"
                  key={step.title}
                >
                  <p className="text-xs text-muted">Step {index + 1}</p>
                  <h3 className="mt-1 text-sm font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="landing-section landing-bg-shade-cool px-4 sm:px-8"
          id="contact"
        >
          <div aria-hidden className="landing-section-bg" />
          <div className="landing-section-content rounded-2xl bg-surface-muted/80 px-4 py-5">
            <p className="text-sm text-muted">Start a project</p>
            <h2 className="mt-2 text-2xl font-medium">
              Tell us about the room and we will quote it clearly.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Share photos, measurements, and the finish you want. We reply with a
              measured quotation for POP, PVC, gypsum, wooden, or repair work in{" "}
              {settings.city}.
            </p>

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
                {settings.phone}
              </a>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-8 flex flex-col gap-3 border-t border-border-soft pt-5 text-sm text-muted">
        <div>
          <p className="font-medium text-foreground">{settings.businessName}</p>
          <p className="mt-1">{settings.city}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a className="minimal-link" href={`mailto:${settings.email}`}>
            {settings.email}
          </a>
          <Link className="minimal-link" href="/blog">
            Blog
          </Link>
          {!isAdminLoggedIn ? (
            <Link
              className="minimal-link inline-flex items-center gap-1"
              href="/login"
            >
              Admin login
              <ArrowUpRight size={14} />
            </Link>
          ) : null}
          <span>{siteConfig.name}</span>
        </div>
      </footer>
    </main>
  );
}