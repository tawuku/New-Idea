import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-6">Settings</h1>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
          Profile
        </h2>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-lg select-none">
              {session.user.name?.[0]?.toUpperCase() ?? session.user.email[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                {session.user.name}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{session.user.email}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
          Workspace
        </h2>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Workspace settings — coming in Phase 1
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
          Account
        </h2>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
