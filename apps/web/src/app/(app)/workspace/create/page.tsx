import { CreateWorkspaceForm } from "@/components/workspace/create-workspace-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create workspace",
};

export default function CreateWorkspacePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-1">
            Create your workspace
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            A workspace is your team's shared home in Nexus.
          </p>
          <CreateWorkspaceForm />
        </div>
      </div>
    </div>
  );
}
