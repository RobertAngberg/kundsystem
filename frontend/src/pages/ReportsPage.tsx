import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rapporter</h1>
        <p className="text-muted-foreground">Analysera data och statistik</p>
      </div>

      <Card className="flex flex-col items-center justify-center py-12">
        <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
        <CardHeader className="text-center">
          <CardTitle>Kommer snart</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Rapportfunktioner är under utveckling
        </CardContent>
      </Card>
    </div>
  );
}
