import { getInvoiceById } from "@/app/admin/invoices/actions";
import { requireAdmin } from "@/lib/auth/admin";
import {
  formatDiscountLabel,
  formatQuotationDate,
  formatUnitType,
  getInvoiceDiscountDisplay,
  parseQuotationItemNotes,
} from "@/lib/invoices";
import { siteConfig } from "@/lib/site";
import { parseTerms } from "@/lib/terms";

import { fetchImageAsDataUri } from "../quotation-pdf/fetch-image";
import { formatCurrencyForPdf } from "../quotation-pdf/format-currency";
import type { InvoicePdfPayload } from "./types";

export async function loadInvoicePdfPayload(
  id: string,
): Promise<InvoicePdfPayload | null> {
  const [{ supabase }, invoice] = await Promise.all([
    requireAdmin(),
    getInvoiceById(id),
  ]);

  if (!invoice) {
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
    getInvoiceDiscountDisplay(invoice);

  const customer = invoice.customer;
  const customerAddress = [customer?.address, customer?.city]
    .filter((part) => part?.trim())
    .join(", ");

  const items = invoice.items.map((item) => {
    const { description, notes } = parseQuotationItemNotes(item.notes);
    const isLumpSum = item.unitType === "lump_sum";

    return {
      name: item.description,
      description,
      notes,
      quantityLabel: isLumpSum
        ? "Lump sum"
        : `${item.quantity} ${formatUnitType(item.unitType)} × ${formatCurrencyForPdf(item.rate)}`,
      amountLabel: formatCurrencyForPdf(item.amount),
    };
  });

  const workTitle = invoice.workTitle?.trim() || invoice.invoiceNumber;
  const customerName = customer?.name?.trim() || "Customer";
  const customerFirstName = customerName.split(/\s+/)[0] || customerName;

  const payments = [...invoice.payments]
    .sort(
      (left, right) =>
        new Date(left.paymentDate).getTime() -
        new Date(right.paymentDate).getTime(),
    )
    .map((payment) => ({
      dateLabel: formatQuotationDate(payment.paymentDate),
      amountLabel: formatCurrencyForPdf(payment.amount),
      notes: payment.notes?.trim() ?? "",
    }));

  return {
    invoiceNumber: invoice.invoiceNumber,
    workTitle,
    workSubtitle: `${workTitle} of Mr ${customerFirstName}`,
    dateLabel: formatQuotationDate(invoice.invoiceDate),
    dueDateLabel: invoice.dueDate
      ? formatQuotationDate(invoice.dueDate)
      : null,
    customerName,
    customerPhone: customer?.phone ?? "",
    customerAddress,
    customerNotes: customer?.notes?.trim() ?? "",
    items,
    subtotalLabel: formatCurrencyForPdf(invoice.subtotal),
    discountLabel: hasDiscount
      ? `Discount (${formatDiscountLabel(discountType, discountInput)})`
      : null,
    discountAmountLabel: hasDiscount
      ? `-${formatCurrencyForPdf(discountAmount)}`
      : null,
    grandTotalLabel: formatCurrencyForPdf(invoice.grandTotal),
    paidAmountLabel: formatCurrencyForPdf(invoice.paidAmount),
    balanceAmountLabel: formatCurrencyForPdf(invoice.balanceAmount),
    payments,
    terms: parseTerms(invoice.notes),
    business: {
      businessName: settings?.business_name?.trim() || siteConfig.name,
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