"use client";

import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import type { MessageWithAuthor } from "@nexus/schemas/message";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { MessageComposer } from "./message-composer";

export function ThreadPanel({
  parentMessage,
  workspaceSlug,
  onClose,
}: {
  parentMessage: MessageWithAuthor;
  workspaceSlug: string;
  onClose: () => void;
}) {
  const [replies, setReplies] = useState<MessageWithAuthor[]>([]);

  useEffect(() => {
    fetch(
      `/api/v1/${workspaceSlug}/channels/${parentMessage.channelId}/messages?parentId=${parentMessage.id}`,
      { credentials: "include" },
    )
      .then((r) => r.json() as Promise<MessageWithAuthor[]>)
      .then((data) => setReplies(data))
      .catch(() => {});

    const socket = getSocket();

    socket.on("message:created", (payload) => {
      if (payload.parentId !== parentMessage.id) return;
      setReplies((prev) => [
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

    return () => {
      socket.off("message:created");
    };
  }, [parentMessage.id, parentMessage.channelId, workspaceSlug]);

  return (
    <aside className="w-80 shrink-0 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">Thread</span>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded p-0.5 transition-colors duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Close thread"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <ThreadMessage message={parentMessage} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {replies.length === 0 ? (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center py-4">
            No replies yet
          </p>
        ) : (
          replies.map((reply) => <ThreadMessage key={reply.id} message={reply} />)
        )}
      </div>

      <MessageComposer
        channelId={parentMessage.channelId}
        workspaceSlug={workspaceSlug}
        parentId={parentMessage.id}
        placeholder="Reply in thread…"
      />
    </aside>
  );
}

function ThreadMessage({ message }: { message: MessageWithAuthor }) {
  const time = new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(message.createdAt);

  return (
    <div className="flex gap-2.5">
      <div
        className="size-7 shrink-0 rounded-full bg-brand-100 dark:bg-brand-900/20 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-semibold select-none"
        aria-hidden
      >
        {message.author.name?.[0]?.toUpperCase() ?? "?"}
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <span className="text-xs font-medium text-neutral-900 dark:text-neutral-50">
            {message.author.name}
          </span>
          <time
            dateTime={message.createdAt.toISOString()}
            className="text-[10px] text-neutral-400 dark:text-neutral-500"
          >
            {time}
          </time>
        </div>
        <p
          className={cn(
            "text-sm text-neutral-700 dark:text-neutral-300 break-words leading-relaxed",
          )}
        >
          {message.body}
          {message.edited && (
            <span className="ml-1 text-[11px] text-neutral-400 dark:text-neutral-500">
              (edited)
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
