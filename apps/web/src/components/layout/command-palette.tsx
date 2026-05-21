"use client";

import { cn } from "@/lib/utils";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
        <Command>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <Search className="size-4 text-neutral-400 shrink-0" aria-hidden />
            <Command.Input
              placeholder="Search or type a command..."
              className={cn(
                "flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-50",
                "placeholder:text-neutral-400 outline-none",
              )}
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-neutral-200 dark:border-neutral-700 px-1.5 py-0.5 text-[10px] text-neutral-400">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto py-2">
            <Command.Empty className="py-6 text-center text-sm text-neutral-400">
              No results
            </Command.Empty>

            <Command.Group
              heading="Navigation"
              className="px-2 pb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-neutral-400 [&_[cmdk-group-heading]]:font-medium"
            >
              <CommandItem
                label="Go to Conversations"
                shortcut="G C"
                onSelect={(_v) => setOpen(false)}
              />
              <CommandItem label="Go to Docs" shortcut="G D" onSelect={(_v) => setOpen(false)} />
              <CommandItem label="Go to Work" shortcut="G W" onSelect={(_v) => setOpen(false)} />
              <CommandItem
                label="Go to Settings"
                shortcut="G S"
                onSelect={(_v) => setOpen(false)}
              />
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </dialog>
  );
}

function CommandItem({
  label,
  shortcut,
  onSelect,
}: {
  label: string;
  shortcut?: string;
  onSelect?: (value: string) => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect ?? ((_v: string) => undefined)}
      className={cn(
        "flex items-center justify-between gap-2",
        "mx-1 rounded-lg px-3 py-2 text-sm",
        "text-neutral-700 dark:text-neutral-300",
        "cursor-pointer select-none",
        "data-[selected=true]:bg-neutral-100 dark:data-[selected=true]:bg-neutral-800",
        "data-[selected=true]:text-neutral-900 dark:data-[selected=true]:text-neutral-50",
        "transition-colors duration-[80ms]",
      )}
    >
      <span>{label}</span>
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
