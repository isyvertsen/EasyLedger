"use server";

import { auth } from "~/lib/auth";

/**
 * Gets the authenticated user ID from NextAuth session.
 * Throws error if user is not authenticated.
 */
export async function getUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Ikke autentisert");
  }

  return session.user.id;
}

/**
 * Gets the full user session.
 * Returns null if not authenticated.
 */
export async function getUserSession() {
  return await auth();
}
