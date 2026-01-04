import { getInvoices } from "~/lib/actions/invoices";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

const statusMap = {
  DRAFT: { label: "Utkast", variant: "secondary" as const },
  SENT: { label: "Sendt", variant: "default" as const },
  PAID: { label: "Betalt", variant: "outline" as const },
  OVERDUE: { label: "Forfalt", variant: "destructive" as const },
  CANCELLED: { label: "Kansellert", variant: "secondary" as const },
};

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fakturaer</h1>
          <p className="text-muted-foreground">
            Administrer dine fakturaer og betalinger
          </p>
        </div>
        <Link href="/fakturaer/ny">
          <Button>Ny faktura</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fakturaliste</CardTitle>
          <CardDescription>
            {invoices.length} {invoices.length === 1 ? "faktura" : "fakturaer"}{" "}
            registrert
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Du har ingen fakturaer ennå
              </p>
              <Link href="/fakturaer/ny">
                <Button>Opprett din første faktura</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fakturanummer</TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Fakturadato</TableHead>
                  <TableHead>Forfallsdato</TableHead>
                  <TableHead>Beløp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const total = invoice.lines.reduce((sum, line) => {
                    const lineTotal = line.quantity * line.unitPrice;
                    const vat = lineTotal * (line.vatRate / 100);
                    return sum + lineTotal + vat;
                  }, 0);

                  const totalPaid = invoice.payments.reduce(
                    (sum, p) => sum + p.amount,
                    0
                  );

                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{invoice.customer.name}</TableCell>
                      <TableCell>
                        {new Date(invoice.issueDate).toLocaleDateString("nb-NO")}
                      </TableCell>
                      <TableCell>
                        {new Date(invoice.dueDate).toLocaleDateString("nb-NO")}
                      </TableCell>
                      <TableCell>
                        {total.toLocaleString("nb-NO", {
                          style: "currency",
                          currency: "NOK",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusMap[invoice.status].variant}>
                          {statusMap[invoice.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/fakturaer/${invoice.id}`}>
                          <Button variant="ghost" size="sm">
                            Vis detaljer
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
