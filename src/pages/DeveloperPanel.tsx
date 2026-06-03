import React from "react";
import { useBranding, AppConfig } from "@/contexts/BrandingContext";
import { generateAIContent } from "@/services/aiService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Key,
  Palette,
  Type,
  Monitor,
  Globe,
  Share2,
  History,
  Trash2,
  ChevronRight,
  Sparkles,
  Zap,
  Eye,
  SmilePlus
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

export default function DeveloperPanel() {
  const { config, updateConfig } = useBranding();
  const [password, setPassword] = React.useState("");
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [accessLevel, setAccessLevel] = React.useState<"full" | "branding">("full");
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("branding");
  const [localConfig, setLocalConfig] = React.useState(config);

  // Diagnostics Chatbot states & helpers
  const [chatMessages, setChatMessages] = React.useState<any[]>([]);
  const [customInput, setCustomInput] = React.useState("");
  const [isThinking, setIsThinking] = React.useState(false);
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleSendPreset = async (promptContent: string) => {
    if (isThinking) return;
    const newMsg = { role: "user", content: promptContent, timestamp: new Date() };
    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    setIsThinking(true);
    scrollToBottom();

    try {
      const systemPrompt = `
Anda adalah Alco Developer Diagnostics Assistant, asisten AI teknis senior yang sangat cerdas dan tahu segalanya tentang arsitektur internal project Alco. 
Tujuan Anda: Membantu tim developer Alco melakukan diagnosis kode, pengujian API Gemini, analisis skema Firestore database, debugging error React+Vite, dan pemeliharaan sistem. 

Pedoman Penting:
1. Jawablah sebagai insinyur perangkat lunak senior yang andal dan penuh ketelitian teknis tinggi.
2. Anda tahu bahwa project ini menggunakan Firebase Firestore untuk database ('projects', 'userSettings', dll.), Firebase Authentication, Express backend untuk proxy, dan React + Tailwind untuk antrean frontend.
3. Bantu developer membayangkan integrasi, mendesain snippet kode TypeScript yang andal, mendiagnosis kegagalan, dan memecahkan masalah.
4. Jaga agar tanggapan Anda selalu ramah, profesional, ringkas, dan sarat akan wawasan teknis.
`;
      const res = await generateAIContent(promptContent, systemPrompt);
      const textResponse = (res && typeof res === "object" && "text" in res) ? (res as any).text : res;
      setChatMessages(prev => [...prev, { role: "assistant", content: textResponse, timestamp: new Date() }]);
    } catch (err: any) {
      toast.error("Alat diagnos terputus / error.");
      setChatMessages(prev => [...prev, { role: "assistant", content: `Error executing diagnostic instruction: ${err.message || 'Unknown network error'}`, timestamp: new Date() }]);
    } finally {
      setIsThinking(false);
      scrollToBottom();
    }
  };

  const handleSendCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() || isThinking) return;
    const content = customInput;
    setCustomInput("");
    handleSendPreset(content);
  };

  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  React.useEffect(() => {
    if (localStorage.getItem("alco_developer_mode_active") === "true") {
      setIsAuthenticated(true);
      setAccessLevel("full");
    }
  }, []);

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
      setAccessLevel("full");
      localStorage.setItem("alco_developer_mode_active", "true");
      window.dispatchEvent(new Event("alco_developer_auth_changed"));
      toast.success("Welcome back, Master Developer");
    } else {
      toast.error("Invalid developer encryption key");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Create rollback checkpoint
      const finalConfig = {
        ...localConfig,
        rollbackConfig: config
      };
      await updateConfig(finalConfig);
      toast.success("System configurations applied system-wide");
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  const rollback = async () => {
    if (!config.rollbackConfig) {
      toast.error("No rollback point available");
      return;
    }
    if (confirm("Rollback to previous configuration?")) {
      setLoading(true);
      try {
        await updateConfig(config.rollbackConfig as AppConfig);
        toast.success("Rolled back successfully");
      } catch (e) {
        toast.error("Rollback failed");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full min-h-screen flex items-center justify-center p-6 bg-slate-950">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-white/10 bg-slate-900 text-white overflow-hidden shadow-2xl rounded-[3rem]">
            <CardHeader className="bg-slate-800/50 p-10 border-b border-white/5 text-center">
              <div className="w-20 h-20 bg-primary/20 rounded-[2rem] flex items-center justify-center mb-6 border border-primary/30 mx-auto shadow-xl shadow-primary/10">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-heading font-black tracking-tight italic uppercase">Master Control</CardTitle>
              <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em] mt-2">Authentication Required</p>
            </CardHeader>
            <CardContent className="p-10">
              <form onSubmit={handleAuth} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Developer Encryption Key</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••" 
                      className="h-16 pl-12 bg-black/50 border-white/5 text-white focus-visible:ring-primary rounded-2xl text-lg tracking-widest"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-16 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20">
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
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar Control */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-border p-6 px-10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer" onClick={() => window.location.href = '/'}>
               <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
               <h1 className="text-2xl font-heading font-black tracking-tight uppercase italic leading-none">
                  {accessLevel === "full" ? "Developer Mode" : "Brand Editor"}
               </h1>
               <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                     {accessLevel === "full" ? "Master Admin Session" : "Branding Session Active"}
                  </p>
               </div>
            </div>
         </div>

         <div className="flex gap-3">
            {accessLevel === "full" && (
              <Button 
                variant="outline" 
                onClick={rollback} 
                disabled={loading || !config.rollbackConfig}
                className="h-12 px-6 rounded-2xl border-border font-black uppercase tracking-widest text-[10px] gap-2 hover:bg-orange-50 hover:text-orange-600 transition-all"
              >
                 <History className="w-4 h-4" /> Rollback
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="h-12 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Apply Changes</>}
            </Button>
         </div>
      </header>

      <div className="max-w-7xl mx-auto p-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
         {/* Sidebar Navigation */}
         <div className="lg:col-span-3 space-y-2">
            {[
              { id: "branding", label: "White Label", icon: Palette, show: true },
              { id: "ai", label: "AI & Intelligence", icon: BrainCircuit, show: accessLevel === "full" },
              { id: "workflow", label: "Core Workflow", icon: Workflow, show: accessLevel === "full" },
              { id: "security", label: "Security & Role", icon: Key, show: accessLevel === "full" },
              { id: "infra", label: "Infrastructure", icon: Database, show: accessLevel === "full" },
              { id: "diagnostic", label: "Asisten Diagnostik AI", icon: Sparkles, show: accessLevel === "full" },
            ].filter(item => item.show).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all group relative overflow-hidden",
                  activeTab === item.id 
                    ? "bg-primary border-primary shadow-lg shadow-primary/30 text-white" 
                    : "bg-white border-border hover:border-primary/50 hover:bg-primary/5 text-slate-700"
                )}
              >
                 <div className={cn(
                   "w-10 h-10 rounded-xl flex items-center justify-center transition-transform",
                   activeTab === item.id ? "bg-white/20 scale-110" : "bg-slate-100 group-hover:scale-110"
                 )}>
                    <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-slate-600")} />
                 </div>
                 <div className="flex flex-col items-start">
                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                    <span className={cn("text-[8px] font-bold uppercase tracking-widest opacity-40", activeTab === item.id && "opacity-70")}>Configure</span>
                 </div>
                 {activeTab === item.id && (
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 transition-all">
                      <ChevronRight className="w-4 h-4" />
                   </div>
                 )}
              </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
               {activeTab === "branding" && (
                 <motion.div 
                    key="branding"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 gap-12"
                 >
                    <Card className="rounded-[3rem] border-border shadow-xl overflow-hidden">
                       <CardHeader className="p-10 bg-slate-50 border-b border-border">
                          <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-4 text-primary">
                             <Palette className="w-6 h-6" /> White Label Identity
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="p-10 space-y-12">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">1. Nama Tools Baru</Label>
                                <Input value={localConfig.toolName} onChange={e => setLocalConfig({...localConfig, toolName: e.target.value})} className="h-14 bg-white rounded-2xl border-border font-bold text-lg" />
                             </div>
                             <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">2. Nama Brand Baru</Label>
                                <Input value={localConfig.brandName} onChange={e => setLocalConfig({...localConfig, brandName: e.target.value})} className="h-14 bg-white rounded-2xl border-border font-bold text-lg" />
                             </div>
                          </div>

                          <div className="space-y-6">
                             <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">3. Color Palette</Label>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                   { id: "primaryColor", label: "Warna Utama" },
                                   { id: "secondaryColor", label: "Warna Sekunder" },
                                   { id: "accentColor", label: "Warna Aksen" },
                                ].map((color) => (
                                   <div key={color.id} className="p-6 bg-slate-50 rounded-[2rem] border border-border space-y-4">
                                      <Label className="text-[10px] font-black uppercase tracking-widest block opacity-60">{color.label}</Label>
                                      <div className="flex gap-3">
                                         <input 
                                            type="color" 
                                            value={localConfig[color.id as keyof AppConfig] as string}
                                            onChange={e => setLocalConfig({...localConfig, [color.id]: e.target.value})}
                                            className="w-12 h-12 rounded-xl bg-white border border-border p-1 cursor-pointer"
                                         />
                                         <Input 
                                            value={localConfig[color.id as keyof AppConfig] as string}
                                            onChange={e => setLocalConfig({...localConfig, [color.id]: e.target.value})}
                                            className="flex-1 h-12 bg-white rounded-xl border-border font-mono text-sm uppercase"
                                         />
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">4. Konsep Logo & Favicon</Label>
                                <Input value={localConfig.logoUrl} onChange={e => setLocalConfig({...localConfig, logoUrl: e.target.value})} className="h-14 bg-white rounded-2xl border-border font-mono text-xs" placeholder="URL Gambar..." />
                                <Input value={localConfig.faviconUrl} onChange={e => setLocalConfig({...localConfig, faviconUrl: e.target.value})} className="h-14 bg-white rounded-2xl border-border font-mono text-xs" placeholder="Favicon URL..." />
                             </div>
                             <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">5. Tipografi</Label>
                                <Input value={localConfig.primaryFont} onChange={e => setLocalConfig({...localConfig, primaryFont: e.target.value})} className="h-12 bg-white rounded-2xl border-border mb-2" placeholder="Font Utama (e.g. Montserrat)" />
                                <Input value={localConfig.supportingFont} onChange={e => setLocalConfig({...localConfig, supportingFont: e.target.value})} className="h-12 bg-white rounded-2xl border-border" placeholder="Font Pendukung (e.g. Inter)" />
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                             <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">6. Tagline & Slogan</Label>
                                <Input value={localConfig.tagline} onChange={e => setLocalConfig({...localConfig, tagline: e.target.value})} className="h-14 bg-white rounded-2xl border-border font-medium" />
                             </div>
                             <div className="space-y-3">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">7. Brand Voice</Label>
                                <Input value={localConfig.brandVoice} onChange={e => setLocalConfig({...localConfig, brandVoice: e.target.value})} className="h-14 bg-white rounded-2xl border-border font-bold" />
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                 </motion.div>
               )}

               {activeTab === "ai" && (
                 <motion.div 
                    key="ai"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                 >
                    <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden">
                       <CardHeader className="p-8 bg-slate-50 border-b border-border">
                          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                             <BrainCircuit className="w-5 h-5 text-primary" /> Multi-Step Prompt Logic
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="p-8 space-y-8">
                          <div className="grid gap-8">
                             {[
                                { id: "STRATEGY_GEN", label: "Steps 1-8 Strategy Engine", desc: "Controls how Alco analyzes niches and generates high-level business strategy." },
                                { id: "COPY_GEN", label: "Ads Copy Generator", desc: "Controls the conversion logic for Facebook/Instagram/TikTok ad scripts." },
                                { id: "VISUAL_GEN", label: "Visual Storyboard Engine", desc: "Controls the image and layout composition descriptive logic." }
                             ].map((prompt) => (
                                <div key={prompt.id} className="space-y-4">
                                   <div className="flex items-center justify-between">
                                      <div>
                                         <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">{prompt.label}</h4>
                                         <p className="text-[10px] font-medium text-muted-foreground mt-1">{prompt.desc}</p>
                                      </div>
                                      <Zap className="w-4 h-4 text-primary animate-pulse" />
                                   </div>
                                   <Textarea 
                                      value={localConfig.aiPrompts[prompt.id] || ""} 
                                      onChange={e => updatePrompt(prompt.id, e.target.value)}
                                      placeholder="Leave empty to use system default factory prompts..."
                                      className="min-h-[150px] bg-slate-50 border-border rounded-2xl p-6 text-xs font-medium focus:ring-primary/20 transition-all font-mono"
                                   />
                                </div>
                             ))}
                          </div>
                       </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden">
                       <CardHeader className="p-8 bg-slate-50 border-b border-border text-center">
                          <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
                          <CardTitle className="text-xs font-black uppercase tracking-widest">Global AI Personality</CardTitle>
                       </CardHeader>
                       <CardContent className="p-10 space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 text-slate-500">Assistant Public Name</Label>
                                <Input value={localConfig.aiAssistantName} onChange={e => setLocalConfig({...localConfig, aiAssistantName: e.target.value})} className="h-12 bg-white rounded-xl border-border font-bold" />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60 text-slate-500">System Loading Message</Label>
                                <Input value={localConfig.loadingText} onChange={e => setLocalConfig({...localConfig, loadingText: e.target.value})} className="h-12 bg-white rounded-xl border-border" />
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                 </motion.div>
               )}

               {activeTab === "workflow" && (
                 <motion.div 
                    key="workflow"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                 >
                    <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden">
                       <CardHeader className="p-8 bg-slate-50 border-b border-border">
                          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                             <Workflow className="w-5 h-5 text-primary" /> Feature Access Control
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="p-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {Object.keys(localConfig.featureFlags).map((flag) => (
                               <div key={flag} className="flex items-center justify-between p-6 rounded-3xl border border-border bg-white shadow-sm transition-all hover:bg-slate-50">
                                  <div className="flex items-center gap-4">
                                     <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", localConfig.featureFlags[flag] ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400")}>
                                        <Settings className="w-5 h-5" />
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{flag.replace('enable', '')} Module</span>
                                        <span className="text-[8px] font-bold text-slate-400">{localConfig.featureFlags[flag] ? "Module Enabled" : "System Disabled"}</span>
                                     </div>
                                  </div>
                                  <Button 
                                    onClick={() => toggleFeature(flag)}
                                    variant={localConfig.featureFlags[flag] ? "default" : "outline"}
                                    className={cn("h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]", localConfig.featureFlags[flag] ? "bg-emerald-500 text-white" : "border-slate-200 opacity-60")}
                                  >
                                    {localConfig.featureFlags[flag] ? "Active" : "Offline"}
                                  </Button>
                               </div>
                             ))}
                          </div>
                       </CardContent>
                    </Card>
                 </motion.div>
               )}

               {activeTab === "security" && (
                 <motion.div 
                    key="security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                 >
                    <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden">
                       <CardHeader className="p-8 bg-slate-50 border-b border-border">
                          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                             <Lock className="w-5 h-5 text-primary" /> Access Credentials
                          </CardTitle>
                       </CardHeader>
                       <CardContent className="p-8 space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Developer Master Password</Label>
                                <Input type="password" value={localConfig.developerPassword} onChange={e => setLocalConfig({...localConfig, developerPassword: e.target.value})} className="h-14 bg-white rounded-2xl border-border text-center text-lg tracking-widest" />
                                <p className="text-[8px] font-bold text-muted-foreground text-center">GRANTS FULL UNRESTRICTED ACCESS</p>
                             </div>
                             <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Rebranding Only Password</Label>
                                <Input type="password" value={localConfig.rebrandingPassword} onChange={e => setLocalConfig({...localConfig, rebrandingPassword: e.target.value})} className="h-14 bg-white rounded-2xl border-border text-center text-lg tracking-widest" />
                                <p className="text-[8px] font-bold text-muted-foreground text-center">GRANTS BRANDING-LAYER ONLY ACCESS</p>
                             </div>
                          </div>
                       </CardContent>
                    </Card>
                 </motion.div>
               )}

               {activeTab === "infra" && (
                  <motion.div 
                     key="infra"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-8"
                  >
                     <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden">
                        <CardHeader className="p-8 bg-slate-50 border-b border-border">
                           <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                              <Database className="w-5 h-5 text-primary" /> Integration & API
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                           <div className="grid gap-6">
                              <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100 flex items-center gap-6">
                                 <Share2 className="w-8 h-8 text-primary" />
                                 <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Gemini AI Model Proxy</h4>
                                    <p className="text-[10px] font-medium text-slate-500 mt-1">API keys are automatically handled by the server-side proxy layer.</p>
                                 </div>
                              </div>
                              <div className="p-8 bg-orange-50/50 rounded-3xl border border-orange-100 flex items-center gap-6 opacity-40">
                                 <Globe className="w-8 h-8 text-orange-600" />
                                 <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-700">Webhook Integration</h4>
                                    <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-widest">Unavailable in current build tier</p>
                                 </div>
                              </div>
                           </div>
                        </CardContent>
                     </Card>

                     <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden">
                        <CardHeader className="p-8 bg-slate-50 border-b border-border">
                           <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                              <Database className="w-5 h-5 text-primary" /> Token System & Usage
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-8">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-4 p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                                 <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                       <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Token Pool</h4>
                                       <p className="text-3xl font-heading font-black italic">14.2K</p>
                                    </div>
                                    <Zap className="w-6 h-6 text-emerald-500 animate-pulse" />
                                 </div>
                                 <div className="w-full h-2 bg-emerald-200/50 rounded-full overflow-hidden">
                                    <div className="w-[65%] h-full bg-emerald-500" />
                                 </div>
                                 <p className="text-[8px] font-bold text-emerald-700/60 uppercase tracking-widest">65% OF MONTHLY QUOTA CONSUMED</p>
                                 <Button className="w-full h-11 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200">
                                    Refresh Token Limit
                                 </Button>
                              </div>
                              <div className="space-y-4 p-8 bg-slate-100/50 rounded-3xl border border-slate-200">
                                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Global Consumption Policy</h4>
                                 <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                       <span className="opacity-50">STRICT LIMITS</span>
                                       <span className="text-emerald-600">ENABLED</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                       <span className="opacity-50">AUTO-SCALE</span>
                                       <span className="text-red-500 uppercase">Disabled</span>
                                    </div>
                                 </div>
                                 <Button variant="outline" className="w-full h-11 border-slate-200 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                    Edit Billing Policy
                                 </Button>
                              </div>
                           </div>
                        </CardContent>
                     </Card>

                     <Card className="rounded-[2.5rem] border-border shadow-sm overflow-hidden">
                        <CardHeader className="p-8 bg-slate-50 border-b border-border">
                           <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                              <Share2 className="w-5 h-5 text-primary" /> Project Migration Center
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                           <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest text-center mb-4">Export or Import full project snapshots between instances</p>
                           <div className="grid grid-cols-2 gap-6">
                              <Button className="h-16 rounded-[1.5rem] bg-slate-900 text-white font-black uppercase tracking-widest gap-4 group">
                                 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Monitor className="w-5 h-5" />
                                 </div>
                                 Full Export
                              </Button>
                              <Button variant="outline" className="h-16 rounded-[1.5rem] border-slate-200 bg-white text-slate-900 font-black uppercase tracking-widest gap-4 group">
                                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Database className="w-5 h-5" />
                                 </div>
                                 Full Import
                              </Button>
                           </div>
                        </CardContent>
                     </Card>
                  </motion.div>
               )}

               {activeTab === "diagnostic" && (
                  <motion.div 
                     key="diagnostic"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-8"
                  >
                     <Card className="rounded-[2.5rem] border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden text-left text-white">
                        <CardHeader className="p-8 bg-slate-950 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                 <BrainCircuit className="w-6 h-6" />
                              </div>
                              <div>
                                 <CardTitle className="text-sm font-black uppercase tracking-widest text-primary">
                                    Mainframe Diagnostic Chatbot
                                 </CardTitle>
                                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Senior DevOps & System Engineer Assistant</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                              <span className="text-[8.5px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">LIVE TELEMETRY ACTIVE</span>
                           </div>
                        </CardHeader>
                        
                        <CardContent className="p-8 space-y-6">
                           {/* Diagnostic Preset Buttons */}
                           <div className="space-y-2">
                              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">PRESET OPERATIONS (CLICK TO EXECUTE)</span>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                 {[
                                    { text: "Uji Konektivitas API", prompt: "Lakukan pemeriksaan status konektivitas Google Gemini API Hub dan validasi parameter API key. Tampilkan status mock up laporan latency / uptime." },
                                    { text: "Inspeksi Skema Firestore", prompt: "Tolong tampilkan ringkasan struktur skema koleksi 'projects' dan 'userSettings' di Firebase Firestore. Berikan tipe data dan kegunaan field-field penting." },
                                    { text: "Log Diagnostik Server", prompt: "Berikan panduan langkah demi langkah cara debugging server.ts di development container, termasuk penanganan port 3000 dan CORS Express." },
                                    { text: "Audit Keamanan Token", prompt: "Lakukan simulasi enkripsi/desentralisasi token API Key pada localStorage browser. Apakah ada potensi kebocoran key ke Firebase dan bagaimana mengamankannya?" }
                                 ].map((preset, idx) => (
                                    <button
                                       key={idx}
                                       type="button"
                                       disabled={isThinking}
                                       onClick={() => handleSendPreset(preset.prompt)}
                                       className="p-3 bg-slate-950 border border-white/5 hover:border-primary/30 rounded-xl text-left hover:bg-slate-900 transition-all cursor-pointer group"
                                    >
                                       <span className="text-[9px] font-black uppercase tracking-wider text-primary group-hover:text-white block mb-1">{preset.text}</span>
                                       <p className="text-[9.5px] text-slate-400 font-medium leading-tight group-hover:text-slate-300">Jalankan instruksi diagnosis</p>
                                    </button>
                                 ))}
                              </div>
                           </div>

                           {/* Messages Area */}
                           <div className="h-[380px] bg-black/60 border border-white/5 rounded-2xl p-6 overflow-y-auto space-y-4 font-mono text-xs flex flex-col" id="console-chat-box">
                              {chatMessages.length === 0 ? (
                                 <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 text-slate-500 select-none">
                                    <Cpu className="w-10 h-10 text-slate-700 animate-spin" style={{ animationDuration: '3s' }} />
                                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                       ALCO DIAGNOSTIC SYSTEM SHELL<br />
                                       <span className="text-primary font-bold">READY TO RECEIVE DIAGNOSTIC COMMANDS</span>
                                    </p>
                                 </div>
                              ) : (
                                 chatMessages.map((msg, i) => (
                                    <div 
                                       key={i} 
                                       className={cn(
                                          "p-4 rounded-xl max-w-[85%] whitespace-pre-wrap leading-relaxed animate-in fade-in transition-all text-left",
                                          msg.role === "user" 
                                             ? "bg-primary/20 border border-primary/25 text-primary self-end ml-auto text-right" 
                                             : "bg-slate-900/80 border border-white/5 text-slate-100 mr-auto text-left"
                                       )}
                                    >
                                       <span className="text-[8px] font-black uppercase tracking-wider block opacity-50 mb-1">
                                          {msg.role === "user" ? "USER:SYS_ADMIN_CMD" : "SYSTEM:DIAGNOSTIC_BOT"} - {new Date(msg.timestamp).toLocaleTimeString()}
                                       </span>
                                       <p className="font-semibold text-left">{msg.content}</p>
                                    </div>
                                 ))
                              )}
                              {isThinking && (
                                 <div className="bg-slate-900/80 border border-white/5 text-slate-100 p-4 rounded-xl max-w-[80%] mr-auto flex items-center gap-3 animate-pulse text-left">
                                    <div className="flex gap-1">
                                       <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                                       <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                       <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary animate-pulse">SYS_DIAGNOSTIC: THINKING...</span>
                                 </div>
                              )}
                              <div ref={chatBottomRef} />
                           </div>

                           {/* Send Area */}
                           <form onSubmit={handleSendCustom} className="flex gap-3">
                              <Input 
                                 value={customInput}
                                 onChange={e => setCustomInput(e.target.value)}
                                 disabled={isThinking}
                                 placeholder="Type terminal command or technical questions here (e.g., debug Firebase schema)..."
                                 className="flex-1 h-12 bg-black border-white/10 text-white rounded-xl text-xs font-mono focus-visible:ring-primary focus-visible:border-primary focus-visible:ring-offset-0"
                              />
                              <Button 
                                 type="submit" 
                                 disabled={isThinking || !customInput.trim()}
                                 className="h-12 px-8 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 shadow-lg shadow-primary/25 cursor-pointer hover:bg-primary/90"
                              >
                                 EXECUTE
                              </Button>
                           </form>
                        </CardContent>
                     </Card>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
}
