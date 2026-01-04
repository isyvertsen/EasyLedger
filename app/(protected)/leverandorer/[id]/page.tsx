import { getSupplier } from "~/lib/actions/suppliers";
import { SupplierForm } from "~/components/forms/supplier-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { notFound } from "next/navigation";

export default async function EditSupplierPage({
  params,
}: {
  params: { id: string };
}) {
  const supplier = await getSupplier(params.id);

  if (!supplier) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rediger leverandør</h1>
        <p className="text-muted-foreground">
          Oppdater informasjon om {supplier.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leverandørinformasjon</CardTitle>
          <CardDescription>
            Oppdater informasjonen om leverandøren. Felt merket med * er påkrevd.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupplierForm supplier={supplier} />
        </CardContent>
      </Card>
    </div>
  );
}
