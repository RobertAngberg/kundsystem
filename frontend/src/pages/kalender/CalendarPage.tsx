import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckSquare,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";

interface Task {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  completed: boolean;
  priority: string;
  customer?: { name: string | null; email: string } | null;
  deal?: { title: string } | null;
}

interface Deal {
  id: number;
  title: string;
  value: number;
  stage: string;
  closedAt: string | null;
  customer?: { name: string | null; email: string } | null;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "task" | "deal";
  priority?: string;
  completed?: boolean;
  value?: number;
  stage?: string;
  data: Task | Deal;
}

const WEEKDAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
const MONTHS = [
  "Januari",
  "Februari",
  "Mars",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "Augusti",
  "September",
  "Oktober",
  "November",
  "December",
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const [tasks, deals] = await Promise.all([
        api.get<Task[]>("/tasks"),
        api.get<Deal[]>("/deals"),
      ]);

      const calendarEvents: CalendarEvent[] = [];

      // Tasks med dueDate
      tasks.forEach((task) => {
        if (task.dueDate) {
          calendarEvents.push({
            id: `task-${task.id}`,
            title: task.title,
            date: new Date(task.dueDate),
            type: "task",
            priority: task.priority,
            completed: task.completed,
            data: task,
          });
        }
      });

      // Deals med closedAt (deadline)
      deals.forEach((deal) => {
        if (deal.closedAt) {
          calendarEvents.push({
            id: `deal-${deal.id}`,
            title: deal.title,
            date: new Date(deal.closedAt),
            type: "deal",
            value: deal.value,
            stage: deal.stage,
            data: deal,
          });
        }
      });

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Justera för måndag-start (0 = måndag, 6 = söndag)
    let startingDay = firstDay.getDay() - 1;
    if (startingDay < 0) startingDay = 6;

    const days: (number | null)[] = [];

    // Tomma dagar före
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Dagar i månaden
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === year &&
        eventDate.getMonth() === month &&
        eventDate.getDate() === day
      );
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: number) => {
    const eventsForDay = getEventsForDay(day);
    if (eventsForDay.length > 0) {
      setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      setSelectedEvents(eventsForDay);
      setDialogOpen(true);
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const isPastDay = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return checkDate < today;
  };

  const days = getDaysInMonth(currentDate);

  // Statistik
  const thisMonthEvents = events.filter((e) => {
    const eventDate = new Date(e.date);
    return (
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const tasksThisMonth = thisMonthEvents.filter((e) => e.type === "task");
  const dealsThisMonth = thisMonthEvents.filter((e) => e.type === "deal");
  const overdueEvents = thisMonthEvents.filter(
    (e) => e.type === "task" && !e.completed && isPastDay(new Date(e.date).getDate()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kalender</h1>
          <p className="text-muted-foreground">Se dina uppgifter och deadlines</p>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/10 p-3">
                <CheckSquare className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tasksThisMonth.length}</p>
                <p className="text-xs text-muted-foreground">Uppgifter denna månad</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-emerald-500/10 p-3">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dealsThisMonth.length}</p>
                <p className="text-xs text-muted-foreground">Deals med deadline</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-500/10 p-3">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {tasksThisMonth.filter((t) => !t.completed).length}
                </p>
                <p className="text-xs text-muted-foreground">Ej klara uppgifter</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-500/10 p-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overdueEvents.length}</p>
                <p className="text-xs text-muted-foreground">Försenade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kalender */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              Idag
            </Button>
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Laddar...</p>
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Veckodagar */}
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-sm font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}

              {/* Dagar */}
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="h-24" />;
                }

                const dayEvents = getEventsForDay(day);
                const hasEvents = dayEvents.length > 0;
                const hasOverdue = dayEvents.some(
                  (e) => e.type === "task" && !e.completed && isPastDay(day),
                );

                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`relative h-24 rounded-lg border p-1 transition-colors ${
                      hasEvents ? "cursor-pointer hover:bg-muted/50" : ""
                    } ${isToday(day) ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                        isToday(day)
                          ? "bg-primary text-primary-foreground font-bold"
                          : isPastDay(day)
                            ? "text-muted-foreground"
                            : ""
                      }`}
                    >
                      {day}
                    </span>

                    {/* Events */}
                    <div className="mt-1 space-y-0.5 overflow-hidden">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`truncate rounded px-1 py-0.5 text-xs ${
                            event.type === "task"
                              ? event.completed
                                ? "bg-emerald-500/20 text-emerald-700 line-through"
                                : hasOverdue && !event.completed
                                  ? "bg-red-500/20 text-red-700"
                                  : "bg-blue-500/20 text-blue-700"
                              : "bg-purple-500/20 text-purple-700"
                          }`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-xs text-muted-foreground px-1">
                          +{dayEvents.length - 2} till
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Färgförklaring */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-blue-500/20" />
          <span className="text-muted-foreground">Uppgift</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-emerald-500/20" />
          <span className="text-muted-foreground">Klar uppgift</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-red-500/20" />
          <span className="text-muted-foreground">Försenad</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded bg-purple-500/20" />
          <span className="text-muted-foreground">Deal deadline</span>
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedDate?.toLocaleDateString("sv-SE", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedEvents.map((event) => (
              <div
                key={event.id}
                className={`rounded-lg border p-3 ${
                  event.type === "task"
                    ? event.completed
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-blue-500/30 bg-blue-500/5"
                    : "border-purple-500/30 bg-purple-500/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {event.type === "task" ? (
                      <CheckSquare
                        className={`h-4 w-4 ${event.completed ? "text-emerald-500" : "text-blue-500"}`}
                      />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                    )}
                    <span className={`font-medium ${event.completed ? "line-through" : ""}`}>
                      {event.title}
                    </span>
                  </div>
                  <Badge
                    variant={
                      event.type === "task"
                        ? event.completed
                          ? "default"
                          : "secondary"
                        : "outline"
                    }
                  >
                    {event.type === "task"
                      ? event.completed
                        ? "Klar"
                        : event.priority === "high"
                          ? "Hög prio"
                          : event.priority === "medium"
                            ? "Medium"
                            : "Låg prio"
                      : event.stage}
                  </Badge>
                </div>

                {event.type === "task" && (event.data as Task).description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {(event.data as Task).description}
                  </p>
                )}

                {event.type === "deal" && (
                  <p className="mt-2 text-sm font-medium text-purple-600">
                    {(event.data as Deal).value.toLocaleString("sv-SE")} kr
                  </p>
                )}

                {event.type === "task" && (event.data as Task).customer && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Kund:{" "}
                    {(event.data as Task).customer?.name || (event.data as Task).customer?.email}
                  </p>
                )}

                {event.type === "deal" && (event.data as Deal).customer && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Kund:{" "}
                    {(event.data as Deal).customer?.name || (event.data as Deal).customer?.email}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" asChild>
              <Link to="/tasks">Gå till uppgifter</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/deals">Gå till deals</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
