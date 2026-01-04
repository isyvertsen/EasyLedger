"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "~/lib/db";

/**
 * Gets the internal user ID from database.
 * Auto-creates user if they don't exist (fallback for missing webhooks).
 */
export async function getUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Ikke autentisert");

  // Try to find existing user
  let user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  // If user doesn't exist, create them (fallback for webhook issues)
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("Kunne ikke hente brukerdata fra Clerk");

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = [clerkUser.firstName, clerkUser.lastName]
      .filter(Boolean)
      .join(" ");

    user = await prisma.user.create({
      data: {
        clerkId,
        email: email!,
        name: name || "Ukjent",
        image: clerkUser.imageUrl,
        settings: {
          create: {},
        },
      },
      select: { id: true },
    });

    console.log("✅ Auto-created user:", email);
  }

  return user.id;
}
