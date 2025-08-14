import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import QuotationForm from "@/components/quotations/QuotationForm"; // normal import

export const metadata: Metadata = {
  title: "New Quotation | Perfect Ceiling",
  description: "Create a new quotation for a client.",
  openGraph: {
    title: "New Quotation | Perfect Ceiling",
    description: "Create a new quotation for a client.",
  },
};

export default async function NewQuotationPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-white container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Quotation</h1>
      <QuotationForm />
    </div>
  );
}
