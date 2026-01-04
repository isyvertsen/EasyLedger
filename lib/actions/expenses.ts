"use server";

import { auth } from "@clerk/nextjs/server";
import { getUserId } from "./user";
import { prisma } from "~/lib/db";
import { revalidatePath } from "next/cache";
import { expenseSchema } from "~/lib/validations/expense";
import { z } from "zod";

export async function getExpenses() {
  const userId = await getUserId();

  return prisma.expense.findMany({
    where: { userId },
    include: {
      supplier: true,
      category: true,
      attachments: true,
    },
    orderBy: { date: "desc" },
  });
}

export async function getExpense(id: string) {
  const userId = await getUserId();

  return prisma.expense.findFirst({
    where: { id, userId },
    include: {
      supplier: true,
      category: true,
      attachments: true,
    },
  });
}

export async function createExpense(data: z.infer<typeof expenseSchema>) {
  const userId = await getUserId();
  const validated = expenseSchema.parse(data);

  const expense = await prisma.expense.create({
    data: {
      ...validated,
      userId,
    },
  });

  revalidatePath("/utgifter");
  return expense;
}

export async function updateExpense(
  id: string,
  data: z.infer<typeof expenseSchema>
) {
  const userId = await getUserId();
  const validated = expenseSchema.parse(data);

  const expense = await prisma.expense.update({
    where: { id, userId },
    data: validated,
  });

  revalidatePath("/utgifter");
  revalidatePath(`/utgifter/${id}`);
  return expense;
}

export async function deleteExpense(id: string) {
  const userId = await getUserId();

  await prisma.expense.delete({
    where: { id, userId },
  });

  revalidatePath("/utgifter");
}
