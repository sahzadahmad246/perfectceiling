import { getInvoiceById } from "@/app/admin/invoices/actions";
import { requireAdmin } from "@/lib/auth/admin";
import {
  formatCustomerName,
  formatDiscountLabel,
  formatQuotationDate,
  formatUnitType,
  getInvoiceDiscountDisplay,
  parseQuotationItemNotes,
} from "@/lib/invoices";
import { normalizeCustomerTitle } from "@/lib/quotations";
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

  const workTitle = invoice.workTitle?.trim() || invoice.invoiceNumber;
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
    workSubtitle: `${workTitle} of ${workSubtitleHonorific}`,
    dateLabel: formatQuotationDate(invoice.invoiceDate),
    dueDateLabel: invoice.dueDate
      ? formatQuotationDate(invoice.dueDate)
      : null,
    customerName,
    customerPhone: customer?.phone ?? "",
    customerAddress,
    customerNotes: customer?.notes?.trim() ?? "",
    items,
    showTotals:
      invoice.grandTotal > 0 ||
      invoice.subtotal > 0 ||
      invoice.paidAmount > 0 ||
      invoice.balanceAmount > 0,
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
