import { getQuotationById } from "@/app/admin/quotations/actions";
import { requireAdmin } from "@/lib/auth/admin";
import { siteConfig } from "@/lib/site";
import { parseTerms } from "@/lib/terms";
import {
  formatCustomerName,
  formatDiscountLabel,
  formatQuotationDate,
  formatUnitType,
  getQuotationDiscountDisplay,
  normalizeCustomerTitle,
  parseQuotationItemNotes,
} from "@/lib/quotations";

import { fetchImageAsDataUri } from "./fetch-image";
import { formatCurrencyForPdf } from "./format-currency";
import type { QuotationPdfImage, QuotationPdfPayload } from "./types";

export async function loadQuotationPdfPayload(
  id: string,
): Promise<QuotationPdfPayload | null> {
  const [{ supabase }, quotation] = await Promise.all([
    requireAdmin(),
    getQuotationById(id),
  ]);

  if (!quotation) {
    return null;
  }

  const { data: settings } = await supabase
    .from("business_settings")
    .select(
      "business_name, logo_url, phone, whatsapp, email, address, city, gst_number, bank_details",
    )
    .limit(1)
    .maybeSingle();

  const logoDataUri = settings?.logo_url
    ? await fetchImageAsDataUri(settings.logo_url)
    : null;

  const { discountType, discountInput, discountAmount, hasDiscount } =
    getQuotationDiscountDisplay(quotation);

  const customer = quotation.customer;
  const customerAddress = [customer?.address, customer?.city]
    .filter((part) => part?.trim())
    .join(", ");

  const images: QuotationPdfImage[] = [];

  for (const item of quotation.items) {
    for (const image of item.images) {
      const dataUri = await fetchImageAsDataUri(image.url);

      if (!dataUri) {
        continue;
      }

      images.push({
        itemName: item.description,
        label: image.description.trim() || "Reference image",
        dataUri,
      });
    }
  }

  const items = quotation.items.map((item) => {
    const { description, notes } = parseQuotationItemNotes(item.notes);
    const isLumpSum = item.unitType === "lump_sum";
    const isRateOnly = item.isRateOnly;
    const unitLabel = formatUnitType(item.unitType);
    const rateLabel = `${formatCurrencyForPdf(item.rate)} / ${unitLabel}`;

    return {
      name: item.description,
      description,
      notes,
      quantityLabel: isLumpSum
        ? "Lump sum"
        : isRateOnly
          ? item.quantity > 0
            ? `Approx. ${item.quantity} ${unitLabel} × ${rateLabel}`
            : rateLabel
          : `${item.quantity} ${unitLabel} × ${formatCurrencyForPdf(item.rate)}`,
      amountLabel: isRateOnly ? "Rate only" : formatCurrencyForPdf(item.amount),
    };
  });

  const workTitle = quotation.workTitle?.trim() || quotation.quotationNumber;
  const customerName = customer
    ? formatCustomerName({
        title: customer.title,
        name: customer.name,
      }) || "Customer"
    : "Customer";
  const customerFirstName =
    customer?.name?.trim().split(/\s+/)[0] || customerName;
  const customerTitle = normalizeCustomerTitle(customer?.title);
  const workSubtitleHonorific = customerTitle
    ? `${customerTitle} ${customerFirstName}`
    : customerFirstName;

  return {
    quotationNumber: quotation.quotationNumber,
    workTitle,
    workSubtitle: `${workTitle} of ${workSubtitleHonorific}`,
    dateLabel: formatQuotationDate(quotation.date),
    validUntilLabel: quotation.validUntil
      ? formatQuotationDate(quotation.validUntil)
      : null,
    customerName,
    customerPhone: customer?.phone ?? "",
    customerAddress,
    customerNotes: customer?.notes?.trim() ?? "",
    items,
    showTotals: quotation.grandTotal > 0 || quotation.subtotal > 0,
    subtotalLabel: formatCurrencyForPdf(quotation.subtotal),
    discountLabel: hasDiscount
      ? `Discount (${formatDiscountLabel(discountType, discountInput)})`
      : null,
    discountAmountLabel: hasDiscount
      ? `-${formatCurrencyForPdf(discountAmount)}`
      : null,
    grandTotalLabel: formatCurrencyForPdf(quotation.grandTotal),
    terms: parseTerms(quotation.terms),
    images,
    business: {
      businessName:
        settings?.business_name?.trim() || siteConfig.name,
      logoDataUri,
      phone: settings?.phone?.trim() || siteConfig.phone,
      whatsapp:
        settings?.whatsapp?.trim() ||
        settings?.phone?.trim() ||
        siteConfig.whatsapp,
      email: settings?.email?.trim() || siteConfig.email,
      address: settings?.address?.trim() ?? "",
      city: settings?.city?.trim() || siteConfig.city,
      gstNumber: settings?.gst_number?.trim() ?? "",
      bankDetails: settings?.bank_details?.trim() ?? "",
    },
  };
}
