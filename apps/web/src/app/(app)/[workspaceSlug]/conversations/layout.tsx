import { ChannelSidebar } from "@/components/conversations/channel-sidebar";

export default function ConversationsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}) {
  return (
    <div className="flex h-full">
      <ChannelSidebar paramsPromise={params} />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
