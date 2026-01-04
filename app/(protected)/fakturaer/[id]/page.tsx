import { getInvoice } from "~/lib/actions/invoices";
import { getCustomers } from "~/lib/actions/customers";
import { InvoiceForm } from "~/components/forms/invoice-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { notFound } from "next/navigation";
import { Download, Mail, Pencil } from "lucide-react";
import Link from "next/link";

const statusMap = {
  DRAFT: { label: "Utkast", variant: "secondary" as const },
  SENT: { label: "Sendt", variant: "default" as const },
  PAID: { label: "Betalt", variant: "outline" as const },
  OVERDUE: { label: "Forfalt", variant: "destructive" as const },
  CANCELLED: { label: "Kansellert", variant: "secondary" as const },
};

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const invoice = await getInvoice(params.id);

  if (!invoice) {
    notFound();
  }

  const customers = await getCustomers();

  // Calculate totals
  const subtotal = invoice.lines.reduce((sum, line) => {
    return sum + line.quantity * line.unitPrice;
  }, 0);

  const vatTotal = invoice.lines.reduce((sum, line) => {
    const lineTotal = line.quantity * line.unitPrice;
    const vat = lineTotal * (line.vatRate / 100);
    return sum + vat;
  }, 0);

  const total = subtotal + vatTotal;

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = total - totalPaid;

  const isEditable = invoice.status === "DRAFT";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {invoice.invoiceNumber}
          </h1>
          <p className="text-muted-foreground">
            Faktura til {invoice.customer.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={statusMap[invoice.status].variant}>
            {statusMap[invoice.status].label}
          </Badge>
        </div>
      </div>

      {isEditable ? (
        <Card>
          <CardHeader>
            <CardTitle>Rediger faktura</CardTitle>
            <CardDescription>
              Oppdater fakturaen. Fakturaen er i utkast-modus og kan redigeres.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceForm invoice={invoice} customers={customers} />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Fakturadetaljer</CardTitle>
              <CardDescription>
                Fakturadato:{" "}
                {new Date(invoice.issueDate).toLocaleDateString("nb-NO")} |
                Forfallsdato:{" "}
                {new Date(invoice.dueDate).toLocaleDateString("nb-NO")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Kunde</h3>
                <p>{invoice.customer.name}</p>
                {invoice.customer.email && <p>{invoice.customer.email}</p>}
                {invoice.customer.address && (
                  <p>
                    {invoice.customer.address}
                    {invoice.customer.postalCode && invoice.customer.city && (
                      <>
                        <br />
                        {invoice.customer.postalCode} {invoice.customer.city}
                      </>
                    )}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Fakturalinjer</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Beskrivelse</TableHead>
                      <TableHead className="text-right">Antall</TableHead>
                      <TableHead className="text-right">Enhetspris</TableHead>
                      <TableHead className="text-right">MVA %</TableHead>
                      <TableHead className="text-right">Sum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.lines.map((line) => {
                      const lineTotal = line.quantity * line.unitPrice;
                      const lineVat = lineTotal * (line.vatRate / 100);
                      const lineSum = lineTotal + lineVat;

                      return (
                        <TableRow key={line.id}>
                          <TableCell>{line.description}</TableCell>
                          <TableCell className="text-right">
                            {line.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {line.unitPrice.toLocaleString("nb-NO", {
                              style: "currency",
                              currency: "NOK",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {line.vatRate}%
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {lineSum.toLocaleString("nb-NO", {
                              style: "currency",
                              currency: "NOK",
                            })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>
                    {subtotal.toLocaleString("nb-NO", {
                      style: "currency",
                      currency: "NOK",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>MVA:</span>
                  <span>
                    {vatTotal.toLocaleString("nb-NO", {
                      style: "currency",
                      currency: "NOK",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>
                    {total.toLocaleString("nb-NO", {
                      style: "currency",
                      currency: "NOK",
                    })}
                  </span>
                </div>
              </div>

              {invoice.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notater</h3>
                  <p className="text-sm text-muted-foreground">
                    {invoice.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Betalinger</CardTitle>
                <CardDescription>
                  Betalt: {totalPaid.toLocaleString("nb-NO", {
                    style: "currency",
                    currency: "NOK",
                  })}{" "}
                  | Gjenstående: {remaining.toLocaleString("nb-NO", {
                    style: "currency",
                    currency: "NOK",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dato</TableHead>
                      <TableHead>Beløp</TableHead>
                      <TableHead>Notat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {new Date(payment.date).toLocaleDateString("nb-NO")}
                        </TableCell>
                        <TableCell>
                          {payment.amount.toLocaleString("nb-NO", {
                            style: "currency",
                            currency: "NOK",
                          })}
                        </TableCell>
                        <TableCell>{payment.note || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button variant="outline" disabled>
              <Download className="h-4 w-4 mr-2" />
              Last ned PDF
            </Button>
            <Button variant="outline" disabled>
              <Mail className="h-4 w-4 mr-2" />
              Send på e-post
            </Button>
            <Button variant="outline" disabled>
              Registrer betaling
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
