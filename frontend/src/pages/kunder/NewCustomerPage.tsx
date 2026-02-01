import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

interface Company {
  id: number;
  name: string;
}

export default function NewCustomerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: "",
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await api.get<Company[]>("/companies");
      setCompanies(data);
    } catch (err) {
      console.error("Kunde inte hämta företag:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/customers", {
        ...formData,
        companyId: formData.companyId ? parseInt(formData.companyId) : null,
      });
      navigate("/customers");
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
          <Link to="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Ny kund</h1>
          <p className="text-muted-foreground">Lägg till en ny kund i systemet</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Kundinformation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

            <div className="space-y-2">
              <label className="text-sm font-medium">Namn</label>
              <Input
                placeholder="Anna Andersson"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">E-post *</label>
              <Input
                type="email"
                placeholder="anna@example.com"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telefon</label>
              <Input
                placeholder="070-123 45 67"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Företag</label>
              <Select
                value={formData.companyId || "none"}
                onValueChange={(value) =>
                  setFormData({ ...formData, companyId: value === "none" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj företag (valfritt)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Inget företag</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" type="button" asChild>
                <Link to="/customers">Avbryt</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sparar..." : "Spara kund"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
