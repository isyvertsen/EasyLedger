import { getExpenses } from "~/lib/actions/expenses";
import { getCategories } from "~/lib/actions/categories";
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
import { InvoiceUpload } from "~/components/expense/invoice-upload";

const statusMap = {
  REGISTERED: { label: "Registrert", variant: "secondary" as const },
  PAID: { label: "Betalt", variant: "outline" as const },
};

export default async function ExpensesPage() {
  const expenses = await getExpenses();
  const categories = await getCategories();

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Utgifter</h1>
          <p className="text-muted-foreground">
            Administrer dine utgifter og kvitteringer
          </p>
        </div>
        <div className="flex gap-2">
          <InvoiceUpload categories={categories} />
          <Link href="/utgifter/ny">
            <Button variant="outline">Manuell registrering</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utgiftsliste</CardTitle>
          <CardDescription>
            {expenses.length} {expenses.length === 1 ? "utgift" : "utgifter"}{" "}
            registrert | Total:{" "}
            {totalExpenses.toLocaleString("nb-NO", {
              style: "currency",
              currency: "NOK",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Du har ingen utgifter ennå
              </p>
              <Link href="/utgifter/ny">
                <Button>Registrer din første utgift</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dato</TableHead>
                  <TableHead>Beskrivelse</TableHead>
                  <TableHead>Leverandør</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Beløp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      {new Date(expense.date).toLocaleDateString("nb-NO")}
                    </TableCell>
                    <TableCell className="font-medium max-w-md truncate">
                      {expense.description}
                    </TableCell>
                    <TableCell>{expense.supplier?.name || "-"}</TableCell>
                    <TableCell>{expense.category?.name || "-"}</TableCell>
                    <TableCell className="text-right">
                      {expense.amount.toLocaleString("nb-NO", {
                        style: "currency",
                        currency: "NOK",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusMap[expense.status].variant}>
                        {statusMap[expense.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/utgifter/${expense.id}`}>
                        <Button variant="ghost" size="sm">
                          Vis detaljer
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
