import { getCustomer, deleteCustomer } from "~/lib/actions/customers";
import { CustomerForm } from "~/components/forms/customer-form";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rediger kunde</h1>
          <p className="text-muted-foreground">
            Oppdater kundens informasjon
          </p>
        </div>
        <Link href="/kunder">
          <Button variant="outline">Tilbake til kunder</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{customer.name}</CardTitle>
          <CardDescription>
            Kundeinformasjon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CustomerForm customer={customer} />
        </CardContent>
      </Card>
    </div>
  );
}
