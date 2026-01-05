"use server";

import { getUserId } from "./user";
import { prisma } from "~/lib/db";
import { revalidatePath } from "next/cache";
import { ExtractedInvoiceData } from "~/lib/openai";

export async function createExpenseFromInvoice(
  extractedData: ExtractedInvoiceData,
  categoryId?: string
) {
  const userId = await getUserId();

  // Try to find matching supplier by name
  let supplierId: string | undefined;
  if (extractedData.supplierName) {
    const supplier = await prisma.supplier.findFirst({
      where: {
        userId,
        name: {
          contains: extractedData.supplierName,
          mode: "insensitive",
        },
      },
    });

    if (supplier) {
      supplierId = supplier.id;
    } else {
      // Create new supplier if not found
      const newSupplier = await prisma.supplier.create({
        data: {
          userId,
          name: extractedData.supplierName,
        },
      });
      supplierId = newSupplier.id;
    }
  }

  // Parse date
  const date = extractedData.date
    ? new Date(extractedData.date)
    : new Date();

  // Create expense
  const expense = await prisma.expense.create({
    data: {
      userId,
      supplierId,
      categoryId,
      description: extractedData.description,
      amount: extractedData.amount,
      vatAmount: extractedData.vatAmount || 0,
      date,
      status: "REGISTERED",
    },
  });

  revalidatePath("/utgifter");
  return expense;
}

export async function findOrCreateSupplier(supplierName: string) {
  const userId = await getUserId();

  const existing = await prisma.supplier.findFirst({
    where: {
      userId,
      name: {
        contains: supplierName,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    return existing;
  }

  const supplier = await prisma.supplier.create({
    data: {
      userId,
      name: supplierName,
    },
  });

  revalidatePath("/leverandorer");
  return supplier;
}
