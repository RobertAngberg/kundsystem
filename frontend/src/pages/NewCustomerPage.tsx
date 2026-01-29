import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Ny kund</h1>
          <p className="text-muted-foreground">Lägg till en ny kund i systemet</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personuppgifter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Förnamn</label>
                <Input placeholder="Anna" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Efternamn</label>
                <Input placeholder="Andersson" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-post</label>
              <Input type="email" placeholder="anna@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Telefon</label>
              <Input placeholder="070-123 45 67" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Företagsinformation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Företagsnamn</label>
              <Input placeholder="TechStart AB" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Organisationsnummer</label>
              <Input placeholder="556677-8899" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Webbplats</label>
              <Input placeholder="https://example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bransch</label>
              <Input placeholder="Teknologi" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Adress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Gatuadress</label>
              <Input placeholder="Storgatan 1" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Postnummer</label>
                <Input placeholder="111 22" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ort</label>
                <Input placeholder="Stockholm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Land</label>
                <Input placeholder="Sverige" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link to="/customers">Avbryt</Link>
        </Button>
        <Button>Spara kund</Button>
      </div>
    </div>
  );
}
