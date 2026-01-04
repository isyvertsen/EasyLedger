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

export default async function CategoriesPage() {
  const categories = await getCategories();

  const incomeCategories = categories.filter((c) => c.type === "INCOME");
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategorier</h1>
          <p className="text-muted-foreground">
            Administrer kategorier for inntekter og utgifter
          </p>
        </div>
        <Link href="/kategorier/ny">
          <Button>Ny kategori</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inntektskategorier</CardTitle>
            <CardDescription>
              {incomeCategories.length}{" "}
              {incomeCategories.length === 1 ? "kategori" : "kategorier"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {incomeCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Ingen inntektskategorier ennå
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Navn</TableHead>
                    <TableHead className="text-right">Handlinger</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {category.name}
                          <Badge variant="secondary">Inntekt</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/kategorier/${category.id}`}>
                          <Button variant="ghost" size="sm">
                            Rediger
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

        <Card>
          <CardHeader>
            <CardTitle>Utgiftskategorier</CardTitle>
            <CardDescription>
              {expenseCategories.length}{" "}
              {expenseCategories.length === 1 ? "kategori" : "kategorier"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenseCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Ingen utgiftskategorier ennå
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Navn</TableHead>
                    <TableHead className="text-right">Handlinger</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {category.name}
                          <Badge variant="outline">Utgift</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/kategorier/${category.id}`}>
                          <Button variant="ghost" size="sm">
                            Rediger
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
    </div>
  );
}
