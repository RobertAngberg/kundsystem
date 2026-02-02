import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCustomers, useDeleteCustomer, useCreateCustomer } from "@/hooks/useCustomers";
import { api } from "@/lib/api";

interface Company {
  id: number;
  name: string;
}

const ITEMS_PER_PAGE = 10;

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    companyId: "",
  });

  const { data: customers = [], isLoading, error } = useCustomers();
  const deleteCustomerMutation = useDeleteCustomer();
  const createCustomerMutation = useCreateCustomer();

  const fetchCompanies = useCallback(async () => {
    try {
      const data = await api.get<Company[]>("/companies");
      setCompanies(data);
    } catch (err) {
      console.error("Kunde inte hämta företag:", err);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const createCustomer = async () => {
    if (!newCustomer.email) return;

    createCustomerMutation.mutate(
      {
        name: newCustomer.name || null,
        email: newCustomer.email,
        phone: newCustomer.phone || null,
        companyId: newCustomer.companyId ? parseInt(newCustomer.companyId) : null,
      },
      {
        onSuccess: () => {
          setNewCustomer({ name: "", email: "", phone: "", companyId: "" });
          setIsDialogOpen(false);
        },
      },
    );
  };

  const deleteCustomer = async (id: number) => {
    if (!confirm("Är du säker på att du vill ta bort denna kund?")) return;
    deleteCustomerMutation.mutate(id);
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

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = search.toLowerCase();
    if (!searchLower) return true;
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset till sida 1 om sökning ändras
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kunder</h1>
          <p className="text-muted-foreground">Hantera dina kundrelationer</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Lägg till kund
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lägg till ny kund</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Namn</label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">E-post *</label>
                <Input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefon</label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Företag</label>
                <Select
                  value={newCustomer.companyId || "none"}
                  onValueChange={(value) =>
                    setNewCustomer({ ...newCustomer, companyId: value === "none" ? "" : value })
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
              <Button onClick={createCustomer} className="w-full">
                Lägg till kund
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alla kunder ({filteredCustomers.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Sök kunder..."
                className="pl-8"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center">Laddar...</p>
          ) : error ? (
            <p className="text-destructive py-8 text-center">
              Kunde inte hämta kunder. Försök igen senare.
            </p>
          ) : filteredCustomers.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              {search ? (
                "Inga kunder matchade sökningen."
              ) : (
                <>
                  Inga kunder ännu.{" "}
                  <button
                    onClick={() => setIsDialogOpen(true)}
                    className="text-primary hover:underline"
                  >
                    Lägg till din första kund
                  </button>
                </>
              )}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kund</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Kontakt</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Link
                        to={`/customers/${customer.id}`}
                        className="flex items-center gap-3 hover:opacity-80"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {getInitials(customer.name, customer.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.name || "—"}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>{customer.phone || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <a href={`mailto:${customer.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                        {customer.phone && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={`tel:${customer.phone}`}>
                              <Phone className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/customers/${customer.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Redigera
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteCustomer(customer.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Ta bort
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Visar {startIndex + 1}-
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredCustomers.length)} av{" "}
              {filteredCustomers.length} kunder
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Föregående
              </Button>
              <span className="text-sm text-muted-foreground">
                Sida {currentPage} av {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Nästa
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
