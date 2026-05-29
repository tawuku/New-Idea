"use client";

import { PageTree } from "@/components/docs/page-tree";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState, useTransition } from "react";

type WorkspaceBasic = { id: string; slug: string; name: string };

type DocsLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
};

export default function DocsLayout({ children, params }: DocsLayoutProps) {
  const { workspaceSlug } = use(params);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [workspace, setWorkspace] = useState<WorkspaceBasic | null>(null);

  const apiUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";

  useEffect(() => {
    fetch(`${apiUrl}/api/v1/workspaces/by-slug/${workspaceSlug}`, { credentials: "include" })
      .then((r) => (r.ok ? (r.json() as Promise<WorkspaceBasic>) : null))
      .then((ws) => {
        if (ws) setWorkspace(ws);
      })
      .catch(() => null);
  }, [apiUrl, workspaceSlug]);

  const handleCreatePage = useCallback(async () => {
    if (!workspace) return;

    const res = await fetch(`${apiUrl}/api/v1/${workspace.id}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: "Untitled" }),
    });
    if (!res.ok) return;
    const page = (await res.json()) as { id: string };

    startTransition(() => {
      router.push(`/${workspaceSlug}/docs/${page.id}`);
    });
  }, [workspace, apiUrl, workspaceSlug, router]);

  return (
    <div className="flex h-full overflow-hidden">
      <aside className="w-56 shrink-0 overflow-y-auto border-r border-neutral-200 py-3 dark:border-neutral-800">
        {workspace && (
          <PageTree
            workspaceId={workspace.id}
            workspaceSlug={workspaceSlug}
            activePageId={null}
            onCreatePage={() => void handleCreatePage()}
          />
        )}
      </aside>

      <main className={`flex-1 overflow-y-auto ${pending ? "opacity-60" : ""}`}>{children}</main>
    </div>
  );
}
