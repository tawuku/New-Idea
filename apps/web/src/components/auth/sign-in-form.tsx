"use client";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { type MagicLink, MagicLinkSchema } from "@nexus/schemas/auth";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MagicLink>({
    resolver: zodResolver(MagicLinkSchema),
  });

  const onSubmit = async (data: MagicLink) => {
    setError(null);
    try {
      await authClient.signIn.email({
        email: data.email,
        password: "magic-link-placeholder",
        callbackURL: "/",
      });
      router.push("/verify-email");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Email
          </label>
          <input
            {...register("email")}
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-sm",
              "bg-white dark:bg-neutral-800",
              "text-neutral-900 dark:text-neutral-50",
              "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "outline-none transition-colors duration-[120ms]",
              "focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
              errors.email
                ? "border-red-400 dark:border-red-500"
                : "border-neutral-200 dark:border-neutral-700",
            )}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full flex items-center justify-center gap-2",
            "rounded-lg px-4 py-2.5 text-sm font-medium",
            "bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600",
            "text-white",
            "transition-colors duration-[120ms]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
          )}
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
          {isSubmitting ? "Sending link..." : "Continue with email"}
        </button>
      </form>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
        <span className="text-xs text-neutral-400 dark:text-neutral-500">or</span>
        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
      </div>

      <div className="mt-4 space-y-2">
        <OAuthButton provider="google" label="Continue with Google" />
        <OAuthButton provider="microsoft" label="Continue with Microsoft" />
      </div>

      <p className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
        No account?{" "}
        <Link
          href="/sign-up"
          className="text-brand-600 dark:text-brand-400 hover:underline underline-offset-2"
        >
          Sign up free
        </Link>
      </p>
    </div>
  );
}

function OAuthButton({
  provider,
  label,
}: {
  provider: "google" | "microsoft";
  label: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await authClient.signIn.social({ provider, callbackURL: "/" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "w-full flex items-center justify-center gap-2",
        "rounded-lg border border-neutral-200 dark:border-neutral-700",
        "px-4 py-2.5 text-sm font-medium",
        "bg-white dark:bg-neutral-800",
        "text-neutral-700 dark:text-neutral-300",
        "hover:bg-neutral-50 dark:hover:bg-neutral-750",
        "transition-colors duration-[120ms]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
      )}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <OAuthIcon provider={provider} />
      )}
      {label}
    </button>
  );
}

function OAuthIcon({ provider }: { provider: "google" | "microsoft" }) {
  if (provider === "google") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
        <path
          d="M8.16 6.545v3.127h4.37c-.182.996-.728 1.836-1.545 2.4l2.49 1.935C14.836 12.6 16 10.473 16 8c0-.545-.055-1.09-.145-1.6H8.16z"
          fill="#4285F4"
        />
        <path
          d="M3.527 9.527l-.564.432-1.99 1.554C2.09 13.454 4.909 15.273 8.16 15.273c2.218 0 4.072-.727 5.435-1.964l-2.49-1.934c-.728.49-1.636.8-2.945.8-2.272 0-4.2-1.527-4.909-3.582l-.724.934z"
          fill="#34A853"
        />
        <path
          d="M.973 4.49A7.8 7.8 0 0 0 .727 8c0 1.236.218 2.436.727 3.51L3.527 9.48A4.65 4.65 0 0 1 3.273 8c0-.527.109-1.036.254-1.527L.973 4.49z"
          fill="#FBBC05"
        />
        <path
          d="M8.16.727c1.527 0 2.909.527 3.99 1.527L14.4 0C12.727-1.527 10.582 0 8.16 0 4.909 0 2.09 1.818.973 4.49l2.554 1.982C4.145 2.327 5.96.727 8.16.727z"
          fill="#EA4335"
        />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <path d="M0 0h7.5v7.5H0z" fill="#F1511B" />
      <path d="M8.5 0H16v7.5H8.5z" fill="#80CC28" />
      <path d="M0 8.5h7.5V16H0z" fill="#00ADEF" />
      <path d="M8.5 8.5H16V16H8.5z" fill="#FBBC09" />
    </svg>
  );
}
