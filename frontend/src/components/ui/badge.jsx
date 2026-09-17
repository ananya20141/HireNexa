import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-accent text-white shadow-warm-sm",
        secondary:
          "border-surface-border bg-bg text-text-secondary hover:bg-muted",
        destructive:
          "border-transparent bg-danger text-white",
        success:
          "border-[#D2E6D7] bg-[#EEF5F0] text-success",
        warning:
          "border-[#F5E2C4] bg-[#FDF7EE] text-warning",
        outline: "border-surface-border text-text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
