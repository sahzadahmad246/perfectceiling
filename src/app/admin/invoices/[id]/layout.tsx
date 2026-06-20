import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getInvoiceById } from "@/app/admin/invoices/actions";
import { InvoiceDetailHeaderSkeleton } from "@/components/admin-skeletons";
import { InvoiceDetailHeader } from "@/components/invoice-detail-header";

type InvoiceDetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
};

async function InvoiceDetailHeaderSlot({
  params,
}: {
  params: InvoiceDetailLayoutProps["params"];
}) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  return (
    <InvoiceDetailHeader
      balanceAmount={invoice.balanceAmount}
      invoiceId={invoice.id}
      invoiceNumber={invoice.invoiceNumber}
    />
  );
}

export default function InvoiceDetailLayout({
  children,
  params,
}: InvoiceDetailLayoutProps) {
  return (
    <>
      <Suspense fallback={<InvoiceDetailHeaderSkeleton />}>
        <InvoiceDetailHeaderSlot params={params} />
      </Suspense>
      {children}
    </>
  );
}