import { notFound } from "next/navigation";

import { getQuotationById } from "@/app/admin/quotations/actions";
import { QuotationDetailHeader } from "@/components/quotation-detail-header";

type QuotationDetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
};

export default async function QuotationDetailLayout({
  children,
  params,
}: QuotationDetailLayoutProps) {
  const { id } = await params;
  const quotation = await getQuotationById(id);

  if (!quotation) {
    notFound();
  }

  return (
    <>
      <QuotationDetailHeader
        quotationId={quotation.id}
        quotationNumber={quotation.quotationNumber}
        status={quotation.status}
      />
      {children}
    </>
  );
}