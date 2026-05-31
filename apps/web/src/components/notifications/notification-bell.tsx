"use client";

import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const apiUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    fetch(`${apiUrl}/api/v1/notifications`, { credentials: "include" })
      .then((r) => r.json() as Promise<Notification[]>)
      .then((data) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => {});

    const socket = getSocket();
    socket.connect();
    socket.emit("user:join", userId);

    socket.on("notification:new", (payload) => {
      setNotifications((prev) => [
        {
          id: payload.id,
          type: payload.type,
          title: payload.title,
          body: payload.body,
          read: false,
          createdAt: payload.createdAt,
        },
        ...prev,
      ]);
    });

    return () => {
      socket.off("notification:new");
    };
  }, [userId, apiUrl]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markAllRead = async () => {
    await fetch(`${apiUrl}/api/v1/notifications/read-all`, {
      method: "PATCH",
      credentials: "include",
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    await fetch(`${apiUrl}/api/v1/notifications/${id}/read`, {
      method: "PATCH",
      credentials: "include",
    });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative flex items-center justify-center size-8 rounded-lg",
          "text-neutral-500 dark:text-neutral-400",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",
          "transition-colors duration-[120ms]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="size-4" aria-hidden />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
            aria-hidden
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <dialog
          open
          className={cn(
            "absolute right-0 top-full mt-2 w-80 z-50 p-0 m-0",
            "rounded-xl border border-neutral-200 dark:border-neutral-700",
            "bg-white dark:bg-neutral-900 shadow-lg",
            "overflow-hidden",
          )}
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline focus-visible:outline-none"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-8">
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-neutral-50 dark:border-neutral-800",
                    "hover:bg-neutral-50 dark:hover:bg-neutral-800",
                    "transition-colors duration-[120ms]",
                    "focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-brand-500",
                    !n.read && "bg-brand-50/40 dark:bg-brand-900/10",
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span
                        className="mt-1.5 size-2 rounded-full bg-brand-500 shrink-0"
                        aria-hidden
                      />
                    )}
                    <div className={cn("min-w-0", n.read && "pl-4")}>
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50 truncate">
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
                          {n.body}
                        </p>
                      )}
                      <time className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 block">
                        {new Intl.DateTimeFormat("en", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(n.createdAt))}
                      </time>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </dialog>
      )}
    </div>
  );
}
