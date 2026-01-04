import { CategoryForm } from "~/components/forms/category-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ny kategori</h1>
        <p className="text-muted-foreground">
          Opprett en ny kategori for inntekt eller utgift
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kategoriinformasjon</CardTitle>
          <CardDescription>
            Fyll ut informasjonen om kategorien. Alle felt er påkrevd.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>
    </div>
  );
}
