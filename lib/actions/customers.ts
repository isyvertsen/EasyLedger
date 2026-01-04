"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "~/lib/db";
import { revalidatePath } from "next/cache";
import { customerSchema } from "~/lib/validations/customer";
import { z } from "zod";

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

export async function getCustomers() {
  const userId = await getUserId();

  return prisma.customer.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function getCustomer(id: string) {
  const userId = await getUserId();

  return prisma.customer.findFirst({
    where: { id, userId },
  });
}

export async function createCustomer(data: z.infer<typeof customerSchema>) {
  const userId = await getUserId();
  const validated = customerSchema.parse(data);

  const customer = await prisma.customer.create({
    data: {
      ...validated,
      userId,
    },
  });

  revalidatePath("/kunder");
  return customer;
}

export async function updateCustomer(
  id: string,
  data: z.infer<typeof customerSchema>
) {
  const userId = await getUserId();
  const validated = customerSchema.parse(data);

  const customer = await prisma.customer.update({
    where: { id, userId },
    data: validated,
  });

  revalidatePath("/kunder");
  revalidatePath(`/kunder/${id}`);
  return customer;
}

export async function deleteCustomer(id: string) {
  const userId = await getUserId();

  await prisma.customer.delete({
    where: { id, userId },
  });

  revalidatePath("/kunder");
}
