import {
  ArrowUpRight,
  FileText,
  Hammer,
  MessageCircle,
  Phone,
  ReceiptText,
  Ruler,
} from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { services, siteConfig } from "@/lib/site";

const stats = [
  ["01", "Site visit and measurement"],
  ["02", "Clear quotation with item rates"],
  ["03", "Clean ceiling finish and handover"],
];

const adminTools = [
  {
    icon: FileText,
    title: "Quotation",
    text: "Square foot, running foot, piece, and lump-sum item support.",
  },
  {
    icon: ReceiptText,
    title: "Invoice",
    text: "Convert accepted work into simple printable invoices.",
  },
  {
    icon: Ruler,
    title: "Measurements",
    text: "Keep area, rate, discount, and grand total easy to review.",
  },
];

export default function Home() {
  const whatsappText = encodeURIComponent(
    "Hi Perfect Ceiling, I want a quotation for ceiling work.",
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] bg-surface px-6 pb-10 text-foreground sm:px-8">
      <SiteHeader />

      <div
        className="-mx-6 border-b border-border-soft bg-surface-muted px-6 py-3 text-center text-sm text-muted sm:-mx-8 sm:px-8"
        role="status"
      >
        This site is under development.
      </div>

      <section className="animate-rise pt-14">
        <p className="text-sm text-muted">
          False ceiling contractor in {siteConfig.city}
        </p>
        <h1 className="mt-5 text-[44px] font-medium leading-[0.98] tracking-normal text-foreground sm:text-5xl">
          Quiet, clean ceiling work for homes, shops, and offices.
        </h1>
        <p className="mt-6 max-w-[34rem] text-[17px] leading-8 text-muted">
          Perfect Ceiling handles POP false ceiling, PVC ceiling, wooden
          ceiling, gypsum work, repairs, and finishing with measured pricing and
          straightforward communication.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition duration-200 hover:bg-primary-hover"
            href={`https://wa.me/${siteConfig.whatsapp}?text=${whatsappText}`}
          >
            <MessageCircle size={17} />
            WhatsApp
          </a>
          <a
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border-strong px-5 text-sm font-medium text-foreground transition duration-200 hover:border-primary"
            href={`tel:${siteConfig.phone}`}
          >
            <Phone size={17} />
            Call now
          </a>
        </div>
      </section>

      <section className="animate-rise-delay mt-14 border-y border-border-soft">
        {stats.map(([number, label]) => (
          <div
            className="grid grid-cols-[3rem_1fr] items-center border-b border-border-soft py-4 last:border-b-0"
            key={number}
          >
            <span className="text-sm text-subtle">{number}</span>
            <p className="text-[15px] text-foreground">{label}</p>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-sm text-muted">Services</p>
            <h2 className="mt-2 text-2xl font-medium">What we do</h2>
          </div>
          <Link
            className="minimal-link inline-flex items-center gap-1 text-sm text-muted"
            href="/services"
          >
            View all
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="mt-6 divide-y divide-border-soft border-y border-border-soft">
          {services.map((service, index) => (
            <article
              className="group flex gap-4 py-5"
              key={service.title}
              style={{ animationDelay: `${160 + index * 70}ms` }}
            >
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
      </section>

      <section className="mt-14">
        <p className="text-sm text-muted">Business tools</p>
        <h2 className="mt-2 text-2xl font-medium">
          Built to quote work without confusion.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          The admin dashboard will keep customers, quotations, invoices, and
          line-item totals in one place. The public site stays simple; the back
          office does the paperwork.
        </p>

        <div className="mt-6 space-y-3">
          {adminTools.map((tool) => {
            const Icon = tool.icon;

            return (
              <div
                className="flex gap-4 rounded-md border border-border-soft bg-surface-raised/60 p-4 transition duration-200 hover:border-border-strong hover:bg-surface-raised"
                key={tool.title}
              >
                <Icon className="mt-0.5 shrink-0 text-muted" size={20} />
                <div>
                  <h3 className="text-sm font-medium">{tool.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    {tool.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-14 border-t border-border-soft pt-8">
        <p className="text-sm text-muted">SEO foundation</p>
        <h2 className="mt-2 text-2xl font-medium">
          Service pages, local pages, blogs, and real project photos.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted">
          This starter is ready for pages targeting POP false ceiling, PVC
          ceiling, wooden ceiling, gypsum ceiling, repair work, and local
          service-area searches.
        </p>
      </section>

      <footer className="mt-14 flex items-center justify-between border-t border-border-soft pt-5 text-sm text-muted">
        <span>{siteConfig.name}</span>
        <a className="minimal-link" href={`mailto:${siteConfig.email}`}>
          Email
        </a>
      </footer>
    </main>
  );
}
