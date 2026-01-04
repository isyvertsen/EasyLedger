"use server";

import { prisma } from "~/lib/db";
import { revalidatePath } from "next/cache";
import { invoiceSchema, paymentSchema } from "~/lib/validations/invoice";
import { z } from "zod";
import { generateInvoicePDFBuffer } from "~/lib/pdf-utils";
import { sendInvoiceEmail } from "~/lib/email";
import { getSettings } from "./settings";
import { getUserId } from "./user";

export async function getInvoices() {
  const userId = await getUserId();

  return prisma.invoice.findMany({
    where: { userId },
    include: {
      customer: true,
      lines: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvoice(id: string) {
  const userId = await getUserId();

  return prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      customer: true,
      lines: { orderBy: { sortOrder: "asc" } },
      payments: { orderBy: { date: "desc" } },
    },
  });
}

export async function createInvoice(data: z.infer<typeof invoiceSchema>) {
  const userId = await getUserId();
  const validated = invoiceSchema.parse(data);

  // Get next invoice number
  const settings = await getSettings();
  const invoiceNumber = `${settings.invoicePrefix}-${settings.invoiceNextNumber}`;

  // Create invoice with lines
  const invoice = await prisma.invoice.create({
    data: {
      userId,
      customerId: validated.customerId,
      invoiceNumber,
      issueDate: validated.issueDate,
      dueDate: validated.dueDate,
      notes: validated.notes,
      lines: {
        create: validated.lines.map((line, index) => ({
          ...line,
          sortOrder: index,
        })),
      },
    },
  });

  // Increment invoice number
  await prisma.settings.update({
    where: { userId },
    data: { invoiceNextNumber: settings.invoiceNextNumber + 1 },
  });

  revalidatePath("/fakturaer");
  return invoice;
}

export async function updateInvoice(
  id: string,
  data: z.infer<typeof invoiceSchema>
) {
  const userId = await getUserId();
  const validated = invoiceSchema.parse(data);

  // Delete existing lines and create new ones
  await prisma.invoiceLine.deleteMany({
    where: { invoiceId: id },
  });

  const invoice = await prisma.invoice.update({
    where: { id, userId },
    data: {
      customerId: validated.customerId,
      issueDate: validated.issueDate,
      dueDate: validated.dueDate,
      notes: validated.notes,
      lines: {
        create: validated.lines.map((line, index) => ({
          ...line,
          sortOrder: index,
        })),
      },
    },
  });

  revalidatePath("/fakturaer");
  revalidatePath(`/fakturaer/${id}`);
  return invoice;
}

export async function deleteInvoice(id: string) {
  const userId = await getUserId();

  await prisma.invoice.delete({
    where: { id, userId },
  });

  revalidatePath("/fakturaer");
}

export async function generateInvoicePDF(id: string) {
  const userId = await getUserId();
  const settings = await getSettings();

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      customer: true,
      lines: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!invoice) throw new Error("Faktura ikke funnet");

  return await generateInvoicePDFBuffer(invoice, settings);
}

export async function sendInvoice(id: string) {
  const userId = await getUserId();
  const settings = await getSettings();

  const invoice = await prisma.invoice.findFirst({
    where: { id, userId },
    include: {
      customer: true,
      lines: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!invoice) throw new Error("Faktura ikke funnet");
  if (!invoice.customer.email) throw new Error("Kunde mangler e-postadresse");
  if (!settings.emailFrom) throw new Error("E-post avsender ikke konfigurert");

  // Generate PDF
  const pdfBuffer = await generateInvoicePDF(id);

  // Calculate total
  const total =
    invoice.lines.reduce((sum, line) => {
      const lineTotal = line.quantity * line.unitPrice;
      const vatAmount = lineTotal * (line.vatRate / 100);
      return sum + lineTotal + vatAmount;
    }, 0);

  // Send email
  await sendInvoiceEmail({
    to: invoice.customer.email,
    customerName: invoice.customer.name,
    invoiceNumber: invoice.invoiceNumber,
    amount: total,
    dueDate: invoice.dueDate,
    pdfBuffer,
    fromEmail: settings.emailFrom,
    companyName: settings.companyName || "Firma",
  });

  // Update invoice
  await prisma.invoice.update({
    where: { id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      sentTo: invoice.customer.email,
    },
  });

  revalidatePath("/fakturaer");
  revalidatePath(`/fakturaer/${id}`);
}

export async function registerPayment(
  invoiceId: string,
  data: z.infer<typeof paymentSchema>
) {
  const userId = await getUserId();
  const validated = paymentSchema.parse(data);

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, userId },
    include: {
      lines: true,
      payments: true,
    },
  });

  if (!invoice) throw new Error("Faktura ikke funnet");

  // Calculate invoice total
  const invoiceTotal = invoice.lines.reduce((sum, line) => {
    const lineTotal = line.quantity * line.unitPrice;
    const vatAmount = lineTotal * (line.vatRate / 100);
    return sum + lineTotal + vatAmount;
  }, 0);

  // Calculate total paid (including new payment)
  const totalPaid =
    invoice.payments.reduce((sum, p) => sum + p.amount, 0) + validated.amount;

  // Create payment
  await prisma.payment.create({
    data: {
      invoiceId,
      amount: validated.amount,
      date: validated.date,
      note: validated.note,
    },
  });

  // Update invoice status if fully paid
  if (totalPaid >= invoiceTotal) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID" },
    });
  }

  revalidatePath("/fakturaer");
  revalidatePath(`/fakturaer/${invoiceId}`);
}

export async function updateInvoiceStatus(id: string, status: string) {
  const userId = await getUserId();

  await prisma.invoice.update({
    where: { id, userId },
    data: { status: status as any },
  });

  revalidatePath("/fakturaer");
  revalidatePath(`/fakturaer/${id}`);
}
