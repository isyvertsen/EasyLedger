import { getSettings } from "~/lib/actions/settings";
import { SettingsForm } from "~/components/forms/settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Innstillinger</h1>
        <p className="text-muted-foreground">
          Administrer firmaopplysninger og systeminnstillinger
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Firmaopplysninger</CardTitle>
          <CardDescription>
            Informasjonen vises på fakturaer og andre dokumenter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
