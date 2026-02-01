import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Filter,
  Briefcase,
} from "lucide-react";
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
  customer: Customer | null;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  priority: string;
  customerId: number | null;
  customer: Customer | null;
  dealId: number | null;
  deal: Deal | null;
  createdAt: string;
}

interface Stats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  dueSoon: number;
}

const priorities = [
  {
    id: "low",
    name: "Låg",
    color: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
  },
  {
    id: "medium",
    name: "Medium",
    color: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950",
  },
  {
    id: "high",
    name: "Hög",
    color: "text-red-600/80 bg-red-50 dark:text-red-400/80 dark:bg-red-950/40",
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // all, pending, completed, overdue
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    dealId: "",
  });

  const fetchTasks = useCallback(async () => {
    try {
      const data = await api.get<Task[]>("/tasks");
      setTasks(data);
    } catch (error) {
      console.error("Kunde inte hämta uppgifter:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDeals = useCallback(async () => {
    try {
      const data = await api.get<Deal[]>("/deals");
      setDeals(data);
    } catch (error) {
      console.error("Kunde inte hämta affärer:", error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.get<Stats>("/tasks/stats");
      setStats(data);
    } catch (error) {
      console.error("Kunde inte hämta statistik:", error);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchDeals();
    fetchStats();
  }, [fetchTasks, fetchDeals, fetchStats]);

  const createTask = async () => {
    if (!newTask.title) return;

    try {
      await api.post("/tasks", {
        title: newTask.title,
        description: newTask.description || null,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
        priority: newTask.priority,
        dealId: newTask.dealId ? parseInt(newTask.dealId) : null,
      });
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        priority: "medium",
        dealId: "",
      });
      setIsDialogOpen(false);
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error("Kunde inte skapa uppgift:", error);
    }
  };

  const toggleComplete = async (taskId: number) => {
    try {
      await api.put(`/tasks/${taskId}/toggle`, {});
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error("Kunde inte uppdatera uppgift:", error);
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm("Är du säker på att du vill ta bort denna uppgift?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
      fetchStats();
    } catch (error) {
      console.error("Kunde inte ta bort uppgift:", error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("sv-SE");
  };

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  };

  const isDueSoon = (task: Task) => {
    if (!task.dueDate || task.completed) return false;
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    return dueDate >= now && dueDate <= threeDays;
  };

  const getPriorityStyle = (priority: string) => {
    return priorities.find((p) => p.id === priority)?.color || "";
  };

  const getPriorityName = (priority: string) => {
    return priorities.find((p) => p.id === priority)?.name || priority;
  };

  const filteredTasks = tasks.filter((task) => {
    switch (filter) {
      case "pending":
        return !task.completed;
      case "completed":
        return task.completed;
      case "overdue":
        return isOverdue(task);
      default:
        return true;
    }
  });

  // Sort: overdue first, then by due date, then by priority
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Completed tasks at the bottom
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Overdue tasks first
    if (isOverdue(a) !== isOverdue(b)) return isOverdue(a) ? -1 : 1;
    // Then by due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (
      (priorityOrder[a.priority as keyof typeof priorityOrder] || 1) -
      (priorityOrder[b.priority as keyof typeof priorityOrder] || 1)
    );
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Uppgifter</h1>
        <p className="text-muted-foreground">Laddar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Uppgifter</h1>
          <p className="text-muted-foreground">Hantera dina att-göra uppgifter och deadlines</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ny uppgift
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Skapa ny uppgift</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titel *</label>
                <Input
                  placeholder="T.ex. Ring kund"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Beskrivning</label>
                <Input
                  placeholder="Detaljer..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Förfallodatum</label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prioritet</label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kopplad affär</label>
                <Select
                  value={newTask.dealId}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, dealId: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Valfritt - välj affär" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ingen affär</SelectItem>
                    {deals.map((deal) => (
                      <SelectItem key={deal.id} value={deal.id.toString()}>
                        {deal.title}{" "}
                        {deal.customer ? `(${deal.customer.name || deal.customer.email})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createTask} className="w-full">
                Skapa uppgift
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
              <CardTitle className="text-sm font-medium">Totalt</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">{stats.completed} avklarade</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pågående</CardTitle>
              <Clock className="h-4 w-4 text-sky-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
                {stats.pending}
              </div>
              <p className="text-xs text-muted-foreground">Väntar på att slutföras</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Försenade</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500/90 dark:text-red-400/80">
                {stats.overdue}
              </div>
              <p className="text-xs text-muted-foreground">Behöver uppmärksamhet</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Snart deadline</CardTitle>
              <Calendar className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats.dueSoon}
              </div>
              <p className="text-xs text-muted-foreground">Inom 3 dagar</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alla uppgifter</SelectItem>
            <SelectItem value="pending">Pågående</SelectItem>
            <SelectItem value="completed">Avklarade</SelectItem>
            <SelectItem value="overdue">Försenade</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {sortedTasks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Inga uppgifter att visa
            </CardContent>
          </Card>
        ) : (
          sortedTasks.map((task) => (
            <Card
              key={task.id}
              className={`${task.completed ? "opacity-60" : ""} ${
                isOverdue(task) ? "border-red-300 dark:border-red-800" : ""
              } ${isDueSoon(task) ? "border-yellow-300 dark:border-yellow-800" : ""}`}
            >
              <CardContent className="flex items-center gap-4 py-3">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleComplete(task.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${
                        task.completed ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {task.title}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${getPriorityStyle(
                        task.priority,
                      )}`}
                    >
                      {getPriorityName(task.priority)}
                    </span>
                    {isOverdue(task) && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                        Försenad
                      </span>
                    )}
                    {isDueSoon(task) && !isOverdue(task) && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-600">
                        Snart
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    {task.description && <span>{task.description}</span>}
                    {task.deal && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {task.deal.title}
                        {task.deal.customer &&
                          ` (${task.deal.customer.name || task.deal.customer.email})`}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
