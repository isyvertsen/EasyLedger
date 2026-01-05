"use server";

import { getUserId } from "./user";
import { prisma } from "~/lib/db";
import { revalidatePath } from "next/cache";
import { supplierSchema } from "~/lib/validations/supplier";
import { z } from "zod";

export async function getSuppliers() {
  const userId = await getUserId();

  return prisma.supplier.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function getSupplier(id: string) {
  const userId = await getUserId();

  return prisma.supplier.findFirst({
    where: { id, userId },
  });
}

export async function createSupplier(data: z.infer<typeof supplierSchema>) {
  const userId = await getUserId();
  const validated = supplierSchema.parse(data);

  const supplier = await prisma.supplier.create({
    data: {
      ...validated,
      userId,
    },
  });

  revalidatePath("/leverandorer");
  return supplier;
}

export async function updateSupplier(
  id: string,
  data: z.infer<typeof supplierSchema>
) {
  const userId = await getUserId();
  const validated = supplierSchema.parse(data);

  const supplier = await prisma.supplier.update({
    where: { id, userId },
    data: validated,
  });

  revalidatePath("/leverandorer");
  revalidatePath(`/leverandorer/${id}`);
  return supplier;
}

export async function deleteSupplier(id: string) {
  const userId = await getUserId();

  await prisma.supplier.delete({
    where: { id, userId },
  });

  revalidatePath("/leverandorer");
}
