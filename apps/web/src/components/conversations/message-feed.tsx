"use client";

import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import type { MessageWithAuthor } from "@nexus/schemas/message";
import { MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function MessageFeed({
  channelId,
  workspaceSlug,
  onThreadOpen,
}: {
  channelId: string;
  workspaceSlug: string;
  onThreadOpen?: (message: MessageWithAuthor) => void;
}) {
  const [messages, setMessages] = useState<MessageWithAuthor[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";
    fetch(`${apiUrl}/api/v1/${workspaceSlug}/channels/${channelId}/messages`, {
      credentials: "include",
    })
      .then((r) => r.json() as Promise<MessageWithAuthor[]>)
      .then((data) => setMessages(data))
      .catch(() => {});
  }, [channelId, workspaceSlug]);

  useEffect(() => {
    const socket = getSocket();
    socket.connect();
    socket.emit("channel:join", channelId);

    socket.on("message:created", (payload) => {
      if (payload.channelId !== channelId || payload.parentId) return;
      setMessages((prev) => [
        ...prev,
        {
          id: payload.id,
          channelId: payload.channelId,
          workspaceId: payload.workspaceId,
          userId: payload.userId,
          parentId: payload.parentId,
          body: payload.body,
          edited: false,
          createdAt: new Date(payload.createdAt),
          updatedAt: new Date(payload.createdAt),
          author: payload.author,
        },
      ]);
    });

    socket.on("message:edited", ({ id, body, updatedAt }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, body, edited: true, updatedAt: new Date(updatedAt) } : m,
        ),
      );
    });

    socket.on("message:deleted", ({ id }) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    });

    return () => {
      socket.emit("channel:leave", channelId);
      socket.off("message:created");
      socket.off("message:edited");
      socket.off("message:deleted");
    };
  }, [channelId]);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <p className="text-sm text-neutral-400 dark:text-neutral-500">
          No messages yet. Be the first to say something.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" role="log" aria-live="polite">
      {messages.map((msg, idx) => {
        const prevMsg = idx > 0 ? messages[idx - 1] : null;
        const grouped = prevMsg?.author.id === msg.author.id;

        return (
          <MessageBubble
            key={msg.id}
            message={msg}
            grouped={grouped}
            {...(onThreadOpen ? { onReply: () => onThreadOpen(msg) } : {})}
          />
        );
      })}
      <div ref={bottomRef} aria-hidden />
    </div>
  );
}

function MessageBubble({
  message,
  grouped,
  onReply,
}: {
  message: MessageWithAuthor;
  grouped: boolean;
  onReply?: () => void;
}) {
  const time = new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(message.createdAt);

  return (
    <div className={cn("flex gap-3 group relative", grouped ? "mt-0.5" : "mt-3")}>
      {grouped ? (
        <div className="w-8 shrink-0" />
      ) : (
        <div
          className="size-8 shrink-0 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-semibold select-none"
          aria-hidden
        >
          {message.author.name?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}
      <div className="min-w-0 flex-1">
        {!grouped && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
              {message.author.name}
            </span>
            <time
              dateTime={message.createdAt.toISOString()}
              className="text-[11px] text-neutral-400 dark:text-neutral-500"
            >
              {time}
            </time>
          </div>
        )}
        <p className="text-sm text-neutral-700 dark:text-neutral-300 break-words leading-relaxed">
          {message.body}
          {message.edited && (
            <span className="ml-1 text-[11px] text-neutral-400 dark:text-neutral-500">
              (edited)
            </span>
          )}
        </p>
      </div>

      {onReply && (
        <button
          type="button"
          onClick={onReply}
          className={cn(
            "absolute right-0 top-0 opacity-0 group-hover:opacity-100",
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs",
            "text-neutral-500 dark:text-neutral-400",
            "hover:bg-neutral-100 dark:hover:bg-neutral-800",
            "transition-all duration-[120ms]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          )}
          aria-label="Reply in thread"
        >
          <MessageSquare className="size-3.5" aria-hidden />
          <span>Reply</span>
        </button>
      )}
    </div>
  );
}
