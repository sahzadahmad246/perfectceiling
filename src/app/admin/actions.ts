"use server";

import { listCustomers } from "@/app/admin/customers/actions";
import { listInvoices } from "@/app/admin/invoices/actions";
import { listQuotations } from "@/app/admin/quotations/actions";

export type AdminDashboardMetric = {
  label: string;
  value: string;
  hint: string;
  href: string;
  tone?: "default" | "amber" | "emerald";
};

export type AdminDashboardActivity = {
  id: string;
  type: "quotation" | "invoice";
  number: string;
  workTitle: string | null;
  customerName: string;
  amount: number;
  status: string;
  date: string;
  createdAt: string;
  href: string;
};

export type AdminDashboardChange = {
  label: string;
  current: number;
  previous: number;
  format: "count" | "currency";
};

export type AdminDashboardWeekPoint = {
  label: string;
  quotes: number;
  invoices: number;
};

export type AdminDashboardData = {
  greeting: string;
  metrics: AdminDashboardMetric[];
  recentActivity: AdminDashboardActivity[];
  totals: {
    quoted: number;
    invoiced: number;
    received: number;
    pending: number;
  };
  counts: {
    customers: number;
    quotations: number;
    invoices: number;
  };
  changes: AdminDashboardChange[];
  weeklyActivity: AdminDashboardWeekPoint[];
};

const RECENT_ACTIVITY_LIMIT = 10;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function countCreatedInRange<T extends { createdAt: string }>(
  items: T[],
  startMs: number,
  endMs: number,
) {
  return items.filter((item) => {
    const createdAt = new Date(item.createdAt).getTime();
    return createdAt >= startMs && createdAt < endMs;
  }).length;
}

function sumPaidInRange(
  invoices: Awaited<ReturnType<typeof listInvoices>>,
  startMs: number,
  endMs: number,
) {
  return invoices
    .filter((invoice) => {
      const createdAt = new Date(invoice.createdAt).getTime();
      return createdAt >= startMs && createdAt < endMs;
    })
    .reduce((sum, invoice) => sum + invoice.paidAmount, 0);
}

function buildWeeklyActivity(
  quotations: Awaited<ReturnType<typeof listQuotations>>,
  invoices: Awaited<ReturnType<typeof listInvoices>>,
): AdminDashboardWeekPoint[] {
  const now = new Date();
  const points: AdminDashboardWeekPoint[] = [];

  for (let index = 5; index >= 0; index -= 1) {
    const weekEnd = new Date(now);
    weekEnd.setHours(23, 59, 59, 999);
    weekEnd.setDate(weekEnd.getDate() - index * 7);

    const weekStart = new Date(weekEnd);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);

    const startMs = weekStart.getTime();
    const endMs = weekEnd.getTime() + 1;

    const label =
      index === 0
        ? "This week"
        : new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
          }).format(weekStart);

    points.push({
      label,
      quotes: countCreatedInRange(quotations, startMs, endMs),
      invoices: countCreatedInRange(invoices, startMs, endMs),
    });
  }

  return points;
}

function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [customers, quotations, invoices] = await Promise.all([
    listCustomers(),
    listQuotations(),
    listInvoices(),
  ]);

  const openQuoteCount = quotations.filter((quotation) =>
    ["created", "in_progress"].includes(quotation.status),
  ).length;

  const unpaidInvoiceCount = invoices.filter((invoice) =>
    ["unpaid", "partial"].includes(invoice.paymentStatus),
  ).length;

  const totalQuoted = quotations.reduce(
    (sum, quotation) => sum + quotation.grandTotal,
    0,
  );
  const totalInvoiced = invoices.reduce(
    (sum, invoice) => sum + invoice.grandTotal,
    0,
  );
  const totalReceived = invoices.reduce(
    (sum, invoice) => sum + invoice.paidAmount,
    0,
  );
  const totalPending = invoices.reduce(
    (sum, invoice) => sum + invoice.balanceAmount,
    0,
  );

  const recentActivity: AdminDashboardActivity[] = [
    ...quotations.map((quotation) => ({
      id: quotation.id,
      type: "quotation" as const,
      number: quotation.quotationNumber,
      workTitle: quotation.workTitle,
      customerName: quotation.customerName,
      amount: quotation.grandTotal,
      status: quotation.status,
      date: quotation.date,
      createdAt: quotation.createdAt,
      href: `/admin/quotations/${quotation.id}`,
    })),
    ...invoices.map((invoice) => ({
      id: invoice.id,
      type: "invoice" as const,
      number: invoice.invoiceNumber,
      workTitle: invoice.workTitle,
      customerName: invoice.customerName,
      amount: invoice.grandTotal,
      status: invoice.paymentStatus,
      date: invoice.invoiceDate,
      createdAt: invoice.createdAt,
      href: `/admin/invoices/${invoice.id}`,
    })),
  ]
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    )
    .slice(0, RECENT_ACTIVITY_LIMIT);

  const now = Date.now();
  const last30Start = now - THIRTY_DAYS_MS;
  const prev30Start = now - THIRTY_DAYS_MS * 2;

  return {
    greeting: getGreeting(),
    metrics: [
      {
        label: "Customers",
        value: String(customers.length),
        hint: "Active profiles",
        href: "/admin/customers",
      },
      {
        label: "Open quotes",
        value: String(openQuoteCount),
        hint: "Created or in progress",
        href: "/admin/quotations?filter=created",
      },
      {
        label: "Unpaid bills",
        value: String(unpaidInvoiceCount),
        hint: "Needs collection",
        href: "/admin/invoices?filter=unpaid",
        tone: unpaidInvoiceCount > 0 ? "amber" : "default",
      },
      {
        label: "Pending due",
        value: String(totalPending),
        hint: "Outstanding balance",
        href: "/admin/invoices?filter=unpaid",
        tone: totalPending > 0 ? "amber" : "default",
      },
    ],
    recentActivity,
    totals: {
      quoted: totalQuoted,
      invoiced: totalInvoiced,
      received: totalReceived,
      pending: totalPending,
    },
    counts: {
      customers: customers.length,
      quotations: quotations.length,
      invoices: invoices.length,
    },
    changes: [
      {
        label: "New quotes",
        current: countCreatedInRange(quotations, last30Start, now),
        previous: countCreatedInRange(quotations, prev30Start, last30Start),
        format: "count",
      },
      {
        label: "New invoices",
        current: countCreatedInRange(invoices, last30Start, now),
        previous: countCreatedInRange(invoices, prev30Start, last30Start),
        format: "count",
      },
      {
        label: "Cash received",
        current: sumPaidInRange(invoices, last30Start, now),
        previous: sumPaidInRange(invoices, prev30Start, last30Start),
        format: "currency",
      },
    ],
    weeklyActivity: buildWeeklyActivity(quotations, invoices),
  };
}