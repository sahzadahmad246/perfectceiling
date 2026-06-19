import { redirect } from "next/navigation";

export default function NewInvoicePage() {
  redirect("/admin/invoices?create=1");
}