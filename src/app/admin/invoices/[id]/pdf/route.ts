import { getAdminClient } from "@/lib/auth/admin";
import { generateInvoicePdf } from "@/lib/invoice-pdf/generate";

type InvoicePdfRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: InvoicePdfRouteProps) {
  const admin = await getAdminClient();

  if (!admin) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const pdf = await generateInvoicePdf(id);

  if (!pdf) {
    return new Response("Invoice not found", { status: 404 });
  }

  return new Response(new Uint8Array(pdf.buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdf.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}