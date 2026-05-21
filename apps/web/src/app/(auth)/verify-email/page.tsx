import { MailCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Check your email",
};

export default function VerifyEmailPage() {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm text-center">
      <div className="inline-flex items-center justify-center size-12 rounded-full bg-brand-50 dark:bg-brand-900/20 mb-4">
        <MailCheck className="size-6 text-brand-600 dark:text-brand-400" aria-hidden />
      </div>
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
        Check your email
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        We sent you a magic link. Click it to sign in — no password needed.
      </p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        Wrong email?{" "}
        <Link
          href="/sign-in"
          className="text-brand-600 dark:text-brand-400 hover:underline underline-offset-2"
        >
          Go back
        </Link>
      </p>
    </div>
  );
}
