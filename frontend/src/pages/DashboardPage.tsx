import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Building2, TrendingUp, DollarSign } from "lucide-react";

const stats = [
  { title: "Totalt kunder", value: "2,420", change: "+12%", icon: Users },
  { title: "Företag", value: "145", change: "+8%", icon: Building2 },
  { title: "Konvertering", value: "24%", change: "+4%", icon: TrendingUp },
  { title: "Intäkter", value: "€45,231", change: "+20%", icon: DollarSign },
];

const recentCustomers = [
  { name: "Anna Andersson", email: "anna@example.com", status: "Aktiv", date: "Idag" },
  { name: "Erik Eriksson", email: "erik@example.com", status: "Ny", date: "Igår" },
  { name: "Maria Svensson", email: "maria@example.com", status: "Aktiv", date: "2 dagar" },
  { name: "Johan Lindberg", email: "johan@example.com", status: "Inaktiv", date: "3 dagar" },
  { name: "Lisa Nilsson", email: "lisa@example.com", status: "Aktiv", date: "4 dagar" },
];

const activities = [
  { user: "Anna A", action: "Skapade ny deal", time: "5 min sedan" },
  { user: "Erik E", action: "Skickade offert", time: "15 min sedan" },
  { user: "Maria S", action: "Uppdaterade kontakt", time: "1 timme sedan" },
  { user: "Johan L", action: "Lade till anteckning", time: "2 timmar sedan" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Välkommen tillbaka, Robert!</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600">{stat.change} från förra månaden</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Customers */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Senaste kunder</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Namn</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tillagd</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCustomers.map((customer) => (
                  <TableRow key={customer.email}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          customer.status === "Aktiv"
                            ? "default"
                            : customer.status === "Ny"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{customer.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {activity.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
