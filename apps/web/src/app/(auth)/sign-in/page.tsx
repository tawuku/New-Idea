import { SignInForm } from "@/components/auth/sign-in-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function SignInPage() {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
        Welcome back
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
        Sign in to your Nexus workspace
      </p>
      <SignInForm />
    </div>
  );
}
