import { getDashboardStats } from "~/lib/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { FileText, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Oversikt over din virksomhet
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Totalt fakturert
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalInvoiced.toLocaleString("nb-NO", {
                style: "currency",
                currency: "NOK",
              })}
            </div>
            <p className="text-xs text-muted-foreground">Dette året</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Utestående
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalOutstanding.toLocaleString("nb-NO", {
                style: "currency",
                currency: "NOK",
              })}
            </div>
            <p className="text-xs text-muted-foreground">Ikke betalt ennå</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Totale utgifter
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalExpenses.toLocaleString("nb-NO", {
                style: "currency",
                currency: "NOK",
              })}
            </div>
            <p className="text-xs text-muted-foreground">Dette året</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resultat
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {stats.profit.toLocaleString("nb-NO", {
                style: "currency",
                currency: "NOK",
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.profit >= 0 ? "Overskudd" : "Underskudd"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
