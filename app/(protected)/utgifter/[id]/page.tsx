import { getExpense } from "~/lib/actions/expenses";
import { getSuppliers } from "~/lib/actions/suppliers";
import { getCategories } from "~/lib/actions/categories";
import { ExpenseForm } from "~/components/forms/expense-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { notFound } from "next/navigation";

const statusMap = {
  REGISTERED: { label: "Registrert", variant: "secondary" as const },
  PAID: { label: "Betalt", variant: "outline" as const },
};

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const expense = await getExpense(id);

  if (!expense) {
    notFound();
  }

  const suppliers = await getSuppliers();
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rediger utgift</h1>
          <p className="text-muted-foreground">
            Oppdater informasjon om utgiften
          </p>
        </div>
        <Badge variant={statusMap[expense.status].variant}>
          {statusMap[expense.status].label}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utgiftsinformasjon</CardTitle>
          <CardDescription>
            Oppdater informasjonen om utgiften. Felt merket med * er påkrevd.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm
            expense={expense}
            suppliers={suppliers}
            categories={categories}
          />
        </CardContent>
      </Card>

      {expense.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vedlegg</CardTitle>
            <CardDescription>
              {expense.attachments.length}{" "}
              {expense.attachments.length === 1 ? "vedlegg" : "vedlegg"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expense.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <span className="text-sm">{attachment.filename}</span>
                  <span className="text-xs text-muted-foreground">
                    {(attachment.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
