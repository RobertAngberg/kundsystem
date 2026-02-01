import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { api } from "@/lib/api";

interface Customer {
  id: number;
  name: string | null;
  email: string;
  createdAt: string;
}

interface Company {
  id: number;
  name: string;
  createdAt: string;
}

interface Deal {
  id: number;
  title: string;
  value: number;
  stage: string;
  customerId: number;
  customer: { name: string | null; email: string };
  createdAt: string;
}

interface Task {
  id: number;
  title: string;
  dueDate: string | null;
  completed: boolean;
  priority: string;
  createdAt: string;
}

interface Stats {
  customers: {
    total: number;
    thisMonth: number;
  };
  companies: {
    total: number;
    thisMonth: number;
  };
  deals: {
    total: number;
    totalValue: number;
    wonValue: number;
    lostValue: number;
    avgValue: number;
    byStage: Record<string, { count: number; value: number }>;
  };
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
}

const stages = [
  { id: "lead", name: "Lead" },
  { id: "contact", name: "Kontakt" },
  { id: "proposal", name: "Offert" },
  { id: "negotiation", name: "Förhandling" },
  { id: "won", name: "Vunnen" },
  { id: "lost", name: "Förlorad" },
];

export default function ReportsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [customersData, companiesData, dealsData, tasksData] = await Promise.all([
        api.get<Customer[]>("/customers"),
        api.get<Company[]>("/companies"),
        api.get<Deal[]>("/deals"),
        api.get<Task[]>("/tasks"),
      ]);

      setCustomers(customersData);
      setDeals(dealsData);

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      // Kunder denna månad
      const customersThisMonth = customersData.filter((c) => {
        const date = new Date(c.createdAt);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      });

      // Företag denna månad
      const companiesThisMonth = companiesData.filter((c) => {
        const date = new Date(c.createdAt);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      });

      // Deals statistik
      const dealsByStage: Record<string, { count: number; value: number }> = {};
      let totalValue = 0;
      let wonValue = 0;
      let lostValue = 0;

      dealsData.forEach((deal) => {
        totalValue += deal.value;
        if (deal.stage === "won") wonValue += deal.value;
        if (deal.stage === "lost") lostValue += deal.value;

        if (!dealsByStage[deal.stage]) {
          dealsByStage[deal.stage] = { count: 0, value: 0 };
        }
        dealsByStage[deal.stage].count++;
        dealsByStage[deal.stage].value += deal.value;
      });

      // Tasks statistik
      const completedTasks = tasksData.filter((t) => t.completed);
      const pendingTasks = tasksData.filter((t) => !t.completed);
      const overdueTasks = pendingTasks.filter((t) => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < now;
      });

      setStats({
        customers: {
          total: customersData.length,
          thisMonth: customersThisMonth.length,
        },
        companies: {
          total: companiesData.length,
          thisMonth: companiesThisMonth.length,
        },
        deals: {
          total: dealsData.length,
          totalValue,
          wonValue,
          lostValue,
          avgValue: dealsData.length > 0 ? totalValue / dealsData.length : 0,
          byStage: dealsByStage,
        },
        tasks: {
          total: tasksData.length,
          completed: completedTasks.length,
          pending: pendingTasks.length,
          overdue: overdueTasks.length,
        },
      });
    } catch (error) {
      console.error("Kunde inte hämta data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const exportToCSV = (type: "customers" | "deals") => {
    let csv = "";
    let filename = "";

    if (type === "customers") {
      csv = "Namn,E-post,Skapad\n";
      customers.forEach((c) => {
        csv += `"${c.name || ""}","${c.email}","${new Date(c.createdAt).toLocaleDateString("sv-SE")}"\n`;
      });
      filename = "kunder.csv";
    } else {
      csv = "Titel,Kund,Värde,Steg,Skapad\n";
      deals.forEach((d) => {
        const stageName = stages.find((s) => s.id === d.stage)?.name || d.stage;
        csv += `"${d.title}","${d.customer?.name || d.customer?.email || ""}","${d.value}","${stageName}","${new Date(d.createdAt).toLocaleDateString("sv-SE")}"\n`;
      });
      filename = "deals.csv";
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const winRate =
    stats?.deals.byStage?.won && stats?.deals.byStage?.lost
      ? Math.round(
          (stats.deals.byStage.won.count /
            (stats.deals.byStage.won.count + stats.deals.byStage.lost.count)) *
            100,
        )
      : 0;

  const taskCompletionRate =
    stats?.tasks.total && stats.tasks.total > 0
      ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
      : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Rapporter</h1>
          <p className="text-muted-foreground">Laddar statistik...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rapporter</h1>
          <p className="text-muted-foreground">Analysera data och statistik</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCSV("customers")}>
            <Download className="mr-2 h-4 w-4" />
            Exportera kunder
          </Button>
          <Button variant="outline" onClick={() => exportToCSV("deals")}>
            <Download className="mr-2 h-4 w-4" />
            Exportera deals
          </Button>
        </div>
      </div>

      {/* Översikt */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kunder</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.customers.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.customers.thisMonth || 0} denna månad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Företag</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.companies.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.companies.thisMonth || 0} denna månad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totalt deal-värde</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.deals.totalValue || 0)}</div>
            <p className="text-xs text-muted-foreground">{stats?.deals.total || 0} deals totalt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uppgifter</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.tasks.completed || 0}/{stats?.tasks.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">{taskCompletionRate}% slutförda</p>
          </CardContent>
        </Card>
      </div>

      {/* Deal-statistik */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Pipeline-översikt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stages.map((stage) => {
              const stageData = stats?.deals.byStage?.[stage.id];
              const count = stageData?.count || 0;
              const value = stageData?.value || 0;
              const percentage =
                stats?.deals.total && stats.deals.total > 0
                  ? Math.round((count / stats.deals.total) * 100)
                  : 0;

              return (
                <div key={stage.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{stage.name}</span>
                    <span className="text-muted-foreground">
                      {count} deals · {formatCurrency(value)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${
                        stage.id === "won"
                          ? "bg-emerald-500"
                          : stage.id === "lost"
                            ? "bg-red-500"
                            : "bg-blue-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resultat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-medium">Vunna</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(stats?.deals.wonValue || 0)}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.deals.byStage?.won?.count || 0} deals
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Förlorade</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(stats?.deals.lostValue || 0)}</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.deals.byStage?.lost?.count || 0} deals
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Win Rate</span>
                <span className="text-2xl font-bold">{winRate}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${winRate}%` }} />
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Genomsnittligt deal-värde</span>
                <span className="text-lg font-bold">
                  {formatCurrency(stats?.deals.avgValue || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task-statistik */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Uppgiftsstatistik
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.tasks.pending || 0}</p>
                <p className="text-sm text-muted-foreground">Att göra</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.tasks.completed || 0}</p>
                <p className="text-sm text-muted-foreground">Slutförda</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="rounded-full bg-red-100 p-2 dark:bg-red-900">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.tasks.overdue || 0}</p>
                <p className="text-sm text-muted-foreground">Försenade</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{taskCompletionRate}%</p>
                <p className="text-sm text-muted-foreground">Completion rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
