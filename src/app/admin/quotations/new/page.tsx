import { redirect } from "next/navigation";

export default function NewQuotationPage() {
  redirect("/admin/quotations?create=1");
}