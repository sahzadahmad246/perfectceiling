import { prisma } from "@/lib/prisma";
import { generateQuotationPdf } from "@/lib/pdf";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!quotation) return Response.json({ error: "Not found" }, { status: 404 });

  const business = await prisma.businessProfile.findFirst();
  const terms = await prisma.term.findMany({ where: { enabled: true }, orderBy: { orderIndex: "asc" } });

  const pdfBuffer = await generateQuotationPdf({
    business: {
      name: business?.businessName ?? "Perfect Ceiling",
      address: business?.address ?? undefined,
      phone: business?.primaryPhone ?? undefined,
      secondaryPhone: business?.secondaryPhone ?? undefined,
    },
    quotation: {
      id: quotation.id,
      type: quotation.type,
      customerName: quotation.customerName,
      customerPhone: quotation.customerPhone,
      customerAddress: quotation.customerAddress ?? undefined,
      items: quotation.items
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((it) => ({
          description: it.description,
          areaSqft: it.areaSqft ?? undefined,
          ratePerSqft: it.ratePerSqft ? Number(it.ratePerSqft) : undefined,
          quantity: it.quantity ?? undefined,
          amount: Number(it.amount),
        })),
      subtotal: Number(quotation.subtotal),
      discountAmount: Number(quotation.discountAmount),
      total: Number(quotation.total),
      notes: quotation.notes ?? undefined,
      terms: terms.map((t) => t.content),
    },
  });

  const body = new Uint8Array(pdfBuffer);
  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=quotation-${quotation.id}.pdf`,
    },
  });
}


