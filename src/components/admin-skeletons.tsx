import type { ReactNode } from "react";

import { Skeleton } from "@/components/skeleton";

const FILTER_PILL_WIDTHS = [
  "w-10",
  "w-14",
  "w-[4.5rem]",
  "w-16",
  "w-[4.25rem]",
  "w-14",
  "w-16",
  "w-14",
];

function SearchFieldSkeleton() {
  return (
    <div className="relative mt-3">
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  );
}

function FilterPillsSkeleton({ count }: { count: number }) {
  return (
    <div className="mt-3 flex gap-2 overflow-hidden pb-1">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          className={`h-7 shrink-0 rounded-full ${FILTER_PILL_WIDTHS[index % FILTER_PILL_WIDTHS.length]}`}
          key={index}
        />
      ))}
    </div>
  );
}

function QuotationCardSkeleton() {
  return (
    <article className="relative overflow-hidden rounded-xl border border-border-soft bg-surface-raised">
      <div className="p-4 pb-3">
        <Skeleton className="absolute right-3 top-3 size-9 rounded-full" />
        <div className="pr-11">
          <Skeleton className="h-4 w-[78%]" />
          <Skeleton className="mt-2 h-4 w-[62%]" />
          <Skeleton className="mt-1 h-4 w-[84%]" />
        </div>
      </div>

      <div aria-hidden className="border-t border-dashed border-border-soft" />

      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-14" />
      </div>
    </article>
  );
}

function InvoiceCardSkeleton() {
  return <QuotationCardSkeleton />;
}

function CustomerCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-xl border border-border-soft bg-surface-raised">
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-4 w-[42%]" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="mt-2 h-4 w-[38%]" />
        <Skeleton className="mt-1 h-4 w-[72%]" />
      </div>

      <div aria-hidden className="border-t border-dashed border-border-soft" />

      <div className="relative flex items-center px-4 py-3">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="absolute left-1/2 h-3.5 w-20 -translate-x-1/2" />
        <Skeleton className="ml-auto h-4 w-16" />
      </div>
    </article>
  );
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-muted px-3 py-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-3 h-3 w-24" />
    </div>
  );
}

function QuickActionSkeleton() {
  return (
    <div className="rounded-xl border border-border-soft bg-surface-raised p-4">
      <Skeleton className="size-9 rounded-full" />
      <Skeleton className="mt-3 h-4 w-24" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-1 h-3 w-[82%]" />
    </div>
  );
}

function ChartCardSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="rounded-2xl bg-surface-muted px-4 py-4">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-2 h-3 w-40" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div className="flex items-center justify-between gap-3" key={index}>
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-[88%]" />
        <Skeleton className="mt-2 h-3 w-[46%]" />
        <div className="mt-2 flex gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

function ListCardsSkeleton({
  count = 4,
  Card = QuotationCardSkeleton,
}: {
  count?: number;
  Card?: typeof QuotationCardSkeleton;
}) {
  return (
    <div className="mt-5 space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} />
      ))}
    </div>
  );
}

export function QuotationsPageSkeleton() {
  return (
    <div aria-busy aria-label="Loading quotations">
      <SearchFieldSkeleton />
      <FilterPillsSkeleton count={8} />
      <ListCardsSkeleton Card={QuotationCardSkeleton} count={5} />
    </div>
  );
}

export function InvoicesPageSkeleton() {
  return (
    <div aria-busy aria-label="Loading invoices">
      <SearchFieldSkeleton />
      <FilterPillsSkeleton count={6} />
      <ListCardsSkeleton Card={InvoiceCardSkeleton} count={5} />
    </div>
  );
}

export function CustomersPageSkeleton() {
  return (
    <div aria-busy aria-label="Loading customers">
      <SearchFieldSkeleton />
      <FilterPillsSkeleton count={5} />
      <ListCardsSkeleton Card={CustomerCardSkeleton} count={5} />
    </div>
  );
}

function AdminDetailHeaderSkeleton({ withActions = false }: { withActions?: boolean }) {
  return (
    <div className="sticky top-0 z-20 -mx-4 bg-surface/90 backdrop-blur-xl sm:-mx-8">
      <header className="border-b border-border-soft px-4 py-2 sm:px-8">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex items-center">
            <Skeleton className="size-5 rounded-sm" />
          </div>
          <Skeleton className="mx-auto h-5 w-28" />
          <div className="flex justify-end">
            {withActions ? <Skeleton className="size-9 rounded-full" /> : null}
          </div>
        </div>
      </header>
      <div className="bg-surface/90 px-4 py-2 backdrop-blur-xl sm:px-8">
        <Skeleton className="h-3 w-44" />
      </div>
    </div>
  );
}

export function QuotationDetailHeaderSkeleton() {
  return <AdminDetailHeaderSkeleton withActions />;
}

