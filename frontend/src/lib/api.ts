import { supabase } from "./supabase";

const API_URL = "http://localhost:3000";

// API-klient som automatiskt skickar JWT-token med varje request
async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    };
  }

  return {
    "Content-Type": "application/json",
  };
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, { headers });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  async delete(endpoint: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  },
};
