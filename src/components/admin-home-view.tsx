"use client";

import {
  FileText,
  Loader2,
  ReceiptText,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type {
  AdminDashboardActivity,
  AdminDashboardData,
  AdminDashboardMetric,
} from "@/app/admin/actions";
import { AdminDashboardCharts } from "@/components/admin-dashboard-charts";
import { formatCompactCurrency } from "@/lib/customers";
import { getInvoicePaymentStatusStyle } from "@/lib/invoices";
import {
  formatQuotationDate,
  getQuotationStatusStyle,
} from "@/lib/quotations";

type AdminHomeViewProps = {
  data: AdminDashboardData;
};

type ActivityFilter = "all" | "quotation" | "invoice";

const ACTIVITY_FILTERS: Array<{ id: ActivityFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "quotation", label: "Quotes" },
  { id: "invoice", label: "Invoices" },
];

const quickActions = [
  {
    href: "/admin/quotations?create=1",
    title: "New quotation",
    text: "Create an estimate for a customer.",
    icon: FileText,
  },
  {
    href: "/admin/invoices?create=1",
    title: "New invoice",
    text: "Bill work and track payments.",
    icon: ReceiptText,
  },
  {
    href: "/admin/customers",
    title: "Customers",
    text: "View profiles, quotes, and history.",
    icon: Users,
  },
  {
    href: "/admin/settings",
    title: "Settings",
    text: "Business details and defaults.",
    icon: Settings,
  },
];

function metricValueClass(tone: AdminDashboardMetric["tone"]) {
  if (tone === "amber") {
    return "text-amber-700";
  }

  if (tone === "emerald") {
    return "text-emerald-700";
  }

  return "text-foreground";
}

function formatMetricValue(metric: AdminDashboardMetric) {
  if (metric.label === "Pending due") {
    return formatCompactCurrency(Number(metric.value));
  }

  return metric.value;
}

function ActivityStatus({ activity }: { activity: AdminDashboardActivity }) {
  const status =
    activity.type === "quotation"
      ? getQuotationStatusStyle(activity.status)
      : getInvoicePaymentStatusStyle(activity.status);

  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.className}`}
    >
      {status.label}
    </span>
  );
}

export function AdminHomeView({ data }: AdminHomeViewProps) {
  const {
    greeting,
    metrics,
    recentActivity,
    totals,
    counts,
    changes,
    weeklyActivity,
  } = data;
  const hasPending = totals.pending > 0;
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const [applyingFilter, setApplyingFilter] =
    useState<ActivityFilter | null>(null);

  const filteredActivity = useMemo(() => {
    if (activityFilter === "all") {
      return recentActivity;
    }

    return recentActivity.filter((activity) => activity.type === activityFilter);
  }, [activityFilter, recentActivity]);

  function handleFilterSelect(filter: ActivityFilter) {
    if (filter === activityFilter || applyingFilter !== null) {
      return;
    }

    setApplyingFilter(filter);
    setActivityFilter(filter);

    window.setTimeout(() => {
      setApplyingFilter(null);
    }, 200);
  }

  return (
    <>
      <section className="mt-3">
        <h2 className="font-primary text-xl font-medium text-foreground">
          {greeting}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Here&apos;s your business at a glance.
        </p>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <Link
            className="rounded-2xl bg-surface-muted px-3 py-4 transition hover:opacity-90"
            href={metric.href}
            key={metric.label}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
              {metric.label}
            </p>
            <p
              className={`mt-2 font-primary text-2xl font-semibold leading-none ${metricValueClass(metric.tone)}`}
            >
              {formatMetricValue(metric)}
            </p>
            <p className="mt-2 text-xs text-muted">{metric.hint}</p>
          </Link>
        ))}
      </section>

      <section className="mt-5 rounded-2xl bg-surface-muted px-4 py-4">
        <h3 className="text-sm font-medium text-foreground">Revenue snapshot</h3>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted">Quoted</p>
            <p className="mt-1 font-medium">{formatCompactCurrency(totals.quoted)}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Invoiced</p>
            <p className="mt-1 font-medium">
              {formatCompactCurrency(totals.invoiced)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Received</p>
            <p className="mt-1 font-medium text-emerald-700">
              {formatCompactCurrency(totals.received)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Pending</p>
            <p
              className={`mt-1 font-medium ${
                hasPending ? "text-amber-700" : "text-foreground"
              }`}
            >
              {formatCompactCurrency(totals.pending)}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-5">
        <h3 className="text-sm font-medium text-foreground">Quick actions</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                className="rounded-xl border border-border-soft bg-surface-raised p-4 transition hover:border-border-strong"
                href={action.href}
                key={action.href}
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-surface-muted text-muted">
                  <Icon size={17} />
                </div>
                <h4 className="mt-3 text-sm font-medium text-foreground">
                  {action.title}
                </h4>
                <p className="mt-1 text-xs leading-5 text-muted">{action.text}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-5">
        <AdminDashboardCharts
          changes={changes}
          counts={counts}
          totals={totals}
          weeklyActivity={weeklyActivity}
        />
      </section>

      <section className="mt-6">
        <h3 className="text-sm font-medium text-foreground">Recent activity</h3>

        <div className="mt-3 flex w-full">
          {ACTIVITY_FILTERS.map((option) => {
            const isActive = activityFilter === option.id;
            const isApplying = applyingFilter === option.id;

            return (
              <button
                aria-busy={isApplying}
                className={`flex-1 border-b-2 py-2 text-center text-sm font-medium transition disabled:opacity-70 ${
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
                disabled={applyingFilter !== null}
                key={option.id}
                onClick={() => handleFilterSelect(option.id)}
                type="button"
              >
                {isApplying ? (
                  <Loader2 className="mx-auto size-3.5 animate-spin" />
                ) : (
                  option.label
                )}
              </button>
            );
          })}
        </div>

        {filteredActivity.length > 0 ? (
          <ul className="mt-3">
            {filteredActivity.map((activity, index) => {
              const workTitle = activity.workTitle?.trim() || "Untitled work";

              return (
                <li key={`${activity.type}-${activity.id}`}>
                  {index > 0 ? (
                    <div aria-hidden className="my-4 border-t border-border-soft" />
                  ) : null}

                  <Link
                    className="block transition hover:opacity-80"
                    href={activity.href}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {workTitle}
                          <span className="font-normal text-muted">
                            {" "}
                            ({activity.number})
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {activity.customerName}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                          <span>{formatQuotationDate(activity.date)}</span>
                          <ActivityStatus activity={activity} />
                        </div>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-foreground">
                        {formatCompactCurrency(activity.amount)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-3 rounded-xl border border-border-soft bg-surface-raised/60 p-6 text-center">
            <p className="text-sm font-medium text-foreground">
              {activityFilter === "all"
                ? "No activity yet"
                : `No ${activityFilter === "quotation" ? "quotes" : "invoices"} in recent activity`}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {activityFilter === "all"
                ? "Create your first quotation to start tracking customers and payments."
                : "Try another filter or create a new record."}
            </p>
            {activityFilter === "all" ? (
              <Link
                className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary-hover"
                href="/admin/quotations?create=1"
              >
                Create quotation
              </Link>
            ) : null}
          </div>
        )}
      </section>
    </>
  );
}