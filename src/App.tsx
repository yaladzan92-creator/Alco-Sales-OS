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
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-[#050505] text-white">Loading OS...</div>;

  if (!user) return <Login />;

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
        <Sidebar className="w-64 border-r border-white/10" />
        <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/niche" element={<NicheResearch />} />
            <Route path="/products" element={<ProductBuilder />} />
            <Route path="/offers" element={<OfferGenerator />} />
            <Route path="/angles" element={<AdAngleGenerator />} />
            <Route path="/copy" element={<CopywritingAI />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <Toaster theme="dark" />
      </div>
    </BrowserRouter>
  );
}
