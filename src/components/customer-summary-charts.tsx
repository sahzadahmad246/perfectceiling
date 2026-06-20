import { formatCompactCurrency } from "@/lib/customers";

type CustomerSummaryChartsProps = {
  totalQuoted: number;
  totalInvoiced: number;
  totalPaid: number;
  totalPending: number;
  quotationCount: number;
  invoiceCount: number;
};

type ChartBar = {
  label: string;
  value: number;
  color: string;
};

function getMaxValue(values: number[]) {
  return Math.max(...values, 1);
}

function CustomerBarChart({
  title,
  bars,
}: {
  title: string;
  bars: ChartBar[];
}) {
  const maxValue = getMaxValue(bars.map((bar) => bar.value));
  const chartWidth = 280;
  const barHeight = 14;
  const gap = 22;

  return (
    <article className="rounded-2xl bg-surface-muted px-4 py-4">
      <h3 className="text-sm font-medium text-foreground">{title}</h3>

      <svg
        aria-label={title}
        className="mt-4 w-full"
        role="img"
        viewBox={`0 0 ${chartWidth} ${bars.length * gap + 8}`}
      >
        {bars.map((bar, index) => {
          const width = bar.value > 0 ? Math.max((bar.value / maxValue) * 210, 8) : 0;
          const y = index * gap + 4;

          return (
            <g key={bar.label}>
              <text
                fill="currentColor"
                className="text-muted"
                fontSize="10"
                x="0"
                y={y + 11}
              >
                {bar.label}
              </text>
              <rect
                fill={bar.color}
                height={barHeight}
                rx="7"
                width={width}
                x="72"
                y={y}
              />
              <text
                fill="currentColor"
                className="text-foreground"
                fontSize="10"
                fontWeight="600"
                textAnchor="end"
                x={chartWidth}
                y={y + 11}
              >
                {formatCompactCurrency(bar.value)}
              </text>
            </g>
          );
        })}
      </svg>
    </article>
  );
}

function CustomerDonutChart({
  paid,
  pending,
}: {
  paid: number;
  pending: number;
}) {
  const total = paid + pending;

  if (total <= 0) {
    return (
      <article className="rounded-2xl bg-surface-muted px-4 py-4">
        <h3 className="text-sm font-medium text-foreground">Payment split</h3>
        <p className="mt-4 text-sm text-muted">No invoice payments yet.</p>
      </article>
    );
  }

  const paidShare = paid / total;
  const size = 132;
  const stroke = 18;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const paidLength = circumference * paidShare;
  const pendingLength = circumference - paidLength;

  return (
    <article className="rounded-2xl bg-surface-muted px-4 py-4">
      <h3 className="text-sm font-medium text-foreground">Payment split</h3>

      <div className="mt-4 flex items-center gap-4">
        <svg
          aria-label="Payment split chart"
          height={size}
          role="img"
          viewBox={`0 0 ${size} ${size}`}
          width={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke="#e4e4e7"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="none"
            r={radius}
            stroke="#15803d"
            strokeDasharray={`${paidLength} ${pendingLength}`}
            strokeLinecap="round"
            strokeWidth={stroke}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          {pending > 0 ? (
            <circle
              cx={size / 2}
              cy={size / 2}
              fill="none"
              r={radius}
              stroke="#b45309"
              strokeDasharray={`${pendingLength} ${paidLength}`}
              strokeDashoffset={-paidLength}
              strokeLinecap="round"
              strokeWidth={stroke}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          ) : null}
          <text
            dominantBaseline="middle"
            fill="currentColor"
            fontSize="13"
            fontWeight="600"
            textAnchor="middle"
            x="50%"
            y="50%"
          >
            {Math.round(paidShare * 100)}%
          </text>
          <text
            dominantBaseline="middle"
            fill="currentColor"
            className="text-muted"
            fontSize="9"
            textAnchor="middle"
            x="50%"
            y="58%"
          >
            paid
          </text>
        </svg>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-emerald-700" />
              <span className="text-muted">Received</span>
            </div>
            <p className="mt-1 font-medium text-foreground">
              {formatCompactCurrency(paid)}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-amber-700" />
              <span className="text-muted">Pending</span>
            </div>
            <p className="mt-1 font-medium text-foreground">
              {formatCompactCurrency(pending)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function CustomerActivityChart({
  quotationCount,
  invoiceCount,
}: {
  quotationCount: number;
  invoiceCount: number;
}) {
  const maxCount = Math.max(quotationCount, invoiceCount, 1);
  const chartHeight = 120;
  const barWidth = 44;

  const bars = [
    { label: "Quotes", value: quotationCount, color: "#71717a" },
    { label: "Invoices", value: invoiceCount, color: "#18181b" },
  ];

  return (
    <article className="rounded-2xl bg-surface-muted px-4 py-4">
      <h3 className="text-sm font-medium text-foreground">Activity</h3>

      <svg
        aria-label="Customer activity chart"
        className="mt-4 w-full"
        role="img"
        viewBox="0 0 220 150"
      >
        <line
          stroke="#e4e4e7"
          strokeWidth="1"
          x1="24"
          x2="210"
          y1={chartHeight}
          y2={chartHeight}
        />

        {bars.map((bar, index) => {
          const height =
            bar.value > 0
              ? Math.max((bar.value / maxCount) * (chartHeight - 24), 12)
              : 4;
          const x = 56 + index * 72;

          return (
            <g key={bar.label}>
              <rect
                fill={bar.color}
                height={height}
                rx="8"
                width={barWidth}
                x={x}
                y={chartHeight - height}
              />
              <text
                fill="currentColor"
                className="text-foreground"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
                x={x + barWidth / 2}
                y={chartHeight - height - 8}
              >
                {bar.value}
              </text>
              <text
                fill="currentColor"
                className="text-muted"
                fontSize="10"
                textAnchor="middle"
                x={x + barWidth / 2}
                y={chartHeight + 16}
              >
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
    </article>
  );
}

export function CustomerSummaryCharts({
  totalQuoted,
  totalInvoiced,
  totalPaid,
  totalPending,
  quotationCount,
  invoiceCount,
}: CustomerSummaryChartsProps) {
  const financialBars: ChartBar[] = [
    { label: "Quoted", value: totalQuoted, color: "#a1a1aa" },
    { label: "Invoiced", value: totalInvoiced, color: "#71717a" },
    { label: "Received", value: totalPaid, color: "#15803d" },
    { label: "Pending", value: totalPending, color: "#b45309" },
  ];

  return (
    <div className="space-y-3">
      <CustomerBarChart bars={financialBars} title="Financial overview" />
      <CustomerDonutChart paid={totalPaid} pending={totalPending} />
      <CustomerActivityChart
        invoiceCount={invoiceCount}
        quotationCount={quotationCount}
      />
    </div>
  );
}