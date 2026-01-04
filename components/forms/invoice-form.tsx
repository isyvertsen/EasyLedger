"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { invoiceSchema } from "~/lib/validations/invoice";
import { createInvoice, updateInvoice } from "~/lib/actions/invoices";
import { toast } from "sonner";
import { Invoice, InvoiceLine, Customer } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Trash2, Plus } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { useEffect } from "react";

interface InvoiceFormProps {
  invoice?: Invoice & { lines: InvoiceLine[] };
  customers: Customer[];
  onSuccess?: () => void;
}

export function InvoiceForm({ invoice, customers, onSuccess }: InvoiceFormProps) {
  const router = useRouter();
  const isEditing = !!invoice;

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: invoice?.customerId || "",
      issueDate: invoice?.issueDate || new Date(),
      dueDate: invoice?.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes: invoice?.notes || "",
      lines: invoice?.lines || [
        { description: "", quantity: 1, unitPrice: 0, vatRate: 25 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const lines = form.watch("lines");

  // Calculate totals
  const subtotal = lines.reduce((sum, line) => {
    return sum + (line.quantity || 0) * (line.unitPrice || 0);
  }, 0);

  const vatTotal = lines.reduce((sum, line) => {
    const lineTotal = (line.quantity || 0) * (line.unitPrice || 0);
    const vat = lineTotal * ((line.vatRate || 0) / 100);
    return sum + vat;
  }, 0);

  const total = subtotal + vatTotal;

  async function onSubmit(values: z.infer<typeof invoiceSchema>) {
    try {
      if (isEditing) {
        await updateInvoice(invoice.id, values);
        toast.success("Faktura oppdatert");
      } else {
        await createInvoice(values);
        toast.success("Faktura opprettet");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/fakturaer");
      }

      form.reset();
    } catch (error) {
      toast.error(
        isEditing ? "Kunne ikke oppdatere faktura" : "Kunne ikke opprette faktura"
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kunde *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Velg kunde" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
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
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fakturadato *</FormLabel>
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

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forfallsdato *</FormLabel>
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Fakturalinjer</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ description: "", quantity: 1, unitPrice: 0, vatRate: 25 })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Legg til linje
            </Button>
          </div>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <FormField
                      control={form.control}
                      name={`lines.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beskrivelse *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Beskrivelse" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`lines.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Antall *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`lines.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enhetspris *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`lines.${index}.vatRate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>MVA % *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:col-span-2 flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{subtotal.toFixed(2)} NOK</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>MVA:</span>
                <span>{vatTotal.toFixed(2)} NOK</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{total.toFixed(2)} NOK</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notater</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Ekstra notater til fakturaen" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Lagrer..."
              : isEditing
              ? "Oppdater faktura"
              : "Opprett faktura"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/fakturaer")}
          >
            Avbryt
          </Button>
        </div>
      </form>
    </Form>
  );
}
