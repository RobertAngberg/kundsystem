import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./pages/dashboard/DashboardPage";
import CustomersPage from "./pages/kunder/CustomersPage";
import NewCustomerPage from "./pages/kunder/NewCustomerPage";
import EditCustomerPage from "./pages/kunder/EditCustomerPage";
import CustomerDetailPage from "./pages/kunder/CustomerDetailPage";
import CompaniesPage from "./pages/foretag/CompaniesPage";
import NewCompanyPage from "./pages/foretag/NewCompanyPage";
import EditCompanyPage from "./pages/foretag/EditCompanyPage";
import DealsPage from "./pages/deals/DealsPage";
import TasksPage from "./pages/tasks/TasksPage";
import CalendarPage from "./pages/kalender/CalendarPage";
import ReportsPage from "./pages/rapporter/ReportsPage";
import SettingsPage from "./pages/installningar/SettingsPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="customers/new" element={<NewCustomerPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="customers/:id/edit" element={<EditCustomerPage />} />
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="companies/new" element={<NewCompanyPage />} />
              <Route path="companies/:id/edit" element={<EditCompanyPage />} />
              <Route path="deals" element={<DealsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
          <Toaster richColors />
        </AuthProvider>
      </BrowserRouter>
  );
}

export default App;
