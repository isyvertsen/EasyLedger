import { ExpenseForm } from "~/components/forms/expense-form";
import { getSuppliers } from "~/lib/actions/suppliers";
import { getCategories } from "~/lib/actions/categories";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default async function NewExpensePage() {
  const suppliers = await getSuppliers();
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ny utgift</h1>
        <p className="text-muted-foreground">
          Registrer en ny utgift i systemet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utgiftsinformasjon</CardTitle>
          <CardDescription>
            Fyll ut informasjonen om utgiften. Felt merket med * er påkrevd.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm suppliers={suppliers} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
