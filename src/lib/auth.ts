import { Auth } from "@auth/core";
import type { AuthConfig } from "@auth/core";
import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import Credentials from "@auth/core/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "../db/index";

const providers: any[] = [
  GitHub({
    clientId: process.env.GITHUB_ID || process.env.AUTH_GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET || process.env.AUTH_GITHUB_SECRET,
  }),
];

if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  );
}

import { users } from "../db/schema";
import { eq } from "drizzle-orm";

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
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const email = String(credentials.email).toLowerCase().trim();
      const password = String(credentials.password);

      // Admin account for direct testing & administration
      if (
        (email === "admin@careercopilot.com" || email === "admin@example.com") &&
        password === "admin123"
      ) {
        return {
          id: "admin-user",
          name: "Admin User",
          email: "admin@careercopilot.com",
          role: "admin",
          image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        };
      }

      // If we are passing additional profile data (like on signup), store it in the DB
      const name = credentials.name ? String(credentials.name) : undefined;
      const dob = credentials.dob ? String(credentials.dob) : undefined;
      const address = credentials.address ? String(credentials.address) : undefined;
      const pii = credentials.pii ? String(credentials.pii) : undefined;

      // Check if user exists in the DB
      const existingUsers = await db.select().from(users).where(eq(users.email, email));
      let user = existingUsers[0];

      if (!user) {
        // Create user
        const newUsers = await db.insert(users).values({
          name: name || "Demo Candidate",
          email: email,
          dob,
          address,
          pii,
          image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        }).returning();
        user = newUsers[0];
      } else if (name || dob || address || pii) {
        // Update user if new details are provided
        const updatedUsers = await db.update(users).set({
          ...(name ? { name } : {}),
          ...(dob ? { dob } : {}),
          ...(address ? { address } : {}),
          ...(pii ? { pii } : {}),
        }).where(eq(users.id, user.id)).returning();
        user = updatedUsers[0];
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: "user",
        image: user.image,
      };
    },
  }),
);

export const authConfig: AuthConfig = {
  basePath: "/api/auth",
  adapter: DrizzleAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
};

export { Auth };
