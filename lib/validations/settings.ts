import { z } from "zod";

export const settingsSchema = z.object({
  companyName: z.string().min(1, "Firmanavn er påkrevd").optional(),
  orgNumber: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  logo: z.string().optional(),
  bankAccount: z.string().optional(),
  vatRate: z.number().min(0).max(100),
  invoicePrefix: z.string().min(1, "Fakturaprefix er påkrevd"),
  invoiceNextNumber: z.number().int().positive(),
  emailFrom: z.string().email("Ugyldig e-postadresse").optional().or(z.literal("")),
  paymentDueDays: z.number().int().positive(),
});
