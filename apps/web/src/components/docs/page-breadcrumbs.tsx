"use client";

import Link from "next/link";

type Crumb = {
  id: string;
  title: string;
  slug: string;
};

type PageBreadcrumbsProps = {
  workspaceSlug: string;
  crumbs: Crumb[];
};

export function PageBreadcrumbs({ workspaceSlug, crumbs }: PageBreadcrumbsProps) {
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Page breadcrumbs">
      <ol className="flex items-center gap-1 text-sm text-neutral-500">
        <li>
          <Link
            href={`/${workspaceSlug}/docs`}
            className="hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Docs
          </Link>
        </li>
        {crumbs.map((crumb, i) => (
          <li key={crumb.id} className="flex items-center gap-1">
            <span>/</span>
            {i < crumbs.length - 1 ? (
              <Link
                href={`/${workspaceSlug}/docs/${crumb.id}`}
                className="hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                {crumb.title || "Untitled"}
              </Link>
            ) : (
              <span className="text-neutral-900 dark:text-neutral-100">
                {crumb.title || "Untitled"}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
