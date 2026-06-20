import {
  ArrowUpRight,
  Hammer,
  MessageCircle,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { HeroMediaCarousel } from "@/components/hero-media-carousel";
import { SiteHeader } from "@/components/site-header";
import {
  getPublicBusinessSettings,
  toTelLink,
  toWhatsAppLink,
} from "@/lib/business-settings";
import {
  getPublicHeroSlides,
  getPublicProjectCount,
  getPublicProjects,
} from "@/lib/public-content";
import { services, siteConfig } from "@/lib/site";

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
  const [settings, slides, projects, projectCount] = await Promise.all([
    getPublicBusinessSettings(),
    getPublicHeroSlides(),
    getPublicProjects(6),
    getPublicProjectCount(),
  ]);

  const whatsappHref = toWhatsAppLink(
    settings.whatsapp,
    "Hi Perfect Ceiling, I want a quotation for ceiling work.",
  );
  const telHref = toTelLink(settings.phone);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 pb-10 text-foreground sm:px-8">
      <SiteHeader />

      <HeroMediaCarousel
        badge={`False ceiling contractor in ${settings.city}`}
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

      <div className="landing-flow -mx-4 sm:-mx-8">
        <section className="landing-section landing-bg-shade -mt-3 px-4 sm:px-8">
          <div aria-hidden className="landing-section-bg" />
          <div className="landing-section-content">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-surface-muted px-3 py-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  Service area
                </p>
                <p className="mt-2 font-primary text-2xl font-semibold leading-none text-foreground">
                  {settings.city}
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
            <p className="text-sm text-muted">Services</p>
            <h2 className="mt-2 text-2xl font-medium">What we do</h2>

            <div className="mt-6 divide-y divide-border-soft border-y border-border-soft">
              {services.map((service) => (
                <article className="group flex gap-4 py-5" key={service.title}>
                  <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted transition duration-200 group-hover:border-primary group-hover:text-foreground">
                    <Hammer size={17} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-medium">{service.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {service.description}
                    </p>
                  </div>
                </article>
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
            <p className="text-sm text-muted">Recent work</p>
            <h2 className="mt-2 text-2xl font-medium">Completed projects</h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Published projects from admin appear here automatically once photos
              are added.
            </p>

            {projects.length > 0 ? (
              <ul className="mt-6 divide-y divide-border-soft border-y border-border-soft">
                {projects.map((project) => (
                  <li key={project.id}>
                    <article className="py-4">
                      {project.imageUrl ? (
                        <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-xl border border-border-soft bg-surface-muted">
                          <Image
                            alt={project.title}
                            className="object-cover"
                            fill
                            sizes="560px"
                            src={project.imageUrl}
                            unoptimized={project.imageUrl.startsWith("http")}
                          />
                        </div>
                      ) : null}
                      <p className="text-xs text-muted">
                        {project.serviceType ?? "Ceiling work"}
                      </p>
                      <h3 className="mt-1 text-[17px] font-medium">
                        {project.title}
                      </h3>
                      {project.location ? (
                        <p className="mt-1 text-sm text-muted">
                          {project.location}
                        </p>
                      ) : null}
                      {project.description ? (
                        <p className="mt-2 text-sm leading-6 text-muted">
                          {project.description}
                        </p>
                      ) : null}
                    </article>
                  </li>
                ))}
              </ul>
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
          <Link
            className="minimal-link inline-flex items-center gap-1"
            href="/login"
          >
            Admin login
            <ArrowUpRight size={14} />
          </Link>
          <span>{siteConfig.name}</span>
        </div>
      </footer>
    </main>
  );
}