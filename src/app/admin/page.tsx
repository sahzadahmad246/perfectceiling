import type { Metadata } from "next";
import { Suspense } from "react";

import { getAdminDashboardData } from "@/app/admin/actions";
import { AdminHomeView } from "@/components/admin-home-view";
import { PageSpinner } from "@/components/page-spinner";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const data = await getAdminDashboardData();

  return (
    <Suspense fallback={<PageSpinner label="Loading dashboard..." />}>
      <AdminHomeView data={data} />
    </Suspense>
  );
}