import React from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  ShieldCheck, 
  Settings, 
  Lock, 
  Database, 
  Cpu, 
  Workflow, 
  Layout, 
  BrainCircuit,
  Save,
  Loader2,
  RefreshCcw,
  Key
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export default function DeveloperPanel() {
  const { config, updateConfig } = useBranding();
  const [password, setPassword] = React.useState("");
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("security");
  const [localConfig, setLocalConfig] = React.useState(config);

  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const toggleFeature = (feature: string) => {
    setLocalConfig({
      ...localConfig,
      featureFlags: {
        ...localConfig.featureFlags,
        [feature as keyof typeof localConfig.featureFlags]: !localConfig.featureFlags[feature as keyof typeof localConfig.featureFlags]
      }
    });
  };

  const updatePrompt = (key: string, value: string) => {
    setLocalConfig({
      ...localConfig,
      aiPrompts: {
        ...localConfig.aiPrompts,
        [key]: value
      }
    });
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === config.developerPassword) {
      setIsAuthenticated(true);
      toast.success("Welcome back, Developer");
    } else {
      toast.error("Invalid developer password");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateConfig(localConfig);
      toast.success("System configurations updated");
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-slate-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-white/10 bg-slate-900 text-white overflow-hidden shadow-2xl">
            <CardHeader className="bg-slate-800/50 p-8 border-b border-white/5">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">System Access</CardTitle>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Authorized Developer Personnel Only</p>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Developer Encryption Key</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••" 
                      className="h-14 pl-12 bg-black/50 border-white/5 text-white focus-visible:ring-primary rounded-xl"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                  Access Mainframe
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-12 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 text-primary mb-2">
              <Cpu className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Developer Environment</span>
           </div>
           <h1 className="text-5xl font-heading font-black tracking-tighter uppercase italic">System Control Center</h1>
           <p className="text-muted-foreground mt-2 font-medium">Fine-tune AI behavior, security protocols, and system-wide defaults.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" onClick={() => setLocalConfig(config)} className="h-12 px-6 rounded-xl border-border font-black uppercase tracking-widest text-xs gap-2">
              <RefreshCcw className="w-4 h-4" /> Reset
           </Button>
           <Button onClick={handleSave} disabled={loading} className="h-12 px-8 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Deploy</>}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-4">
           <div className="sticky top-10 space-y-2">
              {[
                { id: "security", label: "Security & Access", icon: Key },
                { id: "ai", label: "AI & Intelligence", icon: BrainCircuit },
                { id: "workflow", label: "Core Workflow", icon: Workflow },
                { id: "branding", label: "Global Branding", icon: Layout },
                { id: "infra", label: "Infrastructure", icon: Database },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all group",
                    activeTab === item.id 
                      ? "bg-primary border-primary shadow-lg shadow-primary/20" 
                      : "bg-white border-border hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                   <div className={cn(
                     "w-10 h-10 rounded-xl flex items-center justify-center transition-transform",
                     activeTab === item.id ? "bg-white/20 scale-110" : "bg-slate-100 group-hover:scale-110"
                   )}>
                      <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-slate-600")} />
                   </div>
                   <span className={cn(
                     "text-xs font-black uppercase tracking-widest",
                     activeTab === item.id ? "text-white" : "text-slate-700"
                   )}>{item.label}</span>
                </button>
              ))}
           </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
           {activeTab === "security" && (
             <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="p-8 bg-slate-50 border-b border-border">
                   <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                      <Key className="w-5 h-5 text-primary" /> Security Configuration
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Developer Password</Label>
                         <Input 
                          type="password"
                          value={localConfig.developerPassword} 
                          onChange={(e) => setLocalConfig({...localConfig, developerPassword: e.target.value})}
                          className="h-12 bg-slate-50 rounded-xl border-border"
                         />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rebranding Password</Label>
                         <Input 
                          type="password"
                          value={localConfig.rebrandingPassword} 
                          onChange={(e) => setLocalConfig({...localConfig, rebrandingPassword: e.target.value})}
                          className="h-12 bg-slate-50 rounded-xl border-border"
                         />
                      </div>
                   </div>
                </CardContent>
             </Card>
           )}

           {activeTab === "ai" && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden">
                  <CardHeader className="p-8 bg-slate-50 border-b border-border">
                     <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                        <BrainCircuit className="w-5 h-5 text-primary" /> AI Personality
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Assistant Name</Label>
                           <Input 
                            value={localConfig.aiAssistantName} 
                            onChange={(e) => setLocalConfig({...localConfig, aiAssistantName: e.target.value})}
                            className="h-12 bg-slate-100/50 border-border rounded-xl"
                           />
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Brand Voice Preset</Label>
                           <Input 
                            value={localConfig.brandVoice} 
                            onChange={(e) => setLocalConfig({...localConfig, brandVoice: e.target.value})}
                            className="h-12 bg-slate-100/50 border-border rounded-xl"
                           />
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden">
                  <CardHeader className="p-8 bg-slate-50 border-b border-border">
                     <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                        <Settings className="w-5 h-5 text-primary" /> AI Prompt Overrides
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                     <div className="grid gap-6">
                        {["STRATEGY_GEN", "COPY_GEN", "VISUAL_GEN"].map((key) => (
                          <div key={key} className="space-y-2">
                             <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{key} Prompt</Label>
                             <textarea 
                              value={localConfig.aiPrompts[key] || ""} 
                              onChange={(e) => updatePrompt(key, e.target.value)}
                              placeholder="Leave empty to use system default..."
                              className="w-full min-h-[100px] p-4 bg-slate-50 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                             />
                          </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>
             </div>
           )}

           {activeTab === "workflow" && (
             <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardHeader className="p-8 bg-slate-50 border-b border-border">
                   <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                      <Workflow className="w-5 h-5 text-primary" /> Feature Management
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(localConfig.featureFlags).map((flag) => (
                        <div key={flag} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-slate-50/50">
                           <span className="text-xs font-black uppercase tracking-widest text-slate-700">{flag.replace('enable', '')} Module</span>
                           <Button 
                             onClick={() => toggleFeature(flag)}
                             variant={localConfig.featureFlags[flag] ? "default" : "outline"}
                             className={cn("h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest", localConfig.featureFlags[flag] ? "bg-emerald-500 text-white" : "border-slate-200 opacity-40")}
                           >
                             {localConfig.featureFlags[flag] ? "Active" : "Disabled"}
                           </Button>
                        </div>
                      ))}
                   </div>
                </CardContent>
             </Card>
           )}

           {/* More sections can be added here */}
        </div>
      </div>
    </div>
  );
}
