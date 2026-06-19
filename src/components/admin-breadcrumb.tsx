import { ChevronRight } from "lucide-react";
import Link from "next/link";

import type { AdminBreadcrumbItem } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

type AdminBreadcrumbProps = {
  items: AdminBreadcrumbItem[];
  className?: string;
  size?: "sm" | "xs";
};

export function AdminBreadcrumb({
  items,
  className,
  size = "sm",
}: AdminBreadcrumbProps) {
  const textClass = size === "xs" ? "text-xs" : "text-sm";

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className={cn("flex min-w-0 items-center", textClass)}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              className="flex min-w-0 items-center"
              key={`${item.label}-${index}`}
            >
              {index > 0 ? (
                <ChevronRight
                  aria-hidden
                  className="mx-1 shrink-0 text-muted"
                  size={size === "xs" ? 12 : 14}
                />
              ) : null}

              {item.href && !isLast ? (
                <Link
                  className="truncate text-muted transition hover:text-foreground"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "truncate",
                    isLast ? "font-medium text-foreground" : "text-muted",
                  )}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}