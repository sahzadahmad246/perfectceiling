import { Suspense } from "react";
import type { PublicBusinessSettings } from "@/lib/business-settings";
import { Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import { CeilingDesignGuide } from "@/components/ceiling-design-guide";
import { HomeFooter } from "@/components/home-footer";
import { HeroMediaCarousel } from "@/components/hero-media-carousel";
import { JsonLd } from "@/components/json-ld";
import { HomeArticlesSection, HomeCatalogueSection, HomeProjectsSection } from "@/components/home-content-sections";
import { HomeServicesSection } from "@/components/home-services-section";
import { SiteHeader } from "@/components/site-header";
import { PublicGoogleReviewsSection } from "@/components/public-google-reviews-section";
import { WhatsAppFab } from "@/components/whatsapp-fab";
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
import { getGoogleBusinessReviews } from "@/lib/google-reviews";
import {
  getPublicBlogPosts,
  getPublicCatalogueImages,
  getPublicHeroSlides,
  getPublicProjects,
  getPublicServices,
} from "@/lib/public-content";


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

type ReviewsPromise = ReturnType<typeof getGoogleBusinessReviews>;

async function StreamedReviews({ data }: { data: ReviewsPromise }) {
  const reviews = await data;
  return reviews ? <PublicGoogleReviewsSection data={reviews} /> : null;
}

async function StreamedFooter({ settings, data, showAdminLogin }: { settings: PublicBusinessSettings; data: ReviewsPromise; showAdminLogin: boolean }) {
  const reviews = await data;
  return <HomeFooter settings={settings} showAdminLogin={showAdminLogin} hasReviews={Boolean(reviews)} />;
}

export async function LandingPage() {
  const reviewsPromise = getGoogleBusinessReviews();
  const [
    settings,
    slides,
    projects,
    services,
    catalogueImages,
    blogPosts,
    adminSession,
  ] = await Promise.all([
    getPublicBusinessSettings(),
    getPublicHeroSlides(),
    getPublicProjects(6),
    getPublicServices(),
    getPublicCatalogueImages(4),
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
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 text-foreground sm:px-8">
      <JsonLd
        data={buildHomeJsonLd(
          settings,
          publishedServices,
          projects,
          blogPosts,
          previewImages,
        )}
      />

      <SiteHeader className="border-b-0 bg-[#f3f0e9]" />

      <section className="-mx-4 bg-[#f3f0e9] px-4 pb-7 pt-9 sm:-mx-8 sm:px-8 sm:pb-9 sm:pt-12">
        <div>
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#706454]">
          <span aria-hidden className="size-1.5 rounded-full bg-[#9a7549]" />
          Ceiling specialists · {settings.city}
        </p>
        <h1 className="mt-5 max-w-lg font-primary text-[clamp(2.25rem,8vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[#292720]">
          A beautiful space<br />starts <span className="font-normal text-[#80603e]">above.</span>
        </h1>
        <p className="mt-5 max-w-md text-sm leading-7 text-[#6c665c]">
          Thoughtfully designed POP, gypsum, PVC and wooden ceilings.
          From your first idea to the finishing touches, we bring it together.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <a
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#292720] px-5 text-sm font-medium text-white transition hover:bg-[#4a4439] focus-visible:outline-2 focus-visible:outline-offset-4"
            href={whatsappHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            <FaWhatsapp aria-hidden size={18} /> Get a quotation
          </a>
          <a
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#ccc4b7] px-4 text-sm font-medium text-[#292720] transition hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-4"
            href={telHref}
          >
            <Phone aria-hidden size={15} /> Call us
          </a>
        </div>
        </div>
        <div className="mt-7">
          <HeroMediaCarousel slides={slides} />
        </div>
      </section>

      <div className="landing-flow -mx-4 sm:-mx-8">
        <CeilingDesignGuide services={services} whatsappHref={whatsappHref} />
        <HomeServicesSection services={services} />

        <HomeCatalogueSection items={catalogueImages} />
        <HomeProjectsSection projects={projects} />
        <HomeArticlesSection posts={recentBlogPosts} />

        <Suspense fallback={null}><StreamedReviews data={reviewsPromise} /></Suspense>

        <section className="px-4 py-9 sm:px-8">
          <div className="landing-section-content">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#80603e]">How it works</p>
            <h2 className="mt-2 font-primary text-[26px] font-medium leading-tight tracking-[-0.035em] text-[#292720]">
              Your project, in three steps.
            </h2>

            <ol className="mt-7">
              {processSteps.map((step, index) => (
                <li className="relative grid grid-cols-[2rem_1fr] gap-4 pb-7 last:pb-0" key={step.title}>
                  {index < processSteps.length - 1 ? <span aria-hidden className="absolute bottom-0 left-[15px] top-8 w-px bg-[#d6c7b1]" /> : null}
                  <span aria-hidden className="relative z-10 flex size-8 items-center justify-center rounded-full border border-[#c9b69a] bg-[#f3eee5] text-xs font-medium text-[#80603e]">{index + 1}</span>
                  <div className="pt-1">
                    <h3 className="font-primary text-sm font-medium text-[#292720]">{step.title}</h3>
                    <p className="mt-2 text-xs leading-6 text-[#6c665c]">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="bg-[#f3f0e9] px-4 py-9 sm:px-8"
          id="contact"
        >
          <div className="landing-section-content">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#80603e]">Let’s create your space</p>
            <h2 className="mt-2 font-primary text-[26px] font-medium leading-tight tracking-[-0.035em] text-[#292720]">
              Have a room in mind?
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#6c665c]">
              Share photos, measurements, and the finish you want. We reply with a
              measured quotation for POP, PVC, gypsum, wooden, or repair work in{" "}
              {settings.city}.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#292720] px-5 text-sm font-medium text-white transition hover:bg-[#4a4439]"
                href={whatsappHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                <FaWhatsapp aria-hidden size={18} />
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

      <Suspense fallback={<HomeFooter settings={settings} showAdminLogin={!isAdminLoggedIn} hasReviews={false} />}><StreamedFooter settings={settings} data={reviewsPromise} showAdminLogin={!isAdminLoggedIn} /></Suspense>

      <WhatsAppFab href={whatsappHref} />
    </main>
  );
}