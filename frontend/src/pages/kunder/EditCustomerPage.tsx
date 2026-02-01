import { useState, useEffect, useCallback } from "react";
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
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";

interface Customer {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  companyId: number | null;
}

interface Company {
  id: number;
  name: string;
}

export default function EditCustomerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: "",
  });

  const fetchCustomer = useCallback(async () => {
    try {
      const data = await api.get<Customer>(`/customers/${id}`);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        companyId: data.companyId?.toString() || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kunde inte hämta kund");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchCompanies = useCallback(async () => {
    try {
      const data = await api.get<Company[]>("/companies");
      setCompanies(data);
    } catch (err) {
      console.error("Kunde inte hämta företag:", err);
    }
  }, []);

  useEffect(() => {
    fetchCustomer();
    fetchCompanies();
  }, [fetchCustomer, fetchCompanies]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.put(`/customers/${id}`, {
        ...formData,
        companyId: formData.companyId ? parseInt(formData.companyId) : null,
      });
      navigate("/customers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Redigera kund</h1>
            <p className="text-muted-foreground">Laddar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData.email) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Redigera kund</h1>
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Redigera kund</h1>
          <p className="text-muted-foreground">Uppdatera kundinformation</p>
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
                value={formData.companyId}
                onValueChange={(value) => setFormData({ ...formData, companyId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj företag (valfritt)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Inget företag</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Sparar..." : "Spara ändringar"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/customers">Avbryt</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
