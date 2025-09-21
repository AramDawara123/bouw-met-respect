
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import NewsletterPopup from "./components/NewsletterPopup";
import Index from "./pages/Index";
import AlgemeneVoorwaarden from "./pages/AlgemeneVoorwaarden";
import Webshop from "./pages/Webshop";
import MembershipSuccess from "./pages/MembershipSuccess";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import CompanyProfiles from "./pages/CompanyProfiles";
import PartnerDashboard from "./pages/PartnerDashboard";
import PartnershipSuccess from "./pages/PartnershipSuccess";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== '/webshop' && location.pathname !== '/login' && location.pathname !== '/partner-dashboard';
  
  return (
    <div className="overflow-x-hidden min-h-screen">
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/algemene-voorwaarden" element={<AlgemeneVoorwaarden />} />
        <Route path="/webshop" element={<Webshop />} />
        <Route path="/membership-success" element={<MembershipSuccess />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onze-partners" element={<CompanyProfiles />} />
        <Route path="/partner-dashboard" element={<PartnerDashboard />} />
        <Route path="/partnership-success" element={<PartnershipSuccess />} />
        
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <NewsletterPopup />
    </div>
  );
};

const App = () => {
  console.log('App component initializing');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
