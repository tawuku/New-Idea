import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }

  const apiUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";
  const cookieHeader = (await headers()).get("cookie") ?? "";

  try {
    const res = await fetch(`${apiUrl}/api/v1/workspaces`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (res.ok) {
      const workspaces = (await res.json()) as Array<{ slug: string }>;
      if (workspaces.length > 0 && workspaces[0]) {
        redirect(`/${workspaces[0].slug}`);
      }
    }
  } catch {
    // fall through to create
  }

  redirect("/workspace/create");
}
