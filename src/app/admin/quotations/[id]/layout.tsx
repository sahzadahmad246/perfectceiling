import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getQuotationById } from "@/app/admin/quotations/actions";
import { QuotationDetailHeaderSkeleton } from "@/components/admin-skeletons";
import { QuotationDetailHeader } from "@/components/quotation-detail-header";

type QuotationDetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
};

async function QuotationDetailHeaderSlot({
  params,
}: {
  params: QuotationDetailLayoutProps["params"];
}) {
  const { id } = await params;
  const quotation = await getQuotationById(id);

  if (!quotation) {
    notFound();
  }

  return (
    <QuotationDetailHeader
      quotationId={quotation.id}
      quotationNumber={quotation.quotationNumber}
      status={quotation.status}
    />
  );
}

export default function QuotationDetailLayout({
  children,
  params,
}: QuotationDetailLayoutProps) {
  return (
    <>
      <Suspense fallback={<QuotationDetailHeaderSkeleton />}>
        <QuotationDetailHeaderSlot params={params} />
      </Suspense>
      {children}
    </>
  );
}