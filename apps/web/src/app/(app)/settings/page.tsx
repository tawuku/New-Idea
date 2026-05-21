import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-6">Settings</h1>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
          Profile
        </h2>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-medium text-lg">
              U
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">Your Name</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">you@company.com</p>
            </div>
          </div>
          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Profile editing — coming in Phase 1
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
          Workspace
        </h2>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Workspace settings — coming in Phase 1
          </p>
        </div>
      </section>
    </div>
  );
}
