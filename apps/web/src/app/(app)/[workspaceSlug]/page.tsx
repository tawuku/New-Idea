import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

type Props = { params: Promise<{ workspaceSlug: string }> };

export default async function WorkspaceHomePage({ params }: Props) {
  const { workspaceSlug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const tiles = [
    {
      href: `/${workspaceSlug}/conversations`,
      label: "Conversations",
      description: "Channels, DMs, and threads for your team",
      icon: "💬",
    },
    {
      href: `/${workspaceSlug}/docs`,
      label: "Docs",
      description: "Collaborative documents and wikis",
      icon: "📄",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
      <div className="text-center max-w-lg">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
          Welcome back, {session.user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Pick up where you left off in{" "}
          <span className="font-medium text-neutral-700 dark:text-neutral-300">{workspaceSlug}</span>
          .
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-sm transition-all duration-[120ms]"
          >
            <div className="text-2xl mb-3">{tile.icon}</div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
              {tile.label}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{tile.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
