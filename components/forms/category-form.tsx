"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { categorySchema } from "~/lib/validations/category";
import { createCategory, updateCategory } from "~/lib/actions/categories";
import { toast } from "sonner";
import { Category } from "@prisma/client";
import { useRouter } from "next/navigation";

interface CategoryFormProps {
  category?: Category;
  onSuccess?: () => void;
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = !!category;

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || "EXPENSE",
    },
  });

  async function onSubmit(values: z.infer<typeof categorySchema>) {
    try {
      if (isEditing) {
        await updateCategory(category.id, values);
        toast.success("Kategori oppdatert");
      } else {
        await createCategory(values);
        toast.success("Kategori opprettet");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/kategorier");
      }

      form.reset();
    } catch (error) {
      toast.error(
        isEditing ? "Kunne ikke oppdatere kategori" : "Kunne ikke opprette kategori"
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Navn *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Kategorinavn" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg kategoritype" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="INCOME">Inntekt</SelectItem>
                  <SelectItem value="EXPENSE">Utgift</SelectItem>
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
              ? "Oppdater kategori"
              : "Opprett kategori"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/kategorier")}
          >
            Avbryt
          </Button>
        </div>
      </form>
    </Form>
  );
}
