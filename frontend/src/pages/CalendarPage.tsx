import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kalender</h1>
        <p className="text-muted-foreground">Hantera möten och händelser</p>
      </div>

      <Card className="flex flex-col items-center justify-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
        <CardHeader className="text-center">
          <CardTitle>Kommer snart</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Kalenderfunktioner är under utveckling
        </CardContent>
      </Card>
    </div>
  );
}
