"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "~/lib/db";
import { revalidatePath } from "next/cache";
import { settingsSchema } from "~/lib/validations/settings";
import { z } from "zod";

// KRITISK HELPER - Brukes i ALLE Server Actions
async function getUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Ikke autentisert");

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) throw new Error("Bruker ikke funnet");
  return user.id;
}

export async function getSettings() {
  const userId = await getUserId();

  let settings = await prisma.settings.findUnique({
    where: { userId },
  });

  // Auto-create settings if they don't exist
  if (!settings) {
    settings = await prisma.settings.create({
      data: { userId },
    });
  }

  return settings;
}

export async function updateSettings(data: z.infer<typeof settingsSchema>) {
  const userId = await getUserId();
  const validated = settingsSchema.parse(data);

  const settings = await prisma.settings.upsert({
    where: { userId },
    update: validated,
    create: {
      userId,
      ...validated,
    },
  });

  revalidatePath("/innstillinger");
  return settings;
}
