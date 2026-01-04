import { getSuppliers } from "~/lib/actions/suppliers";
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

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leverandører</h1>
          <p className="text-muted-foreground">
            Administrer dine leverandører og kontaktinformasjon
          </p>
        </div>
        <Link href="/leverandorer/ny">
          <Button>Ny leverandør</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leverandørliste</CardTitle>
          <CardDescription>
            {suppliers.length} {suppliers.length === 1 ? "leverandør" : "leverandører"}{" "}
            registrert
          </CardDescription>
        </CardHeader>
        <CardContent>
          {suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground mb-4">
                Du har ingen leverandører ennå
              </p>
              <Link href="/leverandorer/ny">
                <Button>Legg til din første leverandør</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Navn</TableHead>
                  <TableHead>E-post</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Poststed</TableHead>
                  <TableHead className="text-right">Handlinger</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">
                      {supplier.name}
                    </TableCell>
                    <TableCell>{supplier.email || "-"}</TableCell>
                    <TableCell>{supplier.phone || "-"}</TableCell>
                    <TableCell>{supplier.city || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/leverandorer/${supplier.id}`}>
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