export function InvoiceDetailHeaderSkeleton() {
  return <AdminDetailHeaderSkeleton withActions />;
}

export function CustomerDetailHeaderSkeleton() {
  return <AdminDetailHeaderSkeleton />;
}

const detailSectionClass =
  "mt-4 rounded-xl border border-border-soft bg-surface-raised/50 p-4";

function DetailTitleSkeleton({ withQuotationLink = false }: { withQuotationLink?: boolean }) {
  return (
    <section className="mt-5">
      <Skeleton className="h-6 w-[72%]" />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
        {withQuotationLink ? <Skeleton className="h-4 w-28" /> : null}
      </div>
      {withQuotationLink ? (
        <Skeleton className="mt-2 h-4 w-40" />
      ) : null}
    </section>
  );
}

function DetailSectionSkeleton({
  titleWidth = "w-24",
  children,
}: {
  titleWidth?: string;
  children: ReactNode;
}) {
  return (
    <section className={detailSectionClass}>
      <div className="flex items-center gap-2">
        <Skeleton className="size-4 rounded-sm" />
        <Skeleton className={`h-4 ${titleWidth}`} />
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function LabelValueSkeleton({ lines = 1 }: { lines?: number }) {
  return (
    <div>
      <Skeleton className="h-3 w-12" />
      <Skeleton className="mt-2 h-4 w-full max-w-[16rem]" />
      {lines > 1 ? <Skeleton className="mt-1 h-4 w-[82%]" /> : null}
    </div>
  );
}

function DetailDividerSkeleton() {
  return <div aria-hidden className="my-3 border-t border-dashed border-border-soft" />;
}

function WorkItemSkeleton({ withImages = false }: { withImages?: boolean }) {
  return (
    <div>
      <Skeleton className="h-4 w-[68%]" />
      <Skeleton className="mt-2 h-4 w-full" />
      <div className="mt-2 flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      {withImages ? (
        <div className="mt-3 flex gap-2">
          <Skeleton className="size-16 rounded-lg" />
          <Skeleton className="size-16 rounded-lg" />
        </div>
      ) : null}
    </div>
  );
}

function PricingSummarySkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index}>
          {index > 0 ? <DetailDividerSkeleton /> : null}
          <div className="flex items-center justify-between py-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TermsSkeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <li className="flex gap-3" key={index}>
          <Skeleton className="mt-2 size-1.5 shrink-0 rounded-full" />
          <Skeleton className="h-4 w-full" />
        </li>
      ))}
    </ul>
  );
}

export function QuotationDetailSkeleton() {
  return (
    <div aria-busy aria-label="Loading quotation">
      <DetailTitleSkeleton />

      <DetailSectionSkeleton titleWidth="w-20">
        <LabelValueSkeleton />
        <DetailDividerSkeleton />
        <LabelValueSkeleton />
        <DetailDividerSkeleton />
        <LabelValueSkeleton lines={2} />
      </DetailSectionSkeleton>

      <DetailSectionSkeleton titleWidth="w-24">
        <WorkItemSkeleton withImages />
        <DetailDividerSkeleton />
        <WorkItemSkeleton />
      </DetailSectionSkeleton>

      <DetailSectionSkeleton titleWidth="w-28">
        <PricingSummarySkeleton rows={3} />
      </DetailSectionSkeleton>

      <DetailSectionSkeleton titleWidth="w-28">
        <TermsSkeleton />
      </DetailSectionSkeleton>

      <DetailSectionSkeleton titleWidth="w-36">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-[92%]" />
        <Skeleton className="mt-2 h-4 w-[78%]" />
      </DetailSectionSkeleton>
    </div>
  );
}

export function InvoiceDetailSkeleton() {
  return (
    <div aria-busy aria-label="Loading invoice">
      <DetailTitleSkeleton withQuotationLink />

      <DetailSectionSkeleton titleWidth="w-28">
        <PricingSummarySkeleton rows={3} />
        <Skeleton className="mt-4 h-10 w-full rounded-full" />
      </DetailSectionSkeleton>

      <DetailSectionSkeleton titleWidth="w-20">
        <LabelValueSkeleton />
        <DetailDividerSkeleton />
        <LabelValueSkeleton />
        <DetailDividerSkeleton />
        <LabelValueSkeleton lines={2} />
      </DetailSectionSkeleton>

      <DetailSectionSkeleton titleWidth="w-24">
        <WorkItemSkeleton />
        <DetailDividerSkeleton />
        <WorkItemSkeleton />
      </DetailSectionSkeleton>

      <DetailSectionSkeleton titleWidth="w-28">
        <PricingSummarySkeleton rows={3} />
      </DetailSectionSkeleton>

      <DetailSectionSkeleton titleWidth="w-24">
        <TermsSkeleton />
      </DetailSectionSkeleton>

      <DetailSectionSkeleton titleWidth="w-36">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-[88%]" />
        <Skeleton className="mt-2 h-4 w-[70%]" />
      </DetailSectionSkeleton>
    </div>
  );
}

