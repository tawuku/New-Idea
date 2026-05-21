import { MessageComposer } from "@/components/conversations/message-composer";
import { MessageFeed } from "@/components/conversations/message-feed";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Channel" };

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; channelId: string }>;
}) {
  const { workspaceSlug, channelId } = await params;

  return (
    <div className="flex flex-col h-full">
      <MessageFeed channelId={channelId} workspaceSlug={workspaceSlug} />
      <MessageComposer channelId={channelId} workspaceSlug={workspaceSlug} />
    </div>
  );
}
