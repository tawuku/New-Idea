import { Hash } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Conversations" };

export default function ConversationsPage() {
  return (
    <div className="flex items-center justify-center h-full text-center p-8">
      <div>
        <div className="inline-flex items-center justify-center size-12 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4">
          <Hash className="size-5 text-neutral-400" aria-hidden />
        </div>
        <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-50 mb-1">
          Select a channel
        </h2>
        <p className="text-sm text-neutral-400 dark:text-neutral-500">
          Choose a channel from the sidebar to start messaging
        </p>
      </div>
    </div>
  );
}
