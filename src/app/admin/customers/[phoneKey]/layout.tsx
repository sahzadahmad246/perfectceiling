import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getCustomerByPhoneKey } from "@/app/admin/customers/actions";
import { CustomerDetailHeaderSkeleton } from "@/components/admin-skeletons";
import { CustomerDetailHeader } from "@/components/customer-detail-header";
import { customerPhoneKeyFromParam } from "@/lib/customers";

type CustomerDetailLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    phoneKey: string;
  }>;
};

async function CustomerDetailHeaderSlot({
  params,
}: {
  params: CustomerDetailLayoutProps["params"];
}) {
  const { phoneKey } = await params;
  const customer = await getCustomerByPhoneKey(
    customerPhoneKeyFromParam(phoneKey),
  );

  if (!customer) {
    notFound();
  }

  return <CustomerDetailHeader customerName={customer.name} />;
}

export default function CustomerDetailLayout({
  children,
  params,
}: CustomerDetailLayoutProps) {
  return (
    <>
      <Suspense fallback={<CustomerDetailHeaderSkeleton />}>
        <CustomerDetailHeaderSlot params={params} />
      </Suspense>
      {children}
    </>
  );
}