import { notFound } from "next/navigation";

import { getCustomerByPhoneKey } from "@/app/admin/customers/actions";
import { CustomerDetailHeader } from "@/components/customer-detail-header";
import { customerPhoneKeyFromParam } from "@/lib/customers";

type CustomerDetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    phoneKey: string;
  }>;
};

export default async function CustomerDetailLayout({
  children,
  params,
}: CustomerDetailLayoutProps) {
  const { phoneKey } = await params;
  const customer = await getCustomerByPhoneKey(
    customerPhoneKeyFromParam(phoneKey),
  );

  if (!customer) {
    notFound();
  }

  return (
    <>
      <CustomerDetailHeader customerName={customer.name} />
      {children}
    </>
  );
}