import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Building2,
  TrendingUp,
  UserPlus,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Trophy,
  Target,
  Crown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Customer {
  id: number;
  name: string | null;
  email: string;
  createdAt: string;
  company?: { name: string } | null;
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
  ownerId: string | null;
  owner?: { id: string; name: string | null; email: string } | null;
}

interface Task {
  id: number;
  title: string;
  completed: boolean;
  ownerId: string | null;
  owner?: { id: string; name: string | null; email: string } | null;
}

interface ActivityLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  entityName: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user?: { name: string | null; email: string } | null;
}

interface TeamMemberStats {
  id: string;
  name: string;
  email: string;
  dealsCount: number;
  dealsValue: number;
  wonDeals: number;
  wonValue: number;
  tasksCompleted: number;
  tasksPending: number;
}

interface Stats {
  totalCustomers: number;
  totalCompanies: number;
  customersThisMonth: number;
  companiesThisMonth: number;
  recentCustomers: Customer[];
  recentCompanies: Company[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [teamStats, setTeamStats] = useState<TeamMemberStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [customers, companies, activities, deals, tasks] = await Promise.all([
        api.get<Customer[]>("/customers"),
        api.get<Company[]>("/companies"),
        api.get<ActivityLog[]>("/activity-log?limit=10"),
        api.get<Deal[]>("/deals"),
        api.get<Task[]>("/tasks"),
      ]);

      setActivityLog(activities);

      // Beräkna team-statistik per användare
      const memberStatsMap = new Map<string, TeamMemberStats>();

      deals.forEach((deal) => {
        if (deal.owner) {
          const existing = memberStatsMap.get(deal.owner.id) || {
            id: deal.owner.id,
            name: deal.owner.name || deal.owner.email,
            email: deal.owner.email,
            dealsCount: 0,
            dealsValue: 0,
            wonDeals: 0,
            wonValue: 0,
            tasksCompleted: 0,
            tasksPending: 0,
          };
          existing.dealsCount++;
          existing.dealsValue += deal.value;
          if (deal.stage === "won") {
            existing.wonDeals++;
            existing.wonValue += deal.value;
          }
          memberStatsMap.set(deal.owner.id, existing);
        }
      });

      tasks.forEach((task) => {
        if (task.owner) {
          const existing = memberStatsMap.get(task.owner.id) || {
            id: task.owner.id,
            name: task.owner.name || task.owner.email,
            email: task.owner.email,
            dealsCount: 0,
            dealsValue: 0,
            wonDeals: 0,
            wonValue: 0,
            tasksCompleted: 0,
            tasksPending: 0,
          };
          if (task.completed) {
            existing.tasksCompleted++;
          } else {
            existing.tasksPending++;
          }
          memberStatsMap.set(task.owner.id, existing);
        }
      });

      // Sortera efter vunnet värde (högst först)
      const sortedTeamStats = Array.from(memberStatsMap.values()).sort(
        (a, b) => b.wonValue - a.wonValue,
      );
      setTeamStats(sortedTeamStats);

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const customersThisMonth = customers.filter((c) => {
        const date = new Date(c.createdAt);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      });

      const companiesThisMonth = companies.filter((c) => {
        const date = new Date(c.createdAt);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      });

      setStats({
        totalCustomers: customers.length,
        totalCompanies: companies.length,
        customersThisMonth: customersThisMonth.length,
        companiesThisMonth: companiesThisMonth.length,
        recentCustomers: customers.slice(0, 5),
        recentCompanies: companies.slice(0, 5),
      });
    } catch (error) {
      console.error("Kunde inte hämta statistik:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Idag";
    if (diffDays === 1) return "Igår";
    if (diffDays < 7) return `${diffDays} dagar sedan`;
    return date.toLocaleDateString("sv-SE");
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return email[0].toUpperCase();
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="h-4 w-4 text-emerald-500" />;
      case "updated":
        return <Pencil className="h-4 w-4 text-blue-500" />;
      case "deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "stage_changed":
        return <ArrowRight className="h-4 w-4 text-purple-500" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "reopened":
        return <RotateCcw className="h-4 w-4 text-amber-500" />;
      default:
        return <Plus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityText = (activity: ActivityLog) => {
    const entityTypeMap: Record<string, string> = {
      customer: "Kund",
      company: "Företag",
      deal: "Deal",
      task: "Uppgift",
    };

    const stageMap: Record<string, string> = {
      lead: "Lead",
      contact: "Kontakt",
      proposal: "Offert",
      negotiation: "Förhandling",
      won: "Vunnen",
      lost: "Förlorad",
    };

    const type = entityTypeMap[activity.entityType] || activity.entityType;

    switch (activity.action) {
      case "created":
        return `${type} "${activity.entityName}" skapades`;
      case "updated":
        return `${type} "${activity.entityName}" uppdaterades`;
      case "deleted":
        return `${type} "${activity.entityName}" togs bort`;
      case "stage_changed":
        const oldStage = stageMap[activity.oldValue || ""] || activity.oldValue;
        const newStage = stageMap[activity.newValue || ""] || activity.newValue;
        return `Deal "${activity.entityName}" flyttades från ${oldStage} till ${newStage}`;
      case "completed":
        return `Uppgift "${activity.entityName}" slutfördes`;
      case "reopened":
        return `Uppgift "${activity.entityName}" öppnades igen`;
      default:
        return `${type} "${activity.entityName}"`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Laddar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Välkommen tillbaka{user?.user_metadata?.name ? `, ${user.user_metadata.name}` : ""}!
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totalt kunder
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.customersThisMonth || 0} denna månad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Företag</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCompanies || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.companiesThisMonth || 0} denna månad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nya kunder/månad
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.customersThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">Denna månad</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Snittfrekvens
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalCompanies
                ? (stats.totalCustomers / stats.totalCompanies).toFixed(1)
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Kunder per företag</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Customers */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Senaste kunder</CardTitle>
            <Link to="/customers" className="text-sm text-primary hover:underline">
              Visa alla
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Företag</TableHead>
                  <TableHead>Tillagd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(customer.name, customer.email)}
                          </AvatarFallback>
                        </Avatar>
                        {customer.name || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.company?.name || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(customer.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Companies */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Senaste företag</CardTitle>
            <Link to="/companies" className="text-sm text-primary hover:underline">
              Visa alla
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentCompanies.map((company) => (
                <div key={company.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {company.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(company.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitetslogg</CardTitle>
        </CardHeader>
        <CardContent>
          {activityLog.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen aktivitet ännu</p>
          ) : (
            <div className="space-y-4">
              {activityLog.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-muted p-2">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{getActivityText(activity)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Performance */}
      {teamStats.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle>Team-prestationer</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamStats.map((member, index) => {
                const maxWonValue = teamStats[0]?.wonValue || 1;
                const progressPercent = (member.wonValue / maxWonValue) * 100;

                return (
                  <div key={member.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {member.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {index === 0 && teamStats.length > 1 && (
                            <div className="absolute -top-1 -right-1 rounded-full bg-amber-500 p-0.5">
                              <Crown className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {member.name}
                            {member.id === user?.id && (
                              <span className="ml-1 text-xs text-muted-foreground">(du)</span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {member.dealsCount} deals
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {member.tasksCompleted} tasks
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600">
                          {member.wonValue.toLocaleString("sv-SE")} kr
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.wonDeals} vunna deals
                        </p>
                      </div>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                );
              })}
            </div>

            {teamStats.length > 0 && (
              <div className="mt-6 grid grid-cols-3 gap-4 rounded-lg bg-muted/50 p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {teamStats.reduce((sum, m) => sum + m.wonValue, 0).toLocaleString("sv-SE")} kr
                  </p>
                  <p className="text-xs text-muted-foreground">Totalt vunnet</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {teamStats.reduce((sum, m) => sum + m.dealsCount, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Totala deals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {teamStats.reduce((sum, m) => sum + m.tasksCompleted, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Avslutade tasks</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
