import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, ChevronRight, Copy, ExternalLink, ShieldCheck, Globe, Rocket, CheckCircle2, Loader2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { saveUserConfig } from "@/services/aiService";
import { useBranding } from "@/contexts/BrandingContext";

export default function Onboarding() {
  const { config } = useBranding();
  const [step, setStep] = React.useState(1);
  const [apiKey, setApiKey] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isDemo, setIsDemo] = React.useState(false);

  const handleConnect = async () => {
    if (!apiKey && !isDemo) {
      toast.error("Silakan masukkan API Key atau pilih Demo Mode");
      return;
    }

    setLoading(true);
    try {
      const res = await saveUserConfig({
        geminiApiKey: isDemo ? null : apiKey,
        isDemoMode: isDemo,
        onboardingComplete: true
      });

      if (res.error) {
        throw new Error(res.error);
      }

      toast.success("AI Berhasil Dihubungkan!", {
        description: "Selamat datang di ekosistem digital performa tinggi."
      });
      
      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (error: any) {
      toast.error("Gagal menghubungkan AI", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Aktifkan AI Anda", subtitle: "Hubungkan mesin kecerdasan buatan ke workspace Anda." },
    { title: "Ambil API Key", subtitle: "Dapatkan kunci akses resmi dari Google AI Studio." },
    { title: "Panduan Cepat", subtitle: "Hanya butuh 2 langkah untuk menghubungkan sistem." },
    { title: "Finalisasi", subtitle: "Tempelkan kunci akses dan mulai eksekusi." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        layout
        className="w-full max-w-2xl bg-slate-900/50 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl p-8 md:p-12 relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
               {config.logoUrl ? (
                 <img src={config.logoUrl} className="w-full h-full object-cover rounded-2xl" alt="Logo" />
               ) : (
                 <Zap className="w-6 h-6 text-white" />
               )}
             </div>
             <div>
               <h1 className="text-xl font-heading font-black uppercase tracking-tighter">AI Activation</h1>
               <div className="flex gap-1 mt-1">
                 {[1, 2, 3, 4].map((i) => (
                   <div key={i} className={`h-1 rounded-full transition-all duration-500 ${step >= i ? "w-6 bg-primary" : "w-3 bg-white/10"}`} />
                 ))}
               </div>
             </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Step {step} of 4</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tighter leading-tight uppercase">
                  Selamat Datang <br /> di <span className="text-primary">{config.appName}</span>
                </h2>
                <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                  Aplikasi ini membutuhkan tenaga AI dari Google Gemini untuk bekerja secara maksimal pada akun Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex flex-col gap-4 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => setStep(2)}>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                    <Zap className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase tracking-tight text-sm">Gunakan AI Pribadi</h3>
                    <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Tanpa limit kuota & performa maksimal.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform mt-auto" />
                </div>

                <div 
                  className="p-6 bg-white/5 rounded-3xl border border-white/10 flex flex-col gap-4 group hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden"
                  onClick={() => {
                    setIsDemo(true);
                    handleConnect();
                  }}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <PlayCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-bold uppercase tracking-tight text-sm">Coba Demo Gratis</h3>
                    <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Gunakan kuota shared terbatas untuk mencoba.</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform mt-auto" />
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)}
                className="w-full h-14 rounded-2xl bg-white text-black hover:bg-slate-200 font-black uppercase tracking-widest text-xs"
              >
                Mulai Sinkronisasi AI <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-heading font-black tracking-tighter uppercase leading-tight">
                  Dapatkan <br /> Gemini API Key
                </h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Google AI Studio menyediakan akses gratis (hingga 1.5M tokens/day) untuk penggunaan pribadi. Klik tombol di bawah untuk membukanya.
                </p>
              </div>

              <div className="p-8 bg-primary/10 border border-primary/20 rounded-[2rem] flex flex-col items-center justify-center text-center gap-6">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                   <Globe className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <Button 
                  asChild
                  className="w-full h-14 rounded-xl bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                >
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                    Buka Google AI Studio <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl text-white/40 uppercase font-black text-[10px] tracking-widest">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-[2] h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white uppercase font-black text-[10px] tracking-widest border border-white/10">
                  Saya sudah di Google AI Studio
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-heading font-black tracking-tighter uppercase">Panduan Visual</h2>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-widest opacity-60">Ikuti 3 langkah mudah berikut:</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl group">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-black text-primary border border-white/10 group-hover:scale-110 transition-transform">01</div>
                  <div>
                    <h4 className="font-bold uppercase tracking-tight text-sm">Klik 'Create API Key'</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-medium mt-1">Gunakan project Google Cloud apapun.</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl group">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-black text-primary border border-white/10 group-hover:scale-110 transition-transform">02</div>
                  <div>
                    <h4 className="font-bold uppercase tracking-tight text-sm">Copy API Key</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-medium mt-1">Salin kode yang muncul ke clipboard.</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl group">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-black text-primary border border-white/10 group-hover:scale-110 transition-transform">03</div>
                  <div>
                    <h4 className="font-bold uppercase tracking-tight text-sm">Kembali Kesini</h4>
                    <p className="text-[10px] text-slate-500 uppercase font-medium mt-1">Kita akan menghubungkannya di langkah terakhir.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 h-12 rounded-xl text-white/40 uppercase font-black text-[10px] tracking-widest">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-[2] h-12 rounded-xl bg-primary text-white hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20">
                  Lanjut ke Finalisasi
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-4xl font-heading font-black tracking-tighter uppercase">Hubungkan AI</h2>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Tempelkan Gemini API Key Anda di bawah. Data ini dienkripsi (pseudonymized) dan hanya digunakan untuk eksekusi perintah Anda.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <Input 
                    placeholder="Pasted Gemini API Key here..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="h-16 rounded-2xl bg-white/5 border-white/10 focus:border-primary/50 text-white font-mono px-6 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    API Key Anda akan langsung divalidasi ke server Google secara real-time.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(3)} className="flex-1 h-12 rounded-xl text-white/40 uppercase font-black text-[10px] tracking-widest">
                  Back
                </Button>
                <Button 
                  onClick={handleConnect} 
                  disabled={loading || !apiKey}
                  className="flex-[2] h-12 rounded-xl bg-primary text-white hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang Menghubungkan...</> : "Sinkronisasi Sekarang"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
           <div className="flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-emerald-500" />
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Secure AES-256 Transport</span>
           </div>
           <div className="flex items-center gap-2">
             <Rocket className="w-4 h-4 text-primary" />
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Direct AI-to-User Link</span>
           </div>
        </div>
      </motion.div>
    </div>
  );
}
