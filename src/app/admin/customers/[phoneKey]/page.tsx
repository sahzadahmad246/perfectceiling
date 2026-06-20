import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCustomerByPhoneKey } from "@/app/admin/customers/actions";
import { CustomerDetailView } from "@/components/customer-detail-view";
import { customerPhoneKeyFromParam } from "@/lib/customers";

type CustomerDetailPageProps = {
  params: Promise<{
    phoneKey: string;
  }>;
};

export async function generateMetadata({
  params,
}: CustomerDetailPageProps): Promise<Metadata> {
  const { phoneKey } = await params;
  const customer = await getCustomerByPhoneKey(
    customerPhoneKeyFromParam(phoneKey),
  );

  return {
    title: customer?.name ?? "Customer",
  };
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { phoneKey } = await params;
  const customer = await getCustomerByPhoneKey(
    customerPhoneKeyFromParam(phoneKey),
  );

  if (!customer) {
    notFound();
  }

  return <CustomerDetailView customer={customer} />;
}