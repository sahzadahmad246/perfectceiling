"use client";

import { FileText, Home, Plus, ReceiptText, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAppRouter } from "@/hooks/use-app-router";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/quotations", label: "Quotes", icon: FileText },
  { href: "/admin/invoices", label: "Invoice", icon: ReceiptText },
  { href: "/admin/customers", label: "Customer", icon: Users },
];

export function AdminBottomNav() {
  const pathname = usePathname();
  const router = useAppRouter();
  const isQuotationsSection = pathname.startsWith("/admin/quotations");
  const isInvoicesSection = pathname.startsWith("/admin/invoices");

  return (
    <nav
      aria-label="Admin navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 sm:px-8"
    >
      <div className="pointer-events-auto w-full max-w-[560px] border-t border-border-soft bg-surface/95 py-2 backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            if (item.href === "/admin/quotations" && isQuotationsSection) {
              return (
                <button
                  className={cn(
                    "relative flex h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition",
                    "text-foreground hover:bg-surface-muted",
                  )}
                  key={item.href}
                  onClick={() => router.push("/admin/quotations?create=1")}
                  type="button"
                >
                  <span className="absolute top-1 h-0.5 w-5 rounded-full bg-primary" />
                  <Plus size={18} />
                  Create
                </button>
              );
            }

            if (item.href === "/admin/invoices" && isInvoicesSection) {
              return (
                <button
                  className={cn(
                    "relative flex h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition",
                    "text-foreground hover:bg-surface-muted",
                  )}
                  key={item.href}
                  onClick={() => router.push("/admin/invoices?create=1")}
                  type="button"
                >
                  <span className="absolute top-1 h-0.5 w-5 rounded-full bg-primary" />
                  <Plus size={18} />
                  Create
                </button>
              );
            }

            return (
              <Link
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium transition",
                  isActive
                    ? "text-foreground"
                    : "text-muted hover:bg-surface-muted hover:text-foreground",
                )}
                href={item.href}
                key={item.href}
              >
                {isActive ? (
                  <span className="absolute top-1 h-0.5 w-5 rounded-full bg-primary" />
                ) : null}
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}