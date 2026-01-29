import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";

export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Företag</h1>
        <p className="text-muted-foreground">Hantera företag och organisationer</p>
      </div>

      <Card className="flex flex-col items-center justify-center py-12">
        <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
        <CardHeader className="text-center">
          <CardTitle>Kommer snart</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Företagshantering är under utveckling
        </CardContent>
      </Card>
    </div>
  );
}
