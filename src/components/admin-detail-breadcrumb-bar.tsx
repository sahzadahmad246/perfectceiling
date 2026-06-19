import { AdminBreadcrumb } from "@/components/admin-breadcrumb";
import type { AdminBreadcrumbItem } from "@/lib/admin-nav";

type AdminDetailBreadcrumbBarProps = {
  items: AdminBreadcrumbItem[];
};

export function AdminDetailBreadcrumbBar({
  items,
}: AdminDetailBreadcrumbBarProps) {
  return (
    <div className="bg-surface/90 px-4 py-2 backdrop-blur-xl sm:px-8">
      <AdminBreadcrumb items={items} size="xs" />
    </div>
  );
}