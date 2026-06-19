import { notFound } from "next/navigation";

import { getInvoiceById } from "@/app/admin/invoices/actions";
import { InvoiceDetailHeader } from "@/components/invoice-detail-header";

type InvoiceDetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    id: string;
  }>;
};

export default async function InvoiceDetailLayout({
  children,
  params,
}: InvoiceDetailLayoutProps) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);

  if (!invoice) {
    notFound();
  }

  return (
    <>
      <InvoiceDetailHeader
        balanceAmount={invoice.balanceAmount}
        invoiceId={invoice.id}
        invoiceNumber={invoice.invoiceNumber}
      />
      {children}
    </>
  );
}