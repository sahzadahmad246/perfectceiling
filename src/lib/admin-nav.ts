export type AdminBreadcrumbItem = {
  label: string;
  href?: string;
};

export type AdminNavPage = {
  label: string;
  href: string;
};

export function getAdminNavPage(pathname: string): AdminNavPage | null {
  if (pathname === "/admin") {
    return { label: "Home", href: "/admin" };
  }

  if (pathname.startsWith("/admin/quotations")) {
    return { label: "Quotes", href: "/admin/quotations" };
  }

  if (pathname.startsWith("/admin/invoices")) {
    return { label: "Invoices", href: "/admin/invoices" };
  }

  if (pathname.startsWith("/admin/customers")) {
    return { label: "Customer", href: "/admin/customers" };
  }

  if (pathname === "/admin/settings") {
    return { label: "Settings", href: "/admin/settings" };
  }

  return null;
}

export function getAdminGlobalBreadcrumb(pathname: string): AdminBreadcrumbItem[] {
  const page = getAdminNavPage(pathname);

  if (!page) {
    return [{ label: "Admin", href: "/admin" }];
  }

  return [
    { label: "Admin", href: "/admin" },
    { label: page.label },
  ];
}

export function getQuotationDetailBreadcrumb(
  quotationNumber: string,
): AdminBreadcrumbItem[] {
  return [
    { label: "Admin", href: "/admin" },
    { label: "Quotes", href: "/admin/quotations" },
    { label: quotationNumber },
  ];
}

export function getInvoiceDetailBreadcrumb(
  invoiceNumber: string,
): AdminBreadcrumbItem[] {
  return [
    { label: "Admin", href: "/admin" },
    { label: "Invoices", href: "/admin/invoices" },
    { label: invoiceNumber },
  ];
}

export function isAdminDocumentDetailPage(pathname: string) {
  return /^\/admin\/(?:quotations|invoices)\/[^/]+$/.test(pathname);
}