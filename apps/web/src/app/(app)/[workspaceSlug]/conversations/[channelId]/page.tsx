"use client";

import { MessageComposer } from "@/components/conversations/message-composer";
import { MessageFeed } from "@/components/conversations/message-feed";
import { ThreadPanel } from "@/components/conversations/thread-panel";
import type { MessageWithAuthor } from "@nexus/schemas/message";
import { use, useState } from "react";

export default function ChannelPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; channelId: string }>;
}) {
  const { workspaceSlug, channelId } = use(params);
  const [threadMessage, setThreadMessage] = useState<MessageWithAuthor | null>(null);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-col flex-1 min-w-0">
        <MessageFeed
          channelId={channelId}
          workspaceSlug={workspaceSlug}
          onThreadOpen={setThreadMessage}
        />
        <MessageComposer channelId={channelId} workspaceSlug={workspaceSlug} />
      </div>

      {threadMessage && (
        <ThreadPanel
          parentMessage={threadMessage}
          workspaceSlug={workspaceSlug}
          onClose={() => setThreadMessage(null)}
        />
      )}
    </div>
  );
}
