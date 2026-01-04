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
import { supplierSchema } from "~/lib/validations/supplier";
import { createSupplier, updateSupplier } from "~/lib/actions/suppliers";
import { toast } from "sonner";
import { Supplier } from "@prisma/client";
import { useRouter } from "next/navigation";

interface SupplierFormProps {
  supplier?: Supplier;
  onSuccess?: () => void;
}

export function SupplierForm({ supplier, onSuccess }: SupplierFormProps) {
  const router = useRouter();
  const isEditing = !!supplier;

  const form = useForm<z.infer<typeof supplierSchema>>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier?.name || "",
      orgNumber: supplier?.orgNumber || "",
      email: supplier?.email || "",
      address: supplier?.address || "",
      postalCode: supplier?.postalCode || "",
      city: supplier?.city || "",
      phone: supplier?.phone || "",
    },
  });

  async function onSubmit(values: z.infer<typeof supplierSchema>) {
    try {
      if (isEditing) {
        await updateSupplier(supplier.id, values);
        toast.success("Leverandør oppdatert");
      } else {
        await createSupplier(values);
        toast.success("Leverandør opprettet");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/leverandorer");
      }

      form.reset();
    } catch (error) {
      toast.error(
        isEditing ? "Kunne ikke oppdatere leverandør" : "Kunne ikke opprette leverandør"
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Navn *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Leverandørnavn" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="orgNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organisasjonsnummer</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="123456789" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-post</FormLabel>
                <FormControl>
                  <Input type="email" {...field} placeholder="leverandor@eksempel.no" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="+47 123 45 678" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Gateadresse 1" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postnummer</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="0123" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Poststed</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Oslo" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Lagrer..."
              : isEditing
              ? "Oppdater leverandør"
              : "Opprett leverandør"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/leverandorer")}
          >
            Avbryt
          </Button>
        </div>
      </form>
    </Form>
  );
}
