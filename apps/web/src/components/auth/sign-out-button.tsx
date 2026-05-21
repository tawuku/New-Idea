"use client";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await authClient.signOut();
    router.push("/sign-in");
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 text-sm font-medium",
        "text-red-600 dark:text-red-400",
        "hover:text-red-700 dark:hover:text-red-300",
        "transition-colors duration-[120ms]",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <LogOut className="size-4" aria-hidden />
      )}
      Sign out
    </button>
  );
}
