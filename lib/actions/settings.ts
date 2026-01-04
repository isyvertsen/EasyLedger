"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserId } from "./user";
import { prisma } from "~/lib/db";
import { revalidatePath } from "next/cache";
import { settingsSchema } from "~/lib/validations/settings";
import { z } from "zod";

// KRITISK HELPER - Brukes i ALLE Server Actions
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
