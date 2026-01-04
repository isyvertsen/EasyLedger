import { CustomerForm } from "~/components/forms/customer-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ny kunde</h1>
        <p className="text-muted-foreground">
          Legg til en ny kunde i systemet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kundeinformasjon</CardTitle>
          <CardDescription>
            Fyll ut kundens kontaktinformasjon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm />
        </CardContent>
      </Card>
    </div>
  );
}
