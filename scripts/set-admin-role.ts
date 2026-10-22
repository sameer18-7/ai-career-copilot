/**
 * Secure Admin Provisioning Script
 * ==================================
 * Promotes an existing user account to the "admin" role.
 *
 * Usage:
 *   npx tsx scripts/set-admin-role.ts <email>
 *
 * This script must be run by an authorized operator with database access.
 * It requires the DATABASE_URL environment variable to be set.
 *
 * IMPORTANT:
 *   - This script is NOT a public API endpoint.
 *   - It must never be exposed to or callable by end users.
 *   - Run it manually from the server or a trusted CI environment only.
 *
 * Admin recovery:
 *   If all admin accounts are lost, an authorized operator can run this script
 *   against the production database to reinstate a known user as admin.
 *   The user must already exist in the database (i.e., have logged in before).
 */

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

// Load .env from project root if running locally
dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

const email = process.argv[2]?.trim().toLowerCase();

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: npx tsx scripts/set-admin-role.ts <email>");
  console.error("Example: npx tsx scripts/set-admin-role.ts alice@example.com");
  process.exit(1);
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("ERROR: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

// Inline schema reference to avoid circular imports with the auth module
import { users } from "../src/db/schema";

async function promoteToAdmin(targetEmail: string): Promise<void> {
  const sql = neon(dbUrl!);
  const db = drizzle(sql);

  console.log(`[set-admin] Looking up user: ${targetEmail}`);

  const [user] = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.email, targetEmail))
    .limit(1);

  if (!user) {
    console.error(
      `[set-admin] ERROR: No user found with email "${targetEmail}".`,
    );
    console.error(
      "  The user must sign up or log in at least once before being promoted.",
    );
    process.exit(1);
  }

  if (user.role === "admin") {
    console.log(`[set-admin] User ${targetEmail} is already an admin. No change made.`);
    process.exit(0);
  }

  await db
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.id, user.id));

  console.log(`[set-admin] SUCCESS: ${targetEmail} (id: ${user.id}) is now an admin.`);
  console.log("  The user must log out and log back in for the new role to take effect.");
}

promoteToAdmin(email).catch((err) => {
  console.error("[set-admin] Fatal error:", err.message);
  process.exit(1);
});
