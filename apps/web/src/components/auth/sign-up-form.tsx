"use client";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SignUp, SignUpSchema } from "@nexus/schemas/auth";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUp>({
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit = async (data: SignUp) => {
    setError(null);
    try {
      await authClient.signUp.email({
        email: data.email,
        name: data.name,
        password: data.password ?? crypto.randomUUID(),
        callbackURL: "/workspace/create",
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
            htmlFor="name"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Full name
          </label>
          <input
            {...register("name")}
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
            className={cn(
              "w-full rounded-lg border px-3 py-2 text-sm",
              "bg-white dark:bg-neutral-800",
              "text-neutral-900 dark:text-neutral-50",
              "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
              "outline-none transition-colors duration-[120ms]",
              "focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
              errors.name
                ? "border-red-400 dark:border-red-500"
                : "border-neutral-200 dark:border-neutral-700",
            )}
          />
          {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Work email
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-brand-600 dark:text-brand-400 hover:underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-neutral-400 dark:text-neutral-500">
        By creating an account you agree to our{" "}
        <a href="/terms" className="hover:underline underline-offset-2">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="hover:underline underline-offset-2">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
