"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSocket } from "../../lib/socket";

type PageNode = {
  id: string;
  title: string;
  icon: string | null;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  children: PageNode[];
};

type FlatPage = Omit<PageNode, "children">;

function buildTree(pages: FlatPage[]): PageNode[] {
  const byId = new Map<string, PageNode>(pages.map((p) => [p.id, { ...p, children: [] }]));
  const roots: PageNode[] = [];

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sort = (nodes: PageNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
    for (const n of nodes) sort(n.children);
  };
  sort(roots);

  return roots;
}

type TreeNodeProps = {
  node: PageNode;
  depth: number;
  workspaceSlug: string;
  activePageId: string | null;
};

function TreeNode({ node, depth, workspaceSlug, activePageId }: TreeNodeProps) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const isActive = activePageId === node.id;

  const handleClick = useCallback(() => {
    router.push(`/${workspaceSlug}/docs/${node.id}`);
  }, [router, workspaceSlug, node.id]);

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        title={node.title || "Untitled"}
        style={{ paddingLeft: `${(depth + 1) * 12}px` }}
        className={[
          "flex w-full items-center gap-1.5 rounded py-0.5 pr-2 text-sm text-left transition-colors",
          isActive
            ? "bg-neutral-200 font-medium dark:bg-neutral-700"
            : "hover:bg-neutral-100 dark:hover:bg-neutral-800",
        ].join(" ")}
      >
        {node.children.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
            }}
            className="shrink-0 text-neutral-400 w-4 text-center"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? "▾" : "▸"}
          </button>
        )}
        {node.children.length === 0 && <span className="w-4 shrink-0" />}
        <span className="shrink-0">{node.icon ?? "📄"}</span>
        <span className="truncate">{node.title || "Untitled"}</span>
      </button>
      {open && node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              workspaceSlug={workspaceSlug}
              activePageId={activePageId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

type PageTreeProps = {
  workspaceId: string;
  workspaceSlug: string;
  activePageId: string | null;
  onCreatePage: () => void;
};

export function PageTree({
  workspaceId,
  workspaceSlug,
  activePageId,
  onCreatePage,
}: PageTreeProps) {
  const [pages, setPages] = useState<FlatPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/${workspaceId}/pages`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: FlatPage[]) => {
        setPages(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [workspaceId]);

  // Live updates via Socket.IO
  useEffect(() => {
    const socket = getSocket();

    const onCreated = (p: FlatPage) => setPages((prev) => [...prev, p]);
    const onUpdated = (p: FlatPage) =>
      setPages((prev) =>
        prev.map((existing) => (existing.id === p.id ? { ...existing, ...p } : existing)),
      );
    const onDeleted = ({ id }: { id: string; workspaceId: string }) =>
      setPages((prev) => prev.filter((p) => p.id !== id));

    socket.on("page:created", onCreated);
    socket.on("page:updated", onUpdated);
    socket.on("page:deleted", onDeleted);

    return () => {
      socket.off("page:created", onCreated);
      socket.off("page:updated", onUpdated);
      socket.off("page:deleted", onDeleted);
    };
  }, []);

  const tree = useMemo(() => buildTree(pages), [pages]);

  if (loading) {
    return <p className="px-4 py-2 text-sm text-neutral-400">Loading…</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Docs
        </span>
        <button
          type="button"
          onClick={onCreatePage}
          title="New page"
          className="rounded p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
        >
          +
        </button>
      </div>
      {tree.length === 0 ? (
        <p className="px-4 text-sm text-neutral-400">No pages yet.</p>
      ) : (
        <ul>
          {tree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              workspaceSlug={workspaceSlug}
              activePageId={activePageId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
