import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MainLayout from "@/components/layout/MainLayout";
import Placeholder from "@/pages/Placeholder";
import Create from "./pages/Create";
import MyCampaigns from "./pages/MyCampaigns";
import MyContributions from "./pages/MyContributions";
import CampaignDetails from "./pages/CampaignDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/my-campaigns" element={<MyCampaigns />} />
            <Route path="/my-contributions" element={<MyContributions />} />
            <Route path="/campaigns/:id" element={<CampaignDetails />} />
            <Route path="/create" element={<Create />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

{
  const container = document.getElementById("root");
  // Prevent double createRoot during HMR / hot reloads
  const globalAny: any = window;
  const root = globalAny.__appRoot || createRoot(container!);
  if (!globalAny.__appRoot) globalAny.__appRoot = root;
  root.render(<App />);
}
