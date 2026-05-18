import React from "react";
import { useBranding } from "@/contexts/BrandingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Palette, 
  Type, 
  Image as ImageIcon, 
  Monitor, 
  HelpCircle, 
  Building2, 
  Globe,
  Save,
  Eye,
  Loader2,
  Lock,
  ArrowRight,
  SmilePlus
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

export default function RebrandingPanel() {
  const { config, updateConfig } = useBranding();
  const [password, setPassword] = React.useState("");
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [previewMode, setPreviewMode] = React.useState(false);
  const [localConfig, setLocalConfig] = React.useState(config);

  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === config.rebrandingPassword) {
      setIsAuthenticated(true);
      toast.success("Branding Editor Unlocked");
    } else {
      toast.error("Invalid branding password");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateConfig(localConfig);
      toast.success("Branding updated successfully!");
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
             <div className="w-20 h-20 bg-white shadow-xl rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <Palette className="w-10 h-10 text-primary" />
             </div>
             <h2 className="text-3xl font-heading font-black tracking-tighter uppercase italic">Brand Editor</h2>
             <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mt-2">Enter Password to Customize Interface</p>
          </div>

          <Card className="border-border shadow-2xl rounded-[2.5rem] overflow-hidden">
             <CardContent className="p-8">
                <form onSubmit={handleAuth} className="space-y-6">
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest opacity-50">Editor Access Key</Label>
                      <Input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 bg-slate-50 border-border rounded-2xl text-center text-lg font-bold tracking-widest"
                        placeholder="••••"
                      />
                   </div>
                   <Button type="submit" className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest rounded-2xl gap-2">
                      Unlock Editor <ArrowRight className="w-4 h-4" />
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
      {/* Visual Editor Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-border p-6 px-10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
               <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
               <h1 className="text-2xl font-heading font-black tracking-tight uppercase italic leading-none">White Label Editor</h1>
               <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Real-time Interface Customization</p>
            </div>
         </div>

         <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setPreviewMode(!previewMode)}
              className={cn("h-12 px-6 rounded-2xl border-border font-black uppercase tracking-widest text-[10px] gap-2 transition-all", previewMode && "bg-primary text-white border-primary")}
            >
               <Eye className="w-4 h-4" /> {previewMode ? "Exit Preview" : "Live Preview"}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading}
              className="h-12 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Branding</>}
            </Button>
         </div>
      </header>

      <div className="p-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
         {/* Editor Form */}
         <div className="space-y-8 pb-20">
            <section className="space-y-6">
               <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Identity & Logo</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest">Application Name</Label>
                     <Input 
                        value={localConfig.appName}
                        onChange={(e) => setLocalConfig({...localConfig, appName: e.target.value})}
                        className="h-12 bg-white rounded-xl border-border font-bold"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest">Tool/Product Name</Label>
                     <Input 
                        value={localConfig.toolName}
                        onChange={(e) => setLocalConfig({...localConfig, toolName: e.target.value})}
                        className="h-12 bg-white rounded-xl border-border font-bold"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest">Brand Name</Label>
                     <Input 
                        value={localConfig.brandName}
                        onChange={(e) => setLocalConfig({...localConfig, brandName: e.target.value})}
                        className="h-12 bg-white rounded-xl border-border font-bold"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest">Logo URL (PNG/SVG)</Label>
                     <Input 
                        value={localConfig.logoUrl}
                        onChange={(e) => setLocalConfig({...localConfig, logoUrl: e.target.value})}
                        className="h-12 bg-white rounded-xl border-border font-mono text-xs"
                        placeholder="https://yourdomain.com/logo.png"
                     />
                  </div>
               </div>
            </section>

            <section className="space-y-6">
               <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Color Palette</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Primary Color</Label>
                     <Input 
                        type="color"
                        value={localConfig.primaryColor}
                        onChange={(e) => setLocalConfig({...localConfig, primaryColor: e.target.value})}
                        className="w-full h-12 p-1 bg-white border-border rounded-xl cursor-pointer"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secondary Color</Label>
                     <Input 
                        type="color"
                        value={localConfig.secondaryColor}
                        onChange={(e) => setLocalConfig({...localConfig, secondaryColor: e.target.value})}
                        className="w-full h-12 p-1 bg-white border-border rounded-xl cursor-pointer"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-blue-500">Accent Color</Label>
                     <Input 
                        type="color"
                        value={localConfig.accentColor}
                        onChange={(e) => setLocalConfig({...localConfig, accentColor: e.target.value})}
                        className="w-full h-12 p-1 bg-white border-border rounded-xl cursor-pointer"
                     />
                  </div>
               </div>
            </section>

            <section className="space-y-6">
               <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Typography & Fonts</h3>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest">Primary Font (Headings)</Label>
                     <Input 
                        value={localConfig.primaryFont}
                        onChange={(e) => setLocalConfig({...localConfig, primaryFont: e.target.value})}
                        className="h-12 bg-white rounded-xl border-border"
                        placeholder="Google Font Name (e.g. Montserrat)"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest">Supporting Font (Sans)</Label>
                     <Input 
                        value={localConfig.supportingFont}
                        onChange={(e) => setLocalConfig({...localConfig, supportingFont: e.target.value})}
                        className="h-12 bg-white rounded-xl border-border"
                        placeholder="Google Font Name (e.g. Inter)"
                     />
                  </div>
               </div>
            </section>

            <section className="space-y-6">
               <div className="flex items-center gap-3">
                  <SmilePlus className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Brand Voice & Tagline</h3>
               </div>
               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest">Brand Tagline</Label>
                     <Input 
                        value={localConfig.tagline}
                        onChange={(e) => setLocalConfig({...localConfig, tagline: e.target.value})}
                        className="h-12 bg-white rounded-xl border-border font-medium"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest">Brand Voice / Personality</Label>
                     <Input 
                        value={localConfig.brandVoice}
                        onChange={(e) => setLocalConfig({...localConfig, brandVoice: e.target.value})}
                        className="h-12 bg-white rounded-xl border-border"
                        placeholder="e.g. Professional, Witty, Aggressive..."
                     />
                  </div>
               </div>
            </section>

            <section className="space-y-6">
               <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Dashboard Messaging</h3>
               </div>
               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest">Main Dashboard Text</Label>
                     <Textarea 
                        value={localConfig.dashboardText}
                        onChange={(e) => setLocalConfig({...localConfig, dashboardText: e.target.value})}
                        className="min-h-[100px] bg-white rounded-xl border-border font-medium leading-relaxed"
                     />
                  </div>
               </div>
            </section>

            <section className="space-y-6">
               <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Company & Support</h3>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest">Company Name</Label>
                     <Input 
                        value={localConfig.companyName}
                        onChange={(e) => setLocalConfig({...localConfig, companyName: e.target.value})}
                        className="h-12 bg-white rounded-xl border-border font-bold"
                     />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest">Support Email/Link</Label>
                     <Input 
                        value={localConfig.supportContact}
                        onChange={(e) => setLocalConfig({...localConfig, supportContact: e.target.value})}
                        className="h-12 bg-white rounded-xl border-border"
                     />
                  </div>
               </div>
            </section>
         </div>

         {/* Live Preview Column */}
         <div className="hidden lg:block relative font-sans">
            <div className="sticky top-40 space-y-4">
               <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Resulting Interface Preview
               </p>
               
               <div className="w-full aspect-[4/3] bg-white rounded-[3rem] shadow-2xl border border-border overflow-hidden flex flex-col scale-90 origin-top shadow-primary/5 transition-all duration-500" style={{ fontFamily: localConfig.supportingFont }}>
                  <header className="h-16 border-b border-border bg-white px-8 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center overflow-hidden shadow-lg shadow-primary/20" style={{ backgroundColor: localConfig.primaryColor }}>
                           {localConfig.logoUrl ? (
                             <img src={localConfig.logoUrl} className="w-full h-full object-cover text-[0px]" alt="" />
                           ) : (
                             <span className="text-white font-black text-xs">{localConfig.brandName.charAt(0)}</span>
                           )}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black uppercase tracking-tight leading-none" style={{ color: localConfig.primaryColor }}>{localConfig.toolName}</span>
                           <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">{localConfig.brandName}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100" />
                        <div className="w-20 h-6 rounded-full bg-slate-100" />
                     </div>
                  </header>
                  <main className="flex-1 p-8 bg-slate-50/50 flex flex-col justify-center text-center">
                     <div className="max-w-md mx-auto space-y-6">
                        <div className="space-y-2">
                           <h4 className="text-3xl font-heading font-black tracking-tighter leading-tight" style={{ color: localConfig.primaryColor, fontFamily: localConfig.primaryFont }}>
                              {localConfig.toolName}
                           </h4>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">
                              {localConfig.tagline}
                           </p>
                        </div>
                        <div className="w-full h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20" style={{ backgroundColor: localConfig.primaryColor }}>
                           <span className="text-white text-[10px] font-black uppercase tracking-widest">Get Started Today</span>
                        </div>
                     </div>
                  </main>
                  <footer className="p-6 border-t border-border bg-white text-center">
                     <p className="text-[8px] font-black uppercase tracking-widest opacity-40">{localConfig.footerText}</p>
                     <p className="text-[6px] font-bold text-slate-300 uppercase tracking-[0.3em] mt-1">{localConfig.companyName}</p>
                  </footer>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
