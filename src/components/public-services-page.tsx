import { MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import { PublicServiceCard } from "@/components/public-service-card";
import { SiteHeader } from "@/components/site-header";
import {
  getPublicBusinessSettings,
  toTelLink,
  toWhatsAppLink,
} from "@/lib/business-settings";
import { JsonLd } from "@/components/json-ld";
import { getPublicServices } from "@/lib/public-content";
import { buildServicesListJsonLd } from "@/lib/service-seo";
import { siteConfig } from "@/lib/site";

export async function PublicServicesPage() {
  const [settings, services] = await Promise.all([
    getPublicBusinessSettings(),
    getPublicServices(),
  ]);

  const whatsappHref = toWhatsAppLink(
    settings.whatsapp,
    "Hi Perfect Ceiling, I want a quotation for ceiling work.",
  );
  const telHref = toTelLink(settings.phone);

  const listDescription = `Browse POP, PVC, gypsum, wooden, and repair services from ${settings.businessName} in ${settings.city}.`;

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-4 pb-10 text-foreground sm:px-8">
      <JsonLd data={buildServicesListJsonLd(services, settings)} />

      <SiteHeader />

      <section className="mt-6">
        <p className="text-sm text-muted">Services</p>
        <h1 className="mt-2 font-primary text-3xl font-medium">
          Ceiling services in {settings.city}
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted">{listDescription}</p>
      </section>

      {services.length > 0 ? (
        <section aria-label="Service list" className="mt-8 space-y-4">
          {services.map((service) => (
            <PublicServiceCard key={service.id} service={service} />
          ))}
        </section>
      ) : (
        <section className="mt-8 rounded-2xl border border-border-soft bg-surface-muted/70 p-5 text-center">
          <p className="text-sm font-medium text-foreground">Services coming soon</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Published services from admin will appear here automatically.
          </p>
        </section>
      )}

      <section className="mt-10 rounded-2xl bg-surface-muted/80 px-4 py-5">
        <p className="text-sm text-muted">Need a quote?</p>
        <h2 className="mt-2 text-2xl font-medium">
          Tell us about your space and we will price it clearly.
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