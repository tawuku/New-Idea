import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export function Input({ error, label, id, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={twMerge(
          clsx(
            "w-full rounded-lg border px-3 py-2 text-sm",
            "bg-white dark:bg-neutral-800",
            "text-neutral-900 dark:text-neutral-50",
            "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
            "outline-none transition-colors duration-[120ms]",
            "focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-red-400 dark:border-red-500"
              : "border-neutral-200 dark:border-neutral-700",
            className,
          ),
        )}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
