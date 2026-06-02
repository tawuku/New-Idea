"use client";

import { generateSlug } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { type CreateWorkspace, CreateWorkspaceSchema } from "@nexus/schemas/workspace";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateWorkspace>({
    resolver: zodResolver(CreateWorkspaceSchema),
  });

  const nameValue = watch("name");

  useEffect(() => {
    if (nameValue) {
      setValue("slug", generateSlug(nameValue), { shouldValidate: false });
    }
  }, [nameValue, setValue]);

  const onSubmit = async (data: CreateWorkspace) => {
    setError(null);
    try {
      const res = await fetch("/api/v1/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { title?: string }).title ?? "Failed to create workspace");
      }

      const workspace = (await res.json()) as { slug: string };
      router.push(`/${workspace.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
        >
          Workspace name
        </label>
        <input
          {...register("name")}
          id="name"
          type="text"
          placeholder="Acme Corp"
          className={cn(
            "w-full rounded-lg border px-3 py-2 text-sm",
            "bg-white dark:bg-neutral-800",
            "text-neutral-900 dark:text-neutral-50",
            "placeholder:text-neutral-400",
            "outline-none transition-colors duration-[120ms]",
            "focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
            errors.name
              ? "border-red-400 dark:border-red-500"
              : "border-neutral-200 dark:border-neutral-700",
          )}
        />
        {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label
          htmlFor="slug"
          className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
        >
          URL
        </label>
        <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500">
          <span className="flex items-center px-3 bg-neutral-50 dark:bg-neutral-800 text-neutral-400 text-sm border-r border-neutral-200 dark:border-neutral-700 select-none">
            nexus.dev/
          </span>
          <input
            {...register("slug")}
            id="slug"
            type="text"
            placeholder="acme-corp"
            className={cn(
              "flex-1 px-3 py-2 text-sm",
              "bg-white dark:bg-neutral-800",
              "text-neutral-900 dark:text-neutral-50",
              "outline-none",
            )}
          />
        </div>
        {errors.slug && <p className="mt-1.5 text-xs text-red-500">{errors.slug.message}</p>}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          "w-full flex items-center justify-center gap-2",
          "rounded-lg px-4 py-2.5 text-sm font-medium",
          "bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600",
          "text-white",
          "transition-colors duration-[120ms]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        )}
      >
        {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {isSubmitting ? "Creating..." : "Create workspace"}
      </button>
    </form>
  );
}
