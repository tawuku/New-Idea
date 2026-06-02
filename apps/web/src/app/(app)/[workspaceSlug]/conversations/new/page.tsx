"use client";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateChannelSchema, type CreateChannel } from "@nexus/schemas/channel";
import { Hash, Lock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function NewChannelPage() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateChannel>({
    resolver: zodResolver(CreateChannelSchema),
    defaultValues: { type: "public" },
  });

  const channelType = watch("type");

  const onSubmit = async (data: CreateChannel) => {
    setError(null);
    try {
      const wsRes = await fetch(`/api/v1/workspaces/by-slug/${workspaceSlug}`, {
        credentials: "include",
      });
      if (!wsRes.ok) throw new Error("Workspace not found");
      const workspace = (await wsRes.json()) as { id: string };

      const res = await fetch(`/api/v1/${workspace.id}/channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { title?: string };
        throw new Error(body.title ?? "Failed to create channel");
      }

      const channel = (await res.json()) as { id: string };
      router.refresh();
      router.push(`/${workspaceSlug}/conversations/${channel.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            Create a channel
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Channels are where your team communicates.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              Channel name
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400 pointer-events-none" aria-hidden />
              <input
                {...register("name")}
                id="name"
                type="text"
                placeholder="e.g. marketing"
                autoFocus
                className={cn(
                  "w-full rounded-lg border pl-9 pr-3 py-2 text-sm",
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
            </div>
            {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name.message}</p>}
            <p className="mt-1 text-xs text-neutral-400">Lowercase letters, numbers, hyphens, underscores</p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
            >
              Description <span className="text-neutral-400 font-normal">(optional)</span>
            </label>
            <input
              {...register("description")}
              id="description"
              type="text"
              placeholder="What's this channel about?"
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-sm",
                "bg-white dark:bg-neutral-800",
                "text-neutral-900 dark:text-neutral-50",
                "placeholder:text-neutral-400",
                "outline-none transition-colors duration-[120ms]",
                "focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                "border-neutral-200 dark:border-neutral-700",
              )}
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Visibility
            </p>
            <div className="space-y-2">
              {(["public", "private"] as const).map((t) => (
                <label
                  key={t}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors duration-[120ms]",
                    channelType === t
                      ? "border-brand-500 bg-brand-50/40 dark:bg-brand-900/10"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600",
                  )}
                >
                  <input
                    type="radio"
                    value={t}
                    className="sr-only"
                    {...register("type")}
                    onChange={() => setValue("type", t)}
                  />
                  <span className="mt-0.5">
                    {t === "public" ? (
                      <Hash className="size-4 text-neutral-500" aria-hidden />
                    ) : (
                      <Lock className="size-4 text-neutral-500" aria-hidden />
                    )}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-neutral-900 dark:text-neutral-50 capitalize">
                      {t}
                    </span>
                    <span className="block text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {t === "public"
                        ? "Anyone in the workspace can join"
                        : "Only invited members can see this channel"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => router.back()}
              className={cn(
                "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium",
                "border border-neutral-200 dark:border-neutral-700",
                "text-neutral-700 dark:text-neutral-300",
                "hover:bg-neutral-50 dark:hover:bg-neutral-800",
                "transition-colors duration-[120ms]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium",
                "bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600",
                "text-white",
                "transition-colors duration-[120ms]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              )}
            >
              {isSubmitting ? "Creating…" : "Create channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
