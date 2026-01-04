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
import { customerSchema } from "~/lib/validations/customer";
import { createCustomer, updateCustomer } from "~/lib/actions/customers";
import { toast } from "sonner";
import { Customer } from "@prisma/client";
import { useRouter } from "next/navigation";

interface CustomerFormProps {
  customer?: Customer;
  onSuccess?: () => void;
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const router = useRouter();
  const isEditing = !!customer;

  const form = useForm<z.infer<typeof customerSchema>>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || "",
      orgNumber: customer?.orgNumber || "",
      email: customer?.email || "",
      address: customer?.address || "",
      postalCode: customer?.postalCode || "",
      city: customer?.city || "",
      phone: customer?.phone || "",
    },
  });

  async function onSubmit(values: z.infer<typeof customerSchema>) {
    try {
      if (isEditing) {
        await updateCustomer(customer.id, values);
        toast.success("Kunde oppdatert");
      } else {
        await createCustomer(values);
        toast.success("Kunde opprettet");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/kunder");
      }

      form.reset();
    } catch (error) {
      toast.error(
        isEditing ? "Kunne ikke oppdatere kunde" : "Kunne ikke opprette kunde"
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
                  <Input {...field} placeholder="Kundenavn" />
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
                  <Input type="email" {...field} placeholder="kunde@eksempel.no" />
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
              ? "Oppdater kunde"
              : "Opprett kunde"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/kunder")}
          >
            Avbryt
          </Button>
        </div>
      </form>
    </Form>
  );
}
