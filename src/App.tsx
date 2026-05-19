import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Dashboard from "@/pages/Dashboard";
import NicheResearch from "@/pages/NicheResearch";
import ProductBuilder from "@/pages/ProductBuilder";
import OfferGenerator from "@/pages/OfferGenerator";
import AdAngleGenerator from "@/pages/AdAngleGenerator";
import CopywritingAI from "@/pages/CopywritingAI";
import Sidebar from "@/components/layout/Sidebar";
import Login from "@/pages/Login";
import DeveloperPanel from "@/pages/DeveloperPanel";
import RebrandingPanel from "@/pages/RebrandingPanel";
import { Toaster } from "@/components/ui/sonner";
import { BrandingProvider, useBranding } from "@/contexts/BrandingContext";
import WorkflowWizard from "@/pages/WorkflowWizard";

function AppContent() {
  const [user, setUser] = React.useState<User | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const { config, loading: brandingLoading } = useBranding();

  React.useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  if (authLoading || brandingLoading) return <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground font-heading">
    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center animate-pulse mb-4 overflow-hidden">
      {config.logoUrl ? (
        <img src={config.logoUrl} alt={config.appName} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-black text-2xl">{config.appName.charAt(0)}</span>
      )}
    </div>
    <p className="text-xs font-bold uppercase tracking-[0.3em] animate-pulse">{config.loadingText}</p>
  </div>;

  if (!user) return <Login />;

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-500">
        <Sidebar className="w-64" />
        <main className="flex-1 overflow-y-auto bg-background/50">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wizard/:projectId" element={<WorkflowWizard />} />
            <Route path="/developer" element={<DeveloperPanel />} />
            <Route path="/rebrand" element={<RebrandingPanel />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <Toaster theme="system" closeButton richColors />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <BrandingProvider>
      <AppContent />
    </BrandingProvider>
  );
}
