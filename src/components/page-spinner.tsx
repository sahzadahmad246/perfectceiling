import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type PageSpinnerProps = {
  label?: string;
  className?: string;
  size?: number;
};

export function PageSpinner({
  label = "Loading...",
  className,
  size = 28,
}: PageSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-muted",
        className,
      )}
    >
      <Loader2 aria-hidden className="animate-spin" size={size} />
      {label ? <p className="mt-3 text-sm">{label}</p> : null}
    </div>
  );
}