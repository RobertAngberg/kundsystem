import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inställningar</h1>
        <p className="text-muted-foreground">Hantera ditt konto och inställningar</p>
      </div>

      <Card className="flex flex-col items-center justify-center py-12">
        <Settings className="h-12 w-12 text-muted-foreground mb-4" />
        <CardHeader className="text-center">
          <CardTitle>Kommer snart</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Inställningar är under utveckling
        </CardContent>
      </Card>
    </div>
  );
}
