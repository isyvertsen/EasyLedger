import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import type { Role } from "@prisma/client";
import authConfig from "~/auth.config";

// Create Prisma client with pg adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // Must use JWT for Edge Runtime middleware compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 dager
  },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      // Call base jwt callback first
      const baseToken = await authConfig.callbacks?.jwt?.({ token, user, trigger, session } as any);

      if (user) {
        token.id = user.id;
        token.role = (user as any).role as Role;
      }

      return baseToken || token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-opprett Settings når ny bruker opprettes
      await prisma.settings.create({
        data: { userId: user.id },
      });
      console.log(`✅ Created user: ${user.email}`);
    },
  },
  debug: process.env.NODE_ENV === "development",
});
