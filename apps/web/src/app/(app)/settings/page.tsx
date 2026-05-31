"use client";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-5 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-8">Settings</h1>

      <ProfileSection name={session.user.name} email={session.user.email} />

      <section className="mb-8">
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
          Account
        </h2>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50 mb-1">
              Email address
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{session.user.email}</p>
          </div>
          <hr className="border-neutral-100 dark:border-neutral-800" />
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50 mb-3">
              Sign out
            </p>
            <SignOutButton />
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfileSection({ name, email }: { name: string; email: string }) {
  const [displayName, setDisplayName] = useState(name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayName(name);
  }, [name]);

  const handleSave = async () => {
    if (!displayName.trim() || displayName.trim() === name) return;
    setSaving(true);
    setError(null);

    const { error: authError } = await authClient.updateUser({ name: displayName.trim() });

    setSaving(false);
    if (authError) {
      setError("Failed to update profile. Please try again.");
    } else {
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 2500);
    }
  };

  const initials = (displayName || email)[0]?.toUpperCase() ?? "?";

  return (
    <section className="mb-8">
      <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
        Profile
      </h2>
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-xl select-none shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{displayName || email}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{email}</p>
          </div>
        </div>

        <hr className="border-neutral-100 dark:border-neutral-800" />

        <div>
          <label
            htmlFor="display-name"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5"
          >
            Display name
          </label>
          <div className="flex gap-2">
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setSaved(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSave();
              }}
              maxLength={64}
              className={cn(
                "flex-1 rounded-lg border px-3 py-2 text-sm",
                "bg-white dark:bg-neutral-800",
                "text-neutral-900 dark:text-neutral-50",
                "outline-none transition-colors duration-[120ms]",
                "focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                "border-neutral-200 dark:border-neutral-700",
              )}
            />
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !displayName.trim() || displayName.trim() === name}
              className={cn(
                "shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium",
                "transition-colors duration-[120ms]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                saved
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                  : "bg-brand-600 hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-white",
              )}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : saved ? (
                <>
                  <Check className="size-4" aria-hidden />
                  Saved
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
          {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </section>
  );
}
