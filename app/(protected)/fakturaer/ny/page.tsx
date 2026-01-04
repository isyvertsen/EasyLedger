import { InvoiceForm } from "~/components/forms/invoice-form";
import { getCustomers } from "~/lib/actions/customers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function NewInvoicePage() {
  const customers = await getCustomers();

  if (customers.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ny faktura</h1>
          <p className="text-muted-foreground">Opprett en ny faktura</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ingen kunder funnet</CardTitle>
            <CardDescription>
              Du må opprette minst én kunde før du kan lage en faktura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/kunder/ny">
              <Button>Opprett kunde</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ny faktura</h1>
        <p className="text-muted-foreground">
          Opprett en ny faktura for en kunde
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fakturainformasjon</CardTitle>
          <CardDescription>
            Fyll ut informasjonen om fakturaen. Felt merket med * er påkrevd.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceForm customers={customers} />
        </CardContent>
      </Card>
    </div>
  );
}
