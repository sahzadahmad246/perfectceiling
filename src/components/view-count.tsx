import { Eye } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatViewCount, formatViewLabel } from "@/lib/views";

type ViewCountProps = {
  count: number;
  className?: string;
  iconClassName?: string;
  variant?: "plain" | "on-image" | "chip";
};

export function ViewCount({
  count,
  className,
  iconClassName,
  variant = "plain",
}: ViewCountProps) {
  const label = formatViewLabel(count);
  const display = formatViewCount(count);

  return (
    <span
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1 tabular-nums",
        variant === "on-image" &&
          "rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm",
        variant === "chip" &&
          "rounded-full border border-border-soft bg-surface-muted/80 px-2 py-0.5 text-[11px] font-medium text-muted",
        variant === "plain" && "text-xs text-muted",
        className,
      )}
      title={label}
    >
      <Eye
        aria-hidden
        className={cn("shrink-0", iconClassName)}
        size={variant === "plain" ? 13 : 12}
        strokeWidth={2}
      />
      <span>{display}</span>
    </span>
  );
}
