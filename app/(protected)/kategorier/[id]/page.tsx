import { getCategory } from "~/lib/actions/categories";
import { CategoryForm } from "~/components/forms/category-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { notFound } from "next/navigation";

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const category = await getCategory(params.id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rediger kategori</h1>
        <p className="text-muted-foreground">
          Oppdater informasjon om {category.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kategoriinformasjon</CardTitle>
          <CardDescription>
            Oppdater informasjonen om kategorien. Alle felt er påkrevd.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm category={category} />
        </CardContent>
      </Card>
    </div>
  );
}
