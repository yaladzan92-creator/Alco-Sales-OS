import { signInWithGoogle } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { Zap } from "lucide-react";
import { useBranding } from "@/contexts/BrandingContext";

export default function Login() {
  const { config } = useBranding();
  
  return (
    <div className="h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card/50 backdrop-blur-2xl border border-border/50 p-10 rounded-[2.5rem] shadow-2xl text-center relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-primary flex items-center justify-center rounded-2xl shadow-xl shadow-primary/20 transform -rotate-3 overflow-hidden">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-[Montserrat] font-black text-4xl">{config.appName.charAt(0)}</span>
            )}
          </div>
        </div>
        
        <h1 className="text-4xl font-heading font-black tracking-tighter text-foreground mb-1 italic uppercase">
          {config.toolName}
        </h1>
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">BY {config.brandName}</p>
        <p className="text-muted-foreground mb-10 text-sm font-medium leading-relaxed opacity-60">
          {config.tagline}
        </p>
        
        <Button 
          onClick={signInWithGoogle}
          className="w-full h-14 bg-primary text-white hover:bg-primary/90 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Access {config.appName}
        </Button>
        
        <div className="mt-10 pt-10 border-t border-border/50">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground mb-1">{config.companyName}</p>
          <p className="text-xs font-heading font-black tracking-widest text-accent italic">{config.footerText}</p>
        </div>
      </motion.div>
    </div>
  );
}
