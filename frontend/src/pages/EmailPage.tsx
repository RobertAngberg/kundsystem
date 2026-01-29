import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function EmailPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">E-post</h1>
        <p className="text-muted-foreground">Skicka och hantera e-post</p>
      </div>

      <Card className="flex flex-col items-center justify-center py-12">
        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
        <CardHeader className="text-center">
          <CardTitle>Kommer snart</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          E-postfunktioner är under utveckling
        </CardContent>
      </Card>
    </div>
  );
}
