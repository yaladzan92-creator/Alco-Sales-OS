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
import Onboarding from "@/pages/Onboarding";
import Sidebar from "@/components/layout/Sidebar";
import Login from "@/pages/Login";
import DeveloperPanel from "@/pages/DeveloperPanel";
import RebrandingPanel from "@/pages/RebrandingPanel";
import { Toaster } from "@/components/ui/sonner";
import { BrandingProvider, useBranding } from "@/contexts/BrandingContext";
import WorkflowWizard from "@/pages/WorkflowWizard";
import { getUserConfig } from "@/services/aiService";

function AppContent() {
  const [user, setUser] = React.useState<User | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [onboardingStatus, setOnboardingStatus] = React.useState<{ complete: boolean; loading: boolean }>({ complete: false, loading: true });
  const { config, loading: brandingLoading } = useBranding();

  React.useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      
      if (u) {
        try {
          const cfg = await getUserConfig();
          setOnboardingStatus({ complete: cfg.onboardingComplete, loading: false });
        } catch (e) {
          console.error("Config fetch error:", e);
          setOnboardingStatus({ complete: false, loading: false });
        }
      } else {
        setOnboardingStatus({ complete: false, loading: false });
      }
    });
  }, []);

  if (authLoading || brandingLoading || onboardingStatus.loading) return <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground font-heading">
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
      {!onboardingStatus.complete ? (
        <Routes>
          <Route path="*" element={<Onboarding />} />
        </Routes>
      ) : (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-500">
          <Sidebar className="w-64" />
          <main className="flex-1 overflow-y-auto bg-background/50">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wizard/:projectId" element={<WorkflowWizard />} />
              <Route path="/developer" element={<DeveloperPanel />} />
              <Route path="/rebrand" element={<RebrandingPanel />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      )}
      <Toaster theme="system" closeButton richColors />
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
