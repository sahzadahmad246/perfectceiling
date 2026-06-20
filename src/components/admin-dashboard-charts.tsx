import type {
  AdminDashboardChange,
  AdminDashboardWeekPoint,
} from "@/app/admin/actions";
import { CustomerSummaryCharts } from "@/components/customer-summary-charts";
import { formatCompactCurrency } from "@/lib/customers";

type AdminDashboardChartsProps = {
  totals: {
    quoted: number;
    invoiced: number;
    received: number;
    pending: number;
  };
  counts: {
    quotations: number;
    invoices: number;
  };
  changes: AdminDashboardChange[];
  weeklyActivity: AdminDashboardWeekPoint[];
};

function formatChange(current: number, previous: number) {
  if (current === 0 && previous === 0) {
    return { label: "0%", className: "text-muted" };
  }

  if (previous === 0) {
    return { label: "New", className: "text-emerald-700" };
  }

  const percent = Math.round(((current - previous) / previous) * 100);

  if (percent > 0) {
    return { label: `+${percent}%`, className: "text-emerald-700" };
  }

  if (percent < 0) {
    return { label: `${percent}%`, className: "text-rose-600" };
  }

  return { label: "0%", className: "text-muted" };
}

function formatChangeValue(change: AdminDashboardChange) {
  if (change.format === "currency") {
    return formatCompactCurrency(change.current);
  }

  return String(change.current);
}

function WeeklyTrendChart({ points }: { points: AdminDashboardWeekPoint[] }) {
  const maxValue = Math.max(
    ...points.flatMap((point) => [point.quotes, point.invoices]),
    1,
  );
  const chartHeight = 120;
  const groupWidth = 34;
  const gap = 44;

  return (
    <article className="rounded-2xl bg-surface-muted px-4 py-4">
      <h3 className="text-sm font-medium text-foreground">Weekly trend</h3>
      <p className="mt-1 text-xs text-muted">Quotes and invoices created per week</p>

      <svg
        aria-label="Weekly activity trend"
        className="mt-4 w-full"
        role="img"
        viewBox="0 0 280 150"
      >
        <line
          stroke="#e4e4e7"
          strokeWidth="1"
          x1="20"
          x2="270"
          y1={chartHeight}
          y2={chartHeight}
        />

        {points.map((point, index) => {
          const x = 24 + index * gap;
          const quoteHeight = Math.max((point.quotes / maxValue) * (chartHeight - 24), 4);
          const invoiceHeight = Math.max(
            (point.invoices / maxValue) * (chartHeight - 24),
            4,
          );

          return (
            <g key={point.label}>
              <rect
                fill="#a1a1aa"
                height={quoteHeight}
                rx="5"
                width={groupWidth / 2 - 2}
                x={x}
                y={chartHeight - quoteHeight}
              />
              <rect
                fill="#18181b"
                height={invoiceHeight}
                rx="5"
                width={groupWidth / 2 - 2}
                x={x + groupWidth / 2 + 2}
                y={chartHeight - invoiceHeight}
              />
              <text
                className="text-muted"
                fill="currentColor"
                fontSize="9"
                textAnchor="middle"
                x={x + groupWidth / 2}
                y={chartHeight + 14}
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-[#a1a1aa]" />
          Quotes
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm bg-[#18181b]" />
          Invoices
        </span>
      </div>
    </article>
  );
}

export function AdminDashboardCharts({
  totals,
  counts,
  changes,
  weeklyActivity,
}: AdminDashboardChartsProps) {
  return (
    <div className="space-y-3">
      <article className="rounded-2xl bg-surface-muted px-4 py-4">
        <h3 className="text-sm font-medium text-foreground">Last 30 days</h3>
        <p className="mt-1 text-xs text-muted">Compared to the previous 30 days</p>

        <div className="mt-4 space-y-3">
          {changes.map((change) => {
            const delta = formatChange(change.current, change.previous);

            return (
              <div
                className="flex items-center justify-between gap-3 text-sm"
                key={change.label}
              >
                <div>
                  <p className="text-muted">{change.label}</p>
                  <p className="mt-1 font-medium text-foreground">
                    {formatChangeValue(change)}
                  </p>
                </div>
                <span className={`text-xs font-semibold ${delta.className}`}>
                  {delta.label}
                </span>
              </div>
            );
          })}
        </div>
      </article>

      <WeeklyTrendChart points={weeklyActivity} />

      <CustomerSummaryCharts
        invoiceCount={counts.invoices}
        quotationCount={counts.quotations}
        totalInvoiced={totals.invoiced}
        totalPaid={totals.received}
        totalPending={totals.pending}
        totalQuoted={totals.quoted}
      />
    </div>
  );
}