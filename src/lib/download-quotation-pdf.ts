function getFileNameFromDisposition(header: string | null) {
  if (!header) {
    return null;
  }

  const match = header.match(/filename="?([^"]+)"?/i);

  return match?.[1] ?? null;
}

export async function downloadQuotationPdf(quotationId: string) {
  const response = await fetch(`/admin/quotations/${quotationId}/pdf`);

  if (!response.ok) {
    throw new Error("Could not download quotation PDF.");
  }

  const blob = await response.blob();
  const fileName =
    getFileNameFromDisposition(response.headers.get("Content-Disposition")) ??
    `quotation-${quotationId}.pdf`;
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}