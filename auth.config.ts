import type { NextAuthConfig } from "next-auth";
// import AzureADProvider from "next-auth/providers/azure-ad";
import GoogleProvider from "next-auth/providers/google";

/**
 * Auth config without Prisma - Edge Runtime compatible
 * Used by middleware for session validation
 */
export default {
  providers: [
    // Azure AD - Disabled during Google setup
    // AzureADProvider({
    //   clientId: process.env.AZURE_AD_CLIENT_ID!,
    //   clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
    //   tenantId: process.env.AZURE_AD_TENANT_ID!,
    //   authorization: {
    //     params: {
    //       scope: "openid profile email",
    //     },
    //   },
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Allow linking to existing Clerk user
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid profile email",
        },
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt", // JWT for Edge Runtime compatibility
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnSignIn = nextUrl.pathname.startsWith("/sign-in");
      const isOnAuthAPI = nextUrl.pathname.startsWith("/api/auth");

      if (isOnAuthAPI) {
        return true; // Always allow auth API routes
      }

      if (!isLoggedIn && !isOnSignIn) {
        return false; // Redirect unauthenticated users to sign-in
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }

      // Update token when session is updated
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
  },
} satisfies NextAuthConfig;
