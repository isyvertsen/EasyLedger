"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "~/lib/db";
import { revalidatePath } from "next/cache";
import { ExtractedInvoiceData } from "~/lib/openai";

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
