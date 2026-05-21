import { config } from "dotenv";
import { getDb } from "../client.js";
import { users, workspaceMembers, workspaces } from "../schema/index.js";

config({ path: "../../../.env.local" });
config({ path: "../../../.env" });

async function seed(): Promise<void> {
  const db = getDb();

  console.log("Seeding database...");

  const [devUser] = await db
    .insert(users)
    .values({
      email: "dev@nexus.dev",
      name: "Dev User",
      emailVerified: true,
    })
    .onConflictDoNothing()
    .returning();

  if (!devUser) {
    console.log("Dev user already exists, skipping seed.");
    return;
  }

  const [devWorkspace] = await db
    .insert(workspaces)
    .values({
      name: "Nexus Dev",
      slug: "nexus-dev",
    })
    .returning();

  if (devWorkspace) {
    await db.insert(workspaceMembers).values({
      workspaceId: devWorkspace.id,
      userId: devUser.id,
      role: "owner",
    });
  }

  console.log("Seed complete.");
  console.log(`User: ${devUser.email}`);
  console.log(`Workspace: ${devWorkspace?.slug}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
