import { renderToBuffer } from "@react-pdf/renderer";

import { QuotationPdfDocument } from "./document";
import { loadQuotationPdfPayload } from "./load-data";

function sanitizeFileName(value: string) {
  return value.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-");
}

export async function generateQuotationPdf(id: string) {
  const payload = await loadQuotationPdfPayload(id);

  if (!payload) {
    return null;
  }

  const buffer = await renderToBuffer(
    <QuotationPdfDocument data={payload} />,
  );

  const fileName = `${sanitizeFileName(payload.business.businessName)}-${sanitizeFileName(payload.quotationNumber)}.pdf`;

  return {
    buffer,
    fileName,
  };
}