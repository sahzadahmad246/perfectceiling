import { cache } from "react";

import { hasSupabaseEnv } from "@/lib/env";
import { siteConfig } from "@/lib/site";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PublicBusinessSettings = {
  businessName: string;
  phone: string;
  whatsapp: string;
  email: string;
  city: string;
};

const fallbackSettings: PublicBusinessSettings = {
  businessName: siteConfig.name,
  phone: siteConfig.phone,
  whatsapp: siteConfig.whatsapp,
  email: siteConfig.email,
  city: siteConfig.city,
};

export function toTelLink(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function toWhatsAppLink(phone: string, text?: string) {
  const digits = phone.replace(/[^\d]/g, "");
  const base = `https://wa.me/${digits}`;

  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const getPublicBusinessSettings = cache(
  async (): Promise<PublicBusinessSettings> => {
    if (!hasSupabaseEnv()) {
      return fallbackSettings;
    }

    try {
      const serviceClient = createServiceClient();
      const client = serviceClient ?? (await createClient());

      const { data, error } = await client
        .from("business_settings")
        .select("business_name, phone, whatsapp, email, city")
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return fallbackSettings;
      }

      const phone = data.phone?.trim() || fallbackSettings.phone;
      const whatsapp = data.whatsapp?.trim() || phone;

      return {
        businessName: data.business_name?.trim() || fallbackSettings.businessName,
        phone,
        whatsapp,
        email: data.email?.trim() || fallbackSettings.email,
        city: data.city?.trim() || fallbackSettings.city,
      };
    } catch {
      return fallbackSettings;
    }
  },
);