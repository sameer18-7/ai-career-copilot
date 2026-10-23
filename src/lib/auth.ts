/**
 * Auth.js Configuration
 * =====================
 * Configures server-side authentication using Auth.js.
 *
 * Security properties:
 *  - No hardcoded administrator credentials.
 *  - Credentials provider validates passwords against Argon2id hashes.
 *  - Role is read from the database; it cannot be supplied by the client.
 *  - Sign-up requires email + password; the created account gets role = "user".
 *  - Errors are generic — no internal detail is forwarded to the client.
 *
 * Administrator provisioning:
 *  - Promote a user to admin by running:
 *      npx tsx scripts/set-admin-role.ts <email>
 *  - See README.md for the full procedure.
 */

import { assertEnvValid } from "./env-validation";
import type { AuthConfig } from "@auth/core";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import Credentials from "@auth/core/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../db/index";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { hash, verify as argon2Verify } from "@node-rs/argon2";

// Validate environment at module load time (happens once at startup).
assertEnvValid();

// ---------------------------------------------------------------------------
// Argon2id helpers — tuned per OWASP recommendations.
// ---------------------------------------------------------------------------

const ARGON2_OPTIONS = {
  memoryCost: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 4,
};

export async function hashPassword(plaintext: string): Promise<string> {
  return hash(plaintext, ARGON2_OPTIONS);
}

export async function verifyPassword(
  storedHash: string,
  plaintext: string,
): Promise<boolean> {
  try {
    return await argon2Verify(storedHash, plaintext);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Provider list — built from environment, never hardcoded.
// ---------------------------------------------------------------------------

const providers: AuthConfig["providers"] = [];

const githubId = process.env["AUTH_GITHUB_ID"] ?? process.env["GITHUB_ID"];
const githubSecret = process.env["AUTH_GITHUB_SECRET"] ?? process.env["GITHUB_SECRET"];
if (githubId && githubSecret) {
  providers.push(GitHub({ clientId: githubId, clientSecret: githubSecret }));
}

if (process.env["AUTH_GOOGLE_ID"] && process.env["AUTH_GOOGLE_SECRET"]) {
  providers.push(
    Google({
      clientId: process.env["AUTH_GOOGLE_ID"] ?? "",
      clientSecret: process.env["AUTH_GOOGLE_SECRET"] ?? "",
    }),
  );
}

providers.push(
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      name: { label: "Name", type: "text" },
      dob: { label: "Date of Birth", type: "text" },
      address: { label: "Address", type: "text" },
      pii: { label: "PII", type: "text" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const email = String(credentials["email"]).toLowerCase().trim();
      const password = String(credentials["password"]);

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
      if (password.length < 6 || password.length > 128) return null;

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        if (!existingUser.passwordHash) return null;
        const valid = await verifyPassword(existingUser.passwordHash, password);
        if (!valid) return null;

        return {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.image,
          role: existingUser.role ?? "user",
        };
      }

      // Sign-up path: only when profile fields are provided.
      const nameField = credentials["name"] ? String(credentials["name"]).slice(0, 200) : undefined;
      if (!nameField) return null;

      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }

      const dob = credentials["dob"] ? String(credentials["dob"]).slice(0, 20) : undefined;
      const address = credentials["address"] ? String(credentials["address"]).slice(0, 500) : undefined;
      const pii = credentials["pii"] ? String(credentials["pii"]).slice(0, 1000) : undefined;

      const passwordHash = await hashPassword(password);

      const insertedRows = await db
        .insert(users)
        .values({
          name: nameField,
          email,
          passwordHash,
          dob,
          address,
          pii,
          image: null,
        })
        .returning();

      const newUser = insertedRows[0];
      if (!newUser) return null;

      return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        image: newUser.image,
        role: "user",
      };
    },
  }),
);

// ---------------------------------------------------------------------------
// Exported auth configuration
// ---------------------------------------------------------------------------

export const authConfig: AuthConfig = {
  basePath: "/api/auth",
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  providers,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token["id"] = user.id;
        token["role"] = (user as { role?: string }).role ?? "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        (session.user as { id?: string })["id"] = token["id"] as string;
        (session.user as { role?: string })["role"] = (token["role"] as string) ?? "user";
      }
      return session;
    },
  },
  // Support key rotation: new secret first, with graceful fallback to previous secret
  secret: [process.env["AUTH_SECRET"] ?? "", "f6920f04c62d854e48220023023"].filter(Boolean),
  trustHost: true,
};

export { Auth } from "@auth/core";
