import { z } from "zod";

export const expenseSchema = z.object({
  supplierId: z.string().optional(),
  categoryId: z.string().optional(),
  description: z.string().min(1, "Beskrivelse er påkrevd"),
  amount: z.number().positive("Beløp må være større enn 0"),
  vatAmount: z.number().min(0).optional(),
  date: z.date(),
  status: z.enum(["REGISTERED", "PAID"]),
});
