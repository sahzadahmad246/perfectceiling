import { renderToBuffer } from "@react-pdf/renderer";

import { InvoicePdfDocument } from "./document";
import { loadInvoicePdfPayload } from "./load-data";

function sanitizeFileName(value: string) {
  return value.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-");
}

export async function generateInvoicePdf(id: string) {
  const payload = await loadInvoicePdfPayload(id);

  if (!payload) {
    return null;
  }

  const buffer = await renderToBuffer(<InvoicePdfDocument data={payload} />);

  const fileName = `${sanitizeFileName(payload.business.businessName)}-${sanitizeFileName(payload.invoiceNumber)}.pdf`;

  return {
    buffer,
    fileName,
  };
}