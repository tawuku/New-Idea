import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandPalette } from "@/components/layout/command-palette";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-dvh overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
      <CommandPalette />
    </div>
  );
}
