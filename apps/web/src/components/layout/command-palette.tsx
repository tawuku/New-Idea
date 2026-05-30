"use client";

import { cn } from "@/lib/utils";
import { Command } from "cmdk";
import { FileText, MessageSquare, Search, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type SearchResult = {
  id: string;
  channelId: string;
  body: string;
  createdAt: string;
  authorName: string;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const workspaceSlug = pathname.split("/")[1] ?? "";
  const apiUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2 || !workspaceSlug) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${apiUrl}/api/v1/${workspaceSlug}/search?q=${encodeURIComponent(query)}&limit=8`,
          { credentials: "include" },
        );
        if (res.ok) setResults(await res.json() as SearchResult[]);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [query, workspaceSlug, apiUrl]);

  const navigate = (path: string) => {
    setOpen(false);
    setQuery("");
    router.push(path);
  };

  if (!open) return null;

  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-transparent p-0 m-0 max-w-none w-full h-full"
      aria-label="Command palette"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-[2px] cursor-default"
        onClick={() => setOpen(false)}
        tabIndex={-1}
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg",
          "rounded-xl border border-neutral-200 dark:border-neutral-700",
          "bg-white dark:bg-neutral-900 shadow-2xl",
          "overflow-hidden",
        )}
      >
        <Command shouldFilter={false}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <Search className="size-4 text-neutral-400 shrink-0" aria-hidden />
            <Command.Input
              placeholder="Search messages or type a command..."
              className={cn(
                "flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-50",
                "placeholder:text-neutral-400 outline-none",
              )}
              autoFocus
              value={query}
              onValueChange={setQuery}
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 text-[10px] text-neutral-400">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-96 overflow-y-auto py-2">
            <Command.Empty className="py-6 text-center text-sm text-neutral-400">
              {loading ? "Searching…" : query.length >= 2 ? "No results" : "Start typing to search"}
            </Command.Empty>

            {results.length > 0 && (
              <Command.Group
                heading="Messages"
                className="px-2 pb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-neutral-400 [&_[cmdk-group-heading]]:font-medium"
              >
                {results.map((r) => (
                  <Command.Item
                    key={r.id}
                    value={r.id}
                    onSelect={() =>
                      navigate(`/${workspaceSlug}/conversations/${r.channelId}`)
                    }
                    className={cn(
                      "flex flex-col items-start gap-0.5",
                      "mx-1 rounded-lg px-3 py-2 text-sm cursor-pointer select-none",
                      "data-[selected=true]:bg-neutral-100 dark:data-[selected=true]:bg-neutral-800",
                      "transition-colors duration-[80ms]",
                    )}
                  >
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      {r.authorName}
                    </span>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-1">
                      {r.body}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {!query && (
              <Command.Group
                heading="Navigation"
                className="px-2 pb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-neutral-400 [&_[cmdk-group-heading]]:font-medium"
              >
                <NavItem
                  label="Conversations"
                  icon={MessageSquare}
                  shortcut="G C"
                  onSelect={() => navigate(`/${workspaceSlug}/conversations`)}
                />
                <NavItem
                  label="Docs"
                  icon={FileText}
                  shortcut="G D"
                  onSelect={() => navigate(`/${workspaceSlug}/docs`)}
                />
                <NavItem
                  label="Settings"
                  icon={Settings}
                  shortcut="G S"
                  onSelect={() => navigate("/settings")}
                />
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </dialog>
  );
}

function NavItem({
  label,
  icon: Icon,
  shortcut,
  onSelect,
}: {
  label: string;
  icon: typeof MessageSquare;
  shortcut?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      value={label}
      onSelect={onSelect}
      className={cn(
        "flex items-center justify-between gap-2",
        "mx-1 rounded-lg px-3 py-2 text-sm cursor-pointer select-none",
        "text-neutral-700 dark:text-neutral-300",
        "data-[selected=true]:bg-neutral-100 dark:data-[selected=true]:bg-neutral-800",
        "data-[selected=true]:text-neutral-900 dark:data-[selected=true]:text-neutral-50",
        "transition-colors duration-[80ms]",
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-neutral-400" aria-hidden />
        <span>{label}</span>
      </div>
      {shortcut && (
        <div className="flex items-center gap-1">
          {shortcut.split(" ").map((key) => (
            <kbd
              key={key}
              className="inline-flex items-center justify-center rounded border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 text-[10px] text-neutral-400 min-w-[18px]"
            >
              {key}
            </kbd>
          ))}
        </div>
      )}
    </Command.Item>
  );
}
