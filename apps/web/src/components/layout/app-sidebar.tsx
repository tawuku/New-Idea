"use client";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  CheckSquare,
  FileText,
  Layers,
  MessageSquare,
  Search,
  Settings,
  Video,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  segment: string;
  icon: typeof MessageSquare;
  available: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Conversations", segment: "conversations", icon: MessageSquare, available: true },
  { label: "Docs", segment: "docs", icon: FileText, available: true },
  { label: "Work", segment: "work", icon: CheckSquare, available: false },
  { label: "Meet", segment: "meet", icon: Video, available: false },
  { label: "Hub", segment: "hub", icon: Layers, available: false },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Extract workspace slug from pathname: /[workspaceSlug]/...
  const workspaceSlug = pathname.split("/")[1] ?? "";

  return (
    <aside className="flex flex-col w-14 h-full border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
      <div className="flex items-center justify-center h-14 border-b border-neutral-200 dark:border-neutral-800">
        <NexusIcon />
      </div>

      <button
        type="button"
        className="flex items-center justify-center h-10 mx-2 mt-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-[120ms]"
        aria-label="Search (Cmd+K)"
        title="Search (⌘K)"
      >
        <Search className="size-4" aria-hidden />
      </button>

      <nav
        className="flex-1 flex flex-col items-center gap-1 py-2 px-2"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => {
          const href = workspaceSlug ? `/${workspaceSlug}/${item.segment}` : "#";
          const isActive = pathname.startsWith(`/${workspaceSlug}/${item.segment}`);
          const Icon = item.icon;
          return (
            <Link
              key={item.segment}
              href={item.available && workspaceSlug ? href : "#"}
              title={item.available ? item.label : `${item.label} (coming soon)`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg",
                "transition-colors duration-[120ms]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                isActive
                  ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                !item.available && "opacity-40 cursor-not-allowed",
              )}
            >
              <Icon className="size-4" aria-hidden />
            </Link>
          );
        })}
      </nav>

      <div className="pb-3 px-2 flex flex-col items-center gap-1">
        {session?.user.id && <NotificationBell userId={session.user.id} />}
        <Link
          href="/settings"
          title="Settings"
          aria-label="Settings"
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg",
            "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50",
            "hover:bg-neutral-100 dark:hover:bg-neutral-800",
            "transition-colors duration-[120ms]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          )}
        >
          <Settings className="size-4" aria-hidden />
        </Link>
      </div>
    </aside>
  );
}

function NexusIcon() {
  return (
    <div
      className="size-7 rounded-md bg-brand-600 dark:bg-brand-500 flex items-center justify-center"
      aria-label="Nexus"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path d="M3 9L9 3L15 9L9 15L3 9Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 3L9 15" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
