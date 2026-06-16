import { MessageCircle, Phone } from "lucide-react";

import { HeroHeading } from "@/components/hero-heading";
import {
  toTelLink,
  toWhatsAppLink,
  type PublicBusinessSettings,
} from "@/lib/business-settings";

const serviceHighlights = [
  ["01", "POP false ceiling for homes, shops, offices & halls"],
  ["02", "PVC ceiling for kitchens, bathrooms & utility spaces"],
  ["03", "Gypsum ceiling with cove lighting & modern designs"],
] as const;

type HeroSectionProps = Pick<PublicBusinessSettings, "city" | "phone" | "whatsapp">;

export function HeroSection({ city, phone, whatsapp }: HeroSectionProps) {
  const whatsappHref = toWhatsAppLink(
    whatsapp,
    "Hi Perfect Ceiling, I want a quotation for ceiling work.",
  );
  const telHref = toTelLink(phone);

  return (
    <section className="animate-rise -mx-6 sm:-mx-8">
      <div className="hero-grid relative overflow-hidden border-b border-border-soft px-6 pb-8 pt-5 sm:px-8 sm:pb-10 sm:pt-8">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface-raised/85 px-3 py-1 text-xs text-muted backdrop-blur-sm">
            <span
              aria-hidden
              className="size-1.5 shrink-0 rounded-full bg-primary"
            />
            False ceiling contractor in {city}
          </div>

          <HeroHeading />

          <p className="mt-5 max-w-[34rem] text-[15px] leading-7 text-muted sm:mt-6 sm:text-[17px] sm:leading-8">
            Perfect Ceiling handles POP false ceiling, PVC ceiling, wooden
            ceiling, gypsum work, repairs, and finishing with measured pricing
            and straightforward communication.
          </p>

          <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
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
        </div>

        <div className="relative z-10 mt-8 overflow-hidden rounded-xl border border-border-soft bg-surface-raised/75 backdrop-blur-sm sm:mt-10">
          {serviceHighlights.map(([number, label], index) => (
            <div
              className="grid grid-cols-[2.75rem_1fr] items-center border-b border-border-soft px-3 py-3 last:border-b-0 sm:grid-cols-[3rem_1fr] sm:px-4 sm:py-3.5"
              key={number}
            >
              <span className="text-xs text-subtle sm:text-sm">{number}</span>
              <p
                className="text-[14px] text-foreground sm:text-[15px]"
                style={{ animationDelay: `${180 + index * 60}ms` }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}