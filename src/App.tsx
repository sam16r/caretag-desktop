import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { I18nProvider } from "@/hooks/useI18n";
import { AppLayout } from "@/components/layout/AppLayout";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Appointments from "./pages/Appointments";
import Emergency from "./pages/Emergency";
import Records from "./pages/Records";
import Prescriptions from "./pages/Prescriptions";
import Reports from "./pages/Reports";
import Devices from "./pages/Devices";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import ScanCareTag from "./pages/ScanCareTag";
import CenterTemplates from "./pages/CenterTemplates";
import CenterStaff from "./pages/CenterStaff";
import CenterBranches from "./pages/CenterBranches";
import HospitalStaff from "./pages/HospitalStaff";
import HospitalDepartments from "./pages/HospitalDepartments";
import HospitalBranches from "./pages/HospitalBranches";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <HashRouter>
          <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/"
                element={
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                }
              />
              <Route
                path="/patients"
                element={
                  <AppLayout>
                    <Patients />
                  </AppLayout>
                }
              />
              <Route
                path="/patients/:id"
                element={
                  <AppLayout>
                    <PatientDetail />
                  </AppLayout>
                }
              />
              <Route
                path="/appointments"
                element={
                  <AppLayout>
                    <Appointments />
                  </AppLayout>
                }
              />
              <Route
                path="/emergency"
                element={
                  <AppLayout>
                    <Emergency />
                  </AppLayout>
                }
              />
              <Route
                path="/records"
                element={
                  <AppLayout>
                    <Records />
                  </AppLayout>
                }
              />
              <Route
                path="/prescriptions"
                element={
                  <AppLayout>
                    <Prescriptions />
                  </AppLayout>
                }
              />
              <Route
                path="/reports"
                element={
                  <AppLayout>
                    <Reports />
                  </AppLayout>
                }
              />
              <Route
                path="/devices"
                element={
                  <AppLayout>
                    <Devices />
                  </AppLayout>
                }
              />
              <Route
                path="/settings"
                element={
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                }
              />
              <Route
                path="/analytics"
                element={
                  <AppLayout>
                    <Analytics />
                  </AppLayout>
                }
              />
              <Route
                path="/center/templates"
                element={
                  <AppLayout>
                    <CenterTemplates />
                  </AppLayout>
                }
              />
              <Route
                path="/center/staff"
                element={
                  <AppLayout>
                    <CenterStaff />
                  </AppLayout>
                }
              />
              <Route
                path="/center/branches"
                element={
                  <AppLayout>
                    <CenterBranches />
                  </AppLayout>
                }
              />
              <Route
                path="/hospital/staff"
                element={
                  <AppLayout>
                    <HospitalStaff />
                  </AppLayout>
                }
              />
              <Route
                path="/hospital/departments"
                element={
                  <AppLayout>
                    <HospitalDepartments />
                  </AppLayout>
                }
              />
              <Route
                path="/hospital/branches"
                element={
                  <AppLayout>
                    <HospitalBranches />
                  </AppLayout>
                }
              />
              <Route path="/scan" element={<ScanCareTag />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </HashRouter>
          </TooltipProvider>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