export function CustomerDetailSkeleton() {
  return (
    <div aria-busy aria-label="Loading customer">
      <section className="-mx-4 bg-surface-muted px-4 pt-4 sm:-mx-8 sm:px-8">
        <Skeleton className="size-16 rounded-full" />
        <Skeleton className="mt-3 h-6 w-40" />

        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-2">
            <Skeleton className="mt-0.5 size-4 shrink-0" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="mt-0.5 size-4 shrink-0" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="mt-0.5 size-4 shrink-0" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        <div className="mt-5 flex w-full">
          {["Summary", "Quotes", "Invoices", "History"].map((label) => (
            <div className="flex flex-1 justify-center py-2.5" key={label}>
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>

        <div aria-hidden className="border-b border-border-soft" />
      </section>

      <section className="mt-4">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <MetricCardSkeleton key={index} />
          ))}
        </div>

        <div className="mt-5 space-y-3">
          <ChartCardSkeleton lines={3} />
          <div className="rounded-2xl bg-surface-muted px-4 py-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-4 h-28 w-full rounded-xl" />
          </div>
          <ChartCardSkeleton lines={4} />
        </div>
      </section>
    </div>
  );
}

function ServiceCardSkeleton() {
  return (
    <article className="flex overflow-hidden rounded-2xl border border-border-soft bg-surface-raised">
      <Skeleton className="h-[6.25rem] w-[6.25rem] shrink-0 rounded-none" />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-[68%]" />
            <Skeleton className="size-8 shrink-0 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-[72%]" />
          <Skeleton className="h-5 w-12 shrink-0 rounded-full" />
        </div>
      </div>
    </article>
  );
}

function ProjectCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-border-soft bg-surface-raised">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-5 w-[78%]" />
          <Skeleton className="mt-2 h-4 w-32" />
          <Skeleton className="mt-2 h-4 w-full" />
        </div>
        <Skeleton className="size-8 shrink-0 rounded-full" />
      </div>
    </article>
  );
}

function BlogCardSkeleton() {
  return <ServiceCardSkeleton />;
}

function SettingsFieldSkeleton() {
  return (
    <div className="rounded-xl border border-border-soft bg-surface-raised/50 p-4">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 h-11 w-full rounded-md" />
    </div>
  );
}

export function ServicesPageSkeleton() {
  return (
    <div aria-busy aria-label="Loading services">
      <AdminDetailHeaderSkeleton withActions />
      <SearchFieldSkeleton />
      <ListCardsSkeleton Card={ServiceCardSkeleton} count={4} />
    </div>
  );
}

export function ProjectsPageSkeleton() {
  return (
    <div aria-busy aria-label="Loading projects">
      <AdminDetailHeaderSkeleton withActions />
      <SearchFieldSkeleton />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function BlogPageSkeleton() {
  return (
    <div aria-busy aria-label="Loading blog posts">
      <AdminDetailHeaderSkeleton withActions />
      <SearchFieldSkeleton />
      <ListCardsSkeleton Card={BlogCardSkeleton} count={4} />
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div aria-busy aria-label="Loading settings">
      <section className="mt-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-2 h-4 w-56" />
      </section>
      <div className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SettingsFieldSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}

export function AdminHomeSkeleton() {
  return (
    <div aria-busy aria-label="Loading dashboard">
      <section className="mt-3">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-2 h-4 w-52" />
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </section>

      <section className="mt-5 rounded-2xl bg-surface-muted px-4 py-4">
        <Skeleton className="h-4 w-32" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-3 w-14" />
              <Skeleton className="mt-2 h-4 w-16" />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <Skeleton className="h-4 w-24" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <QuickActionSkeleton key={index} />
          ))}
        </div>
      </section>

      <section className="mt-5 space-y-3">
        <ChartCardSkeleton lines={3} />
        <div className="rounded-2xl bg-surface-muted px-4 py-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-3 w-48" />
          <Skeleton className="mt-4 h-28 w-full rounded-xl" />
        </div>
        <ChartCardSkeleton lines={4} />
        <div className="rounded-2xl bg-surface-muted px-4 py-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-4 h-32 w-full rounded-xl" />
        </div>
      </section>

      <section className="mt-6">
        <Skeleton className="h-4 w-28" />

        <div className="mt-3 flex w-full border-b border-border-soft pb-px">
          {Array.from({ length: 3 }).map((_, index) => (
            <div className="flex flex-1 justify-center py-2" key={index}>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>

        <ul className="mt-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <li key={index}>
              {index > 0 ? (
                <div aria-hidden className="my-4 border-t border-border-soft" />
              ) : null}
              <ActivityItemSkeleton />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}