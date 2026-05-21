import { clsx } from "clsx";
import type { HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type Variant = "default" | "success" | "warning" | "danger" | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  default: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
  success: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
  warning: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
  danger: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
  info: "bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={twMerge(
        clsx(
          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
          variants[variant],
          className,
        ),
      )}
    >
      {children}
    </span>
  );
}
