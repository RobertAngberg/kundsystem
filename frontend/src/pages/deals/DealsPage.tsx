import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, DollarSign, ArrowRight, Trash2, GripVertical } from "lucide-react";
import { api } from "@/lib/api";

interface Customer {
  id: number;
  name: string | null;
  email: string;
}

interface Deal {
  id: number;
  title: string;
  value: number;
  stage: string;
  customerId: number;
  customer: Customer;
  description: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  totalValue: number;
  byStage: Record<string, { count: number; value: number }>;
  wonValue: number;
  lostValue: number;
}

const stages = [
  { id: "lead", name: "Lead", color: "bg-slate-500" },
  { id: "contact", name: "Kontakt", color: "bg-blue-500" },
  { id: "proposal", name: "Offert", color: "bg-yellow-500" },
  { id: "negotiation", name: "Förhandling", color: "bg-orange-500" },
  { id: "won", name: "Vunnen", color: "bg-green-500" },
  { id: "lost", name: "Förlorad", color: "bg-red-500" },
];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: "",
    value: "",
    customerId: "",
    description: "",
  });

  const fetchDeals = useCallback(async () => {
    try {
      const data = await api.get<Deal[]>("/deals");
      setDeals(data);
    } catch (error) {
      console.error("Kunde inte hämta affärer:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const data = await api.get<Customer[]>("/customers");
      setCustomers(data);
    } catch (error) {
      console.error("Kunde inte hämta kunder:", error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get<Stats>("/deals/stats");
      setStats(data);
    } catch (error) {
      console.error("Kunde inte hämta statistik:", error);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
    fetchCustomers();
    fetchStats();
  }, [fetchDeals, fetchCustomers, fetchStats]);

  const createDeal = async () => {
    if (!newDeal.title || !newDeal.customerId) return;

    try {
      await api.post("/deals", {
        title: newDeal.title,
        value: parseFloat(newDeal.value) || 0,
        customerId: parseInt(newDeal.customerId),
        description: newDeal.description || null,
      });
      setNewDeal({ title: "", value: "", customerId: "", description: "" });
      setIsDialogOpen(false);
      fetchDeals();
      fetchStats();
    } catch (error) {
      console.error("Kunde inte skapa affär:", error);
    }
  };

  const updateStage = async (dealId: number, newStage: string) => {
    try {
      await api.put(`/deals/${dealId}/stage`, { stage: newStage });
      fetchDeals();
      fetchStats();
    } catch (error) {
      console.error("Kunde inte uppdatera stage:", error);
    }
  };

  const deleteDeal = async (dealId: number) => {
    if (!confirm("Är du säker på att du vill ta bort denna affär?")) return;
    try {
      await api.delete(`/deals/${dealId}`);
      fetchDeals();
      fetchStats();
    } catch (error) {
      console.error("Kunde inte ta bort affär:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDealsByStage = (stageId: string) => {
    return deals.filter((deal) => deal.stage === stageId);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Affärer</h1>
        <p className="text-muted-foreground">Laddar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Affärer</h1>
          <p className="text-muted-foreground">
            Hantera din säljpipeline och följ affärernas progress
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ny affär
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Skapa ny affär</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titel *</label>
                <Input
                  value={newDeal.title}
                  onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Värde (SEK)</label>
                <Input
                  type="number"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kund *</label>
                <Select
                  value={newDeal.customerId}
                  onValueChange={(value) => setNewDeal({ ...newDeal, customerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Välj kund" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name || customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Anteckningar</label>
                <Textarea
                  value={newDeal.description}
                  onChange={(e) => setNewDeal({ ...newDeal, description: e.target.value })}
                  rows={4}
                />
              </div>
              <Button onClick={createDeal} className="w-full">
                Skapa affär
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totalt värde</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
              <p className="text-xs text-muted-foreground">{stats.total} aktiva affärer</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vunna</CardTitle>
              <div className="h-4 w-4 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.wonValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.byStage?.won?.count || 0} affärer
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">I pipeline</CardTitle>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  (stats.byStage?.lead?.value || 0) +
                    (stats.byStage?.contact?.value || 0) +
                    (stats.byStage?.proposal?.value || 0) +
                    (stats.byStage?.negotiation?.value || 0),
                )}
              </div>
              <p className="text-xs text-muted-foreground">Potentiellt värde</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Förlorade</CardTitle>
              <div className="h-4 w-4 rounded-full bg-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.lostValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.byStage?.lost?.count || 0} affärer
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pipeline */}
      <div className="grid gap-4 md:grid-cols-6">
        {stages.map((stage) => (
          <div key={stage.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                <h3 className="font-semibold text-sm">{stage.name}</h3>
              </div>
              <span className="text-xs text-muted-foreground">
                {getDealsByStage(stage.id).length}
              </span>
            </div>
            <div className="space-y-2 min-h-[200px] rounded-lg border bg-muted/30 p-2">
              {getDealsByStage(stage.id).map((deal) => (
                <Card key={deal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <GripVertical className="h-4 w-4 text-muted-foreground inline mr-1" />
                        <span className="font-medium text-sm truncate">{deal.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-1"
                        onClick={() => deleteDeal(deal.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {deal.customer?.name || deal.customer?.email}
                    </p>
                    <p className="text-sm font-semibold mt-2">{formatCurrency(deal.value)}</p>
                    {stage.id !== "won" && stage.id !== "lost" && (
                      <Select
                        value={deal.stage}
                        onValueChange={(value) => updateStage(deal.id, value)}
                      >
                        <SelectTrigger className="h-7 text-xs mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
