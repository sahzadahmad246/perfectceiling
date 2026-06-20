"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AdminDetailBreadcrumbBar } from "@/components/admin-detail-breadcrumb-bar";
import { getCustomerDetailBreadcrumb } from "@/lib/admin-nav";

type CustomerDetailHeaderProps = {
  customerName: string;
};

export function CustomerDetailHeader({
  customerName,
}: CustomerDetailHeaderProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 bg-surface/90 backdrop-blur-xl sm:-mx-8">
      <header className="border-b border-border-soft px-4 py-2 sm:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center">
            <Link
              aria-label="Back to customers"
              className="inline-flex items-center justify-center text-foreground transition hover:text-primary"
              href="/admin/customers"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </Link>
          </div>

          <h1 className="truncate text-center font-primary text-base font-medium">
            {customerName}
          </h1>

          <div />
        </div>
      </header>

      <AdminDetailBreadcrumbBar
        items={getCustomerDetailBreadcrumb(customerName)}
      />
    </div>
  );
}