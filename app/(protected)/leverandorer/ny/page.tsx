import { SupplierForm } from "~/components/forms/supplier-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function NewSupplierPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ny leverandør</h1>
        <p className="text-muted-foreground">
          Legg til en ny leverandør i systemet
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leverandørinformasjon</CardTitle>
          <CardDescription>
            Fyll ut informasjonen om leverandøren. Felt merket med * er påkrevd.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierForm />
        </CardContent>
      </Card>
    </div>
  );
}
