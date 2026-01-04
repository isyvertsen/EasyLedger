"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserId } from "./user";
import { prisma } from "~/lib/db";
import { revalidatePath } from "next/cache";
import { categorySchema } from "~/lib/validations/category";
import { z } from "zod";

export async function getCategories() {
  const userId = await getUserId();

  return prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function getCategory(id: string) {
  const userId = await getUserId();

  return prisma.category.findFirst({
    where: { id, userId },
  });
}

export async function createCategory(data: z.infer<typeof categorySchema>) {
  const userId = await getUserId();
  const validated = categorySchema.parse(data);

  const category = await prisma.category.create({
    data: {
      ...validated,
      userId,
    },
  });

  revalidatePath("/kategorier");
  return category;
}

export async function updateCategory(
  id: string,
  data: z.infer<typeof categorySchema>
) {
  const userId = await getUserId();
  const validated = categorySchema.parse(data);

  const category = await prisma.category.update({
    where: { id, userId },
    data: validated,
  });

  revalidatePath("/kategorier");
  revalidatePath(`/kategorier/${id}`);
  return category;
}

export async function deleteCategory(id: string) {
  const userId = await getUserId();

  await prisma.category.delete({
    where: { id, userId },
  });

  revalidatePath("/kategorier");
}
