import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  orgNumber: z.string().optional(),
  email: z.string().email("Ugyldig e-postadresse").optional().or(z.literal("")),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
});
