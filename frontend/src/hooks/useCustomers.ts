import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

export interface Customer {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
}

export interface CreateCustomerData {
  name?: string | null;
  email: string;
  phone?: string | null;
  companyId?: number | null;
}

// Hämta alla kunder
export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<Customer[]>("/customers"),
  });
}

// Hämta en kund
export function useCustomer(id: number) {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => api.get<Customer>(`/customers/${id}`),
    enabled: !!id,
  });
}

// Skapa kund
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerData) => api.post<Customer>("/customers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

// Ta bort kund
export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => api.delete(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
