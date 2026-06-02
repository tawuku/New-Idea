import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AppHomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
          Welcome to Nexus
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          You're signed in as{" "}
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {session.user.email}
          </span>
          . Create a workspace to get started.
        </p>
        <Link
          href="/workspace/create"
          className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white transition-colors duration-[120ms]"
        >
          Create a workspace
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md mt-4">
        {PILLARS.map((pillar) => (
          <div
            key={pillar.label}
            className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 opacity-50"
          >
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">
              {pillar.label}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">{pillar.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const PILLARS = [
  { label: "Conversations", description: "Channels, DMs, threads — coming in Phase 1" },
  { label: "Workspaces", description: "Block-based docs + wikis — coming in Phase 2" },
  { label: "Work", description: "Tasks, projects, OKRs — coming in Phase 3" },
  { label: "Meet", description: "WebRTC video + AI summaries — coming in Phase 5" },
];
