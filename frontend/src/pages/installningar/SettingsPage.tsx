import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { api } from "@/lib/api";
import {
  User,
  Lock,
  Bell,
  Palette,
  LogOut,
  Loader2,
  Sun,
  Moon,
  Users,
  Building2,
  Crown,
  UserPlus,
  Eye,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
}

interface Team {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  members: TeamMember[];
  _count: {
    customers: number;
    companies: number;
    deals: number;
    tasks: number;
  };
}

interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  teamId: number | null;
}

const roleLabels: Record<string, string> = {
  admin: "Administratör",
  sales: "Säljare",
  viewer: "Läsbehörighet",
};

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Crown className="h-3 w-3" />,
  sales: <Briefcase className="h-3 w-3" />,
  viewer: <Eye className="h-3 w-3" />,
};

const roleBadgeVariants: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  sales: "secondary",
  viewer: "outline",
};

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.user_metadata?.name || "");
  const [saving, setSaving] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Team state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamSlug, setNewTeamSlug] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  useEffect(() => {
    fetchProfileAndTeam();
  }, [user?.id]);

  const fetchProfileAndTeam = async () => {
    if (!user?.id) return;
    setLoadingTeam(true);
    try {
      const profileData = await api.get<Profile>(`/auth/profile/${user.id}`);
      setProfile(profileData);
      setName(profileData.name || "");

      if (profileData.teamId) {
        const teamData = await api.get<Team>(`/teams/${profileData.teamId}`);
        setTeam(teamData);
      }
    } catch (error) {
      console.error("Error fetching profile/team:", error);
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await api.put(`/auth/profile/${user.id}`, { name });
      toast.success("Profilen har sparats");
      fetchProfileAndTeam();
    } catch {
      toast.error("Kunde inte spara profilen");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm("Är du säker på att du vill logga ut?")) {
      await signOut();
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName || !newTeamSlug) {
      toast.error("Fyll i namn och slug");
      return;
    }
    setCreatingTeam(true);
    try {
      await api.post("/teams", {
        name: newTeamName,
        slug: newTeamSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      });
      toast.success("Team skapat!");
      setCreateTeamOpen(false);
      setNewTeamName("");
      setNewTeamSlug("");
      fetchProfileAndTeam();
    } catch {
      toast.error("Kunde inte skapa team");
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    if (!team) return;
    try {
      await api.put(`/teams/${team.id}/members/${memberId}/role`, { role: newRole });
      toast.success("Roll uppdaterad");
      fetchProfileAndTeam();
    } catch {
      toast.error("Kunde inte uppdatera rollen");
    }
  };

  const isAdmin = profile?.role === "admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inställningar</h1>
        <p className="text-muted-foreground">Hantera ditt konto och inställningar</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profil */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profil</CardTitle>
            </div>
            <CardDescription>Din kontoinformation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>E-post</Label>
              <Input value={user?.email || ""} disabled />
              <p className="text-xs text-muted-foreground">E-postadressen kan inte ändras</p>
            </div>
            <div className="space-y-2">
              <Label>Namn</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ditt namn"
              />
            </div>
            <div className="space-y-2">
              <Label>Roll</Label>
              <div className="flex items-center gap-2">
                <Badge variant={roleBadgeVariants[profile?.role || "viewer"]}>
                  {roleIcons[profile?.role || "viewer"]}
                  <span className="ml-1">{roleLabels[profile?.role || "viewer"]}</span>
                </Badge>
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Spara ändringar
            </Button>
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Team</CardTitle>
            </div>
            <CardDescription>
              {team ? "Ditt team och medlemmar" : "Du tillhör inget team ännu"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingTeam ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : team ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{team.name}</p>
                    <p className="text-sm text-muted-foreground">/{team.slug}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 rounded-lg bg-muted/50 p-3">
                  <div className="text-center">
                    <p className="text-lg font-bold">{team._count.customers}</p>
                    <p className="text-xs text-muted-foreground">Kunder</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{team._count.companies}</p>
                    <p className="text-xs text-muted-foreground">Företag</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{team._count.deals}</p>
                    <p className="text-xs text-muted-foreground">Deals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{team._count.tasks}</p>
                    <p className="text-xs text-muted-foreground">Uppgifter</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="mb-2 text-sm font-medium">Medlemmar ({team.members.length})</p>
                  <div className="space-y-2">
                    {team.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border p-2"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {(member.name || member.email).substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {member.name || member.email}
                              {member.id === user?.id && (
                                <span className="ml-1 text-xs text-muted-foreground">(du)</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        {isAdmin && member.id !== user?.id ? (
                          <Select
                            value={member.role}
                            onValueChange={(value) => handleUpdateMemberRole(member.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Crown className="h-3 w-3" />
                                  Admin
                                </div>
                              </SelectItem>
                              <SelectItem value="sales">
                                <div className="flex items-center gap-2">
                                  <Briefcase className="h-3 w-3" />
                                  Säljare
                                </div>
                              </SelectItem>
                              <SelectItem value="viewer">
                                <div className="flex items-center gap-2">
                                  <Eye className="h-3 w-3" />
                                  Läsare
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={roleBadgeVariants[member.role]}>
                            {roleIcons[member.role]}
                            <span className="ml-1">{roleLabels[member.role]}</span>
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Skapa ett team för att samarbeta med kollegor
                </p>
                <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Skapa team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Skapa nytt team</DialogTitle>
                      <DialogDescription>
                        Skapa ett team och bjud in kollegor för att samarbeta
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Teamnamn</Label>
                        <Input
                          value={newTeamName}
                          onChange={(e) => {
                            setNewTeamName(e.target.value);
                            setNewTeamSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                          }}
                          placeholder="Mitt säljteam"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>URL-slug</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">/</span>
                          <Input
                            value={newTeamSlug}
                            onChange={(e) => setNewTeamSlug(e.target.value)}
                            placeholder="mitt-saljteam"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Används i URL:er, bara små bokstäver och bindestreck
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateTeamOpen(false)}>
                        Avbryt
                      </Button>
                      <Button onClick={handleCreateTeam} disabled={creatingTeam}>
                        {creatingTeam && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Skapa team
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Utseende */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>Utseende</CardTitle>
            </div>
            <CardDescription>Anpassa utseendet på applikationen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <div>
                  <p className="font-medium">Mörkt tema</p>
                  <p className="text-sm text-muted-foreground">Växla mellan ljust och mörkt</p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifikationer */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifikationer</CardTitle>
            </div>
            <CardDescription>Hantera hur du vill bli notifierad</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">E-postnotifikationer</p>
                <p className="text-sm text-muted-foreground">Få påminnelser via e-post</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Konto */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>Konto</CardTitle>
            </div>
            <CardDescription>Kontoåtgärder</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Logga ut</p>
                <p className="text-sm text-muted-foreground">Logga ut från ditt konto</p>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Logga ut
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
