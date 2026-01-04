import { z } from "zod";

export const invoiceLineSchema = z.object({
  description: z.string().min(1, "Beskrivelse er påkrevd"),
  quantity: z.number().positive("Antall må være større enn 0"),
  unitPrice: z.number().min(0, "Enhetspris kan ikke være negativ"),
  vatRate: z.number().min(0).max(100),
});

export const invoiceSchema = z.object({
  customerId: z.string().min(1, "Velg en kunde"),
  issueDate: z.date(),
  dueDate: z.date(),
  notes: z.string().optional(),
  lines: z.array(invoiceLineSchema).min(1, "Legg til minst én linje"),
});

export const paymentSchema = z.object({
  amount: z.number().positive("Beløp må være større enn 0"),
  date: z.date(),
  note: z.string().optional(),
});
