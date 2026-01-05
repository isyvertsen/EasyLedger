"use server";

import { getUserId } from "./user";
import { prisma } from "~/lib/db";

export async function getDashboardStats(startDate?: Date, endDate?: Date) {
  const userId = await getUserId();

  // Sett standarddatoer hvis ikke angitt
  const now = new Date();
  const start = startDate || new Date(now.getFullYear(), 0, 1); // Start av år
  const end = endDate || now;

  // Hent alle fakturaer i perioden
  const invoices = await prisma.invoice.findMany({
    where: {
      userId,
      issueDate: {
        gte: start,
        lte: end,
      },
    },
    include: {
      lines: true,
    },
  });

  // Beregn total fakturert beløp
  const totalInvoiced = invoices.reduce((sum, invoice) => {
    const invoiceTotal = invoice.lines.reduce((lineSum, line) => {
      const subtotal = line.quantity * line.unitPrice;
      const vat = subtotal * (line.vatRate / 100);
      return lineSum + subtotal + vat;
    }, 0);
    return sum + invoiceTotal;
  }, 0);

  // Beregn utestående beløp (SENT og OVERDUE)
  const outstandingInvoices = invoices.filter(
    (inv) => inv.status === "SENT" || inv.status === "OVERDUE"
  );

  const totalOutstanding = outstandingInvoices.reduce((sum, invoice) => {
    const invoiceTotal = invoice.lines.reduce((lineSum, line) => {
      const subtotal = line.quantity * line.unitPrice;
      const vat = subtotal * (line.vatRate / 100);
      return lineSum + subtotal + vat;
    }, 0);
    return sum + invoiceTotal;
  }, 0);

  // Hent alle utgifter i perioden
  const expenses = await prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lte: end,
      },
    },
  });

  // Beregn total utgifter (inkludert MVA)
  const totalExpenses = expenses.reduce((sum, expense) => {
    return sum + expense.amount + (expense.vatAmount || 0);
  }, 0);

  // Beregn fortjeneste
  const profit = totalInvoiced - totalExpenses;

  return {
    totalInvoiced,
    totalOutstanding,
    totalExpenses,
    profit,
  };
}
