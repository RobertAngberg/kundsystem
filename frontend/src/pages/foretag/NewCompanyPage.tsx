import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

export default function NewCompanyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    orgNumber: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/companies", formData);
      navigate("/companies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/companies">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nytt företag</h1>
          <p className="text-muted-foreground">Lägg till ett nytt företag i systemet</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Företagsinfo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Företagsnamn *</label>
                <Input
                  placeholder="TechStart AB"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Organisationsnummer</label>
                <Input
                  placeholder="556677-8899"
                  value={formData.orgNumber}
                  onChange={(e) => setFormData({ ...formData, orgNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">E-post</label>
                <Input
                  type="email"
                  placeholder="info@techstart.se"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Telefon</label>
                <Input
                  placeholder="08-123 45 67"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Webbplats</label>
                <Input
                  placeholder="https://techstart.se"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Gatuadress</label>
                <Input
                  placeholder="Storgatan 1"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Postnummer</label>
                  <Input
                    placeholder="111 22"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ort</label>
                  <Input
                    placeholder="Stockholm"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" type="button" asChild>
            <Link to="/companies">Avbryt</Link>
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Sparar..." : "Spara företag"}
          </Button>
        </div>
      </form>
    </div>
  );
}
