import type { Metadata } from "next";

import { ensureBusinessSettings } from "@/app/admin/settings/actions";
import {
  LogoFieldCard,
  SettingsFieldCard,
  TermsFieldCard,
} from "@/components/settings-field-card";

export const metadata: Metadata = {
  title: "Settings",
};

const businessFields = [
  { field: "business_name", label: "Business name" },
  { field: "phone", label: "Phone number" },
  { field: "whatsapp", label: "WhatsApp number" },
  { field: "email", label: "Email address" },
  { field: "address", label: "Business address", multiline: true },
  { field: "city", label: "City" },
  { field: "service_areas", label: "Service areas", multiline: true },
  { field: "gst_number", label: "GST number" },
] as const;

const documentFields = [
  { field: "bank_details", label: "Bank/payment details", multiline: true },
  {
    field: "default_quotation_terms",
    label: "Default quotation terms",
    type: "terms" as const,
  },
  {
    field: "default_invoice_terms",
    label: "Default invoice terms",
    type: "terms" as const,
  },
] as const;

type BusinessSettings = {
  logo_url: string | null;
  business_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  service_areas: string | null;
  gst_number: string | null;
  bank_details: string | null;
  default_quotation_terms: string | null;
  default_invoice_terms: string | null;
};

export default async function SettingsPage() {
  const settings = (await ensureBusinessSettings()) as BusinessSettings;

  return (
    <>
      <section className="mt-4">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-foreground">Basic info</h2>
          <p className="mt-1 text-sm text-muted">
            Logo, contact details, and business information.
          </p>
        </div>
        <div className="rounded-md border border-border-soft bg-surface-raised/60 px-3 sm:px-4">
          <LogoFieldCard logoUrl={settings.logo_url} />
          {businessFields.map((item) => (
            <SettingsFieldCard
              field={item.field}
              key={item.field}
              label={item.label}
              multiline={"multiline" in item ? item.multiline : false}
              value={settings[item.field]}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-foreground">
            Payments &amp; terms
          </h2>
          <p className="mt-1 text-sm text-muted">
            Bank details and default terms for quotations and invoices.
          </p>
        </div>
        <div className="rounded-md border border-border-soft bg-surface-raised/60 px-3 sm:px-4">
          {documentFields.map((item) =>
            "type" in item && item.type === "terms" ? (
              <TermsFieldCard
                field={item.field}
                key={item.field}
                label={item.label}
                value={settings[item.field]}
              />
            ) : (
              <SettingsFieldCard
                field={item.field}
                key={item.field}
                label={item.label}
                multiline={"multiline" in item ? item.multiline : false}
                value={settings[item.field]}
              />
            ),
          )}
        </div>
      </section>
    </>
  );
}