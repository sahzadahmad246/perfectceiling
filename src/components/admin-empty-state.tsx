import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type AdminEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  text: string;
  actionHref?: string;
  actionLabel?: string;
};

export function AdminEmptyState({
  icon: Icon,
  title,
  text,
  actionHref,
  actionLabel,
}: AdminEmptyStateProps) {
  return (
    <section className="mt-8 rounded-md border border-border-soft bg-surface-raised/60 p-6">
      <div className="flex size-11 items-center justify-center rounded-full border border-border-strong text-muted">
        <Icon size={19} />
      </div>
      <h2 className="mt-5 text-2xl font-medium">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted">{text}</p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-6 inline-flex h-10 items-center rounded-full border border-border-strong px-5 text-sm font-medium transition hover:border-primary"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}
