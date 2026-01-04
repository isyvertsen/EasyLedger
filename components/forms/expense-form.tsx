"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { expenseSchema } from "~/lib/validations/expense";
import { createExpense, updateExpense } from "~/lib/actions/expenses";
import { toast } from "sonner";
import { Expense, Supplier, Category } from "@prisma/client";
import { useRouter } from "next/navigation";

interface ExpenseFormProps {
  expense?: Expense;
  suppliers: Supplier[];
  categories: Category[];
  onSuccess?: () => void;
}

export function ExpenseForm({
  expense,
  suppliers,
  categories,
  onSuccess,
}: ExpenseFormProps) {
  const router = useRouter();
  const isEditing = !!expense;

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      supplierId: expense?.supplierId || undefined,
      categoryId: expense?.categoryId || undefined,
      description: expense?.description || "",
      amount: expense?.amount || 0,
      vatAmount: expense?.vatAmount || 0,
      date: expense?.date || new Date(),
      status: expense?.status || "REGISTERED",
    },
  });

  async function onSubmit(values: z.infer<typeof expenseSchema>) {
    try {
      if (isEditing) {
        await updateExpense(expense.id, values);
        toast.success("Utgift oppdatert");
      } else {
        await createExpense(values);
        toast.success("Utgift opprettet");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/utgifter");
      }

      form.reset();
    } catch (error) {
      toast.error(
        isEditing ? "Kunne ikke oppdatere utgift" : "Kunne ikke opprette utgift"
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Leverandør</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value || undefined)}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg leverandør (valgfritt)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategori</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value || undefined)}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg kategori (valgfritt)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Kun utgiftskategorier vises her
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beskrivelse *</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Beskriv utgiften" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beløp *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                  />
                </FormControl>
                <FormDescription>Beløp inkl. MVA</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vatAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MVA-beløp</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                  />
                </FormControl>
                <FormDescription>MVA-beløp (valgfritt)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dato *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date
                        ? field.value.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="REGISTERED">Registrert</SelectItem>
                  <SelectItem value="PAID">Betalt</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Lagrer..."
              : isEditing
              ? "Oppdater utgift"
              : "Opprett utgift"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/utgifter")}
          >
            Avbryt
          </Button>
        </div>
      </form>
    </Form>
  );
}
