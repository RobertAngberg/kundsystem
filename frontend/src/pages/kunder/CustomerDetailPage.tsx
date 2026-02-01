import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Plus,
  PhoneCall,
  MessageSquare,
  Users,
  StickyNote,
  Trash2,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/lib/api";

interface Customer {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  companyId: number | null;
  company: { name: string } | null;
  createdAt: string;
}

interface Activity {
  id: number;
  type: string;
  content: string;
  createdAt: string;
}

const activityTypes = [
  { value: "call", label: "Samtal", icon: PhoneCall },
  { value: "email", label: "E-post", icon: MessageSquare },
  { value: "meeting", label: "Möte", icon: Users },
  { value: "note", label: "Anteckning", icon: StickyNote },
];

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newActivity, setNewActivity] = useState({ type: "note", content: "" });
  const [addingActivity, setAddingActivity] = useState(false);

  const fetchCustomer = useCallback(async () => {
    try {
      const data = await api.get<Customer>(`/customers/${id}`);
      setCustomer(data);
    } catch (error) {
      console.error("Kunde inte hämta kund:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchActivities = useCallback(async () => {
    try {
      const data = await api.get<Activity[]>(`/activities?customerId=${id}`);
      setActivities(data);
    } catch (error) {
      console.error("Kunde inte hämta aktiviteter:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
    fetchActivities();
  }, [fetchCustomer, fetchActivities]);

  const addActivity = async () => {
    if (!newActivity.content.trim()) return;

    setAddingActivity(true);
    try {
      const data = await api.post<Activity>("/activities", {
        ...newActivity,
        customerId: parseInt(id!),
      });
      setActivities([data, ...activities]);
      setNewActivity({ type: "note", content: "" });
    } catch (error) {
      console.error("Kunde inte lägga till aktivitet:", error);
    } finally {
      setAddingActivity(false);
    }
  };

  const deleteActivity = async (activityId: number) => {
    try {
      await api.delete(`/activities/${activityId}`);
      setActivities(activities.filter((a) => a.id !== activityId));
    } catch (error) {
      console.error("Kunde inte ta bort aktivitet:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getActivityIcon = (type: string) => {
    const activity = activityTypes.find((a) => a.value === type);
    return activity ? activity.icon : StickyNote;
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
            <h1 className="text-3xl font-bold">Laddar...</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Kunden hittades inte</h1>
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
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-lg">
              {getInitials(customer.name, customer.email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{customer.name || customer.email}</h1>
            <p className="text-muted-foreground">{customer.email}</p>
          </div>
        </div>
        <div className="ml-auto">
          <Button asChild>
            <Link to={`/customers/${id}/edit`}>Redigera</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kundinformation */}
        <Card>
          <CardHeader>
            <CardTitle>Kontaktinformation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${customer.email}`} className="text-sm hover:underline">
                {customer.email}
              </a>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${customer.phone}`} className="text-sm hover:underline">
                  {customer.phone}
                </a>
              </div>
            )}
            {customer.company && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{customer.company.name}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Kund sedan {formatDate(customer.createdAt)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Aktiviteter */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Aktiviteter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Lägg till aktivitet */}
            <div className="flex gap-2">
              <Select
                value={newActivity.type}
                onValueChange={(value) => setNewActivity({ ...newActivity, type: value })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {activityTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Skriv en anteckning..."
                className="flex-1 min-h-[40px] resize-none"
                value={newActivity.content}
                onChange={(e) => setNewActivity({ ...newActivity, content: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addActivity();
                  }
                }}
              />
              <Button onClick={addActivity} disabled={addingActivity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Lista aktiviteter */}
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Inga aktiviteter ännu. Lägg till en ovan!
                </p>
              ) : (
                activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex gap-3 p-3 rounded-lg border">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{activity.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => deleteActivity(activity.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
