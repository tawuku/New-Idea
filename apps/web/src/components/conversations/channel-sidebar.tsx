import { cn } from "@/lib/utils";
import type { Channel } from "@nexus/schemas/channel";
import { Hash, Lock, Plus } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";

async function fetchChannels(workspaceSlug: string): Promise<Channel[]> {
  try {
    const cookie = (await headers()).get("cookie") ?? "";
    const wsRes = await fetch(
      `${process.env["API_URL"] ?? "http://localhost:3001"}/api/v1/workspaces/by-slug/${workspaceSlug}`,
      { headers: { cookie }, cache: "no-store" },
    );
    if (!wsRes.ok) return [];
    const workspace = (await wsRes.json()) as { id: string };

    const res = await fetch(
      `${process.env["API_URL"] ?? "http://localhost:3001"}/api/v1/${workspace.id}/channels`,
      { headers: { cookie }, cache: "no-store" },
    );
    if (!res.ok) return [];
    return (await res.json()) as Channel[];
  } catch {
    return [];
  }
}

export async function ChannelSidebar({
  paramsPromise,
}: {
  paramsPromise: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await paramsPromise;
  const channels = await fetchChannels(workspaceSlug);

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Channels
        </span>
        <Link
          href={`/${workspaceSlug}/conversations/new`}
          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors duration-[120ms] rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Create channel"
          title="Create channel"
        >
          <Plus className="size-3.5" aria-hidden />
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-1 px-2" aria-label="Channels">
        {channels.length === 0 ? (
          <p className="px-2 py-3 text-xs text-neutral-400 dark:text-neutral-500">
            No channels yet
          </p>
        ) : (
          channels.map((channel) => (
            <ChannelItem key={channel.id} channel={channel} workspaceSlug={workspaceSlug} />
          ))
        )}
      </nav>
    </aside>
  );
}

function ChannelItem({
  channel,
  workspaceSlug,
}: {
  channel: Channel;
  workspaceSlug: string;
}) {
  const Icon = channel.type === "private" ? Lock : Hash;

  return (
    <Link
      href={`/${workspaceSlug}/conversations/${channel.id}`}
      className={cn(
        "flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-sm",
        "text-neutral-600 dark:text-neutral-400",
        "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        "hover:text-neutral-900 dark:hover:text-neutral-50",
        "transition-colors duration-[120ms]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{channel.name ?? "unnamed"}</span>
    </Link>
  );
}
