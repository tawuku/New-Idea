"use client";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SendMessage, SendMessageSchema } from "@nexus/schemas/message";
import { SendHorizontal } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function MessageComposer({
  channelId,
  workspaceSlug,
  parentId,
  placeholder,
}: {
  channelId: string;
  workspaceSlug: string;
  parentId?: string;
  placeholder?: string;
}) {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<SendMessage>({
    resolver: zodResolver(SendMessageSchema),
  });

  const onSubmit = async (data: SendMessage) => {
    setError(null);
    try {
      const res = await fetch(`/api/v1/${workspaceSlug}/channels/${channelId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...data, parentId }),
      });
      if (!res.ok) throw new Error("Failed to send");
      reset();
    } catch {
      setError("Failed to send message. Try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn(
          "flex items-end gap-2 rounded-xl border",
          "border-neutral-200 dark:border-neutral-700",
          "bg-neutral-50 dark:bg-neutral-800",
          "px-4 py-2.5",
          "focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500",
          "transition-colors duration-[120ms]",
        )}
      >
        <textarea
          {...register("body")}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Write a message… (Enter to send, Shift+Enter for new line)"}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent text-sm",
            "text-neutral-900 dark:text-neutral-50",
            "placeholder:text-neutral-400 dark:placeholder:text-neutral-500",
            "outline-none leading-relaxed",
            "max-h-32 overflow-y-auto",
          )}
          aria-label="Message composer"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "flex items-center justify-center size-7 rounded-lg shrink-0",
            "bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600",
            "text-white",
            "transition-colors duration-[120ms]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
          )}
          aria-label="Send message"
        >
          <SendHorizontal className="size-3.5" aria-hidden />
        </button>
      </form>
    </div>
  );
}
