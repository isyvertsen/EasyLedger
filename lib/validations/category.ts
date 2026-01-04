import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  type: z.enum(["INCOME", "EXPENSE"], {
    message: "Type er påkrevd",
  }),
});
