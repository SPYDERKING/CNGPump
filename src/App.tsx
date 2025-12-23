import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";

import MyBookings from "./pages/MyBookings";
import UserDashboard from "./pages/UserDashboard";
import PumpAdminDashboard from "./pages/PumpAdminDashboard";
import SuperAdminPage from "./pages/SuperAdminPage";
import Support from "./pages/Support";
import PaymentHistory from "./pages/PaymentHistory";
import NotFound from "./pages/NotFound";
import RegisterPump from "./pages/pump-owner/RegisterPump";
import Analytics from "./pages/pump-owner/Analytics";
import ApiIntegration from "./pages/pump-owner/ApiIntegration";
import PartnerProgram from "./pages/pump-owner/PartnerProgram";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/pump-admin" element={<PumpAdminDashboard />} />
            <Route path="/register-pump" element={<RegisterPump />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/api-integration" element={<ApiIntegration />} />
            <Route path="/partner-program" element={<PartnerProgram />} />
            <Route path="/super-admin" element={<SuperAdminPage />} />
            <Route path="/support" element={<Support />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
