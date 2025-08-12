import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm shadow-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-1",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };


