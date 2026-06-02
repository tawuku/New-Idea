"use client";

import { PageBreadcrumbs } from "@/components/docs/page-breadcrumbs";
import { PageEditor } from "@/components/docs/page-editor";
import { use, useCallback, useEffect, useState } from "react";

type PageData = {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
  workspaceId: string;
  slug: string;
};

export default function DocPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; pageId: string }>;
}) {
  const { workspaceSlug, pageId } = use(params);
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Resolve workspace id from slug
  useEffect(() => {
    fetch(`/api/v1/workspaces/by-slug/${workspaceSlug}`, { credentials: "include" })
      .then((r) => (r.ok ? (r.json() as Promise<{ id: string }>) : null))
      .then((ws) => {
        if (ws) setWorkspaceId(ws.id);
      })
      .catch(() => null);
  }, [workspaceSlug]);

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/v1/${workspaceId}/pages/${pageId}`, { credentials: "include" })
      .then((r) => (r.ok ? (r.json() as Promise<PageData>) : null))
      .then((p) => {
        setPage(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [workspaceId, pageId]);

  const handleTitleChange = useCallback(
    async (title: string) => {
      if (!page || !workspaceId) return;
      const res = await fetch(`/api/v1/${workspaceId}/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const updated = (await res.json()) as PageData;
        setPage(updated);
      }
    },
    [page, workspaceId, pageId],
  );

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-neutral-400">Loading…</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-neutral-500">Page not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-8 pt-6 pb-2">
        <PageBreadcrumbs
          workspaceSlug={workspaceSlug}
          crumbs={[{ id: page.id, title: page.title, slug: page.slug }]}
        />
      </header>
      <PageEditor
        pageId={pageId}
        initialTitle={page.title}
        onTitleChange={(t) => void handleTitleChange(t)}
      />
    </div>
  );
}
