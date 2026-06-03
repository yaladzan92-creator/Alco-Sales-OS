import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import React from "react";
import { 
  LayoutDashboard, 
  Search, 
  CheckCircle2, 
  Package, 
  Gift, 
  MousePointer2, 
  Type, 
  FileCode, 
  Zap, 
  TrendingUp,
  Settings,
  LogOut,
  ShieldAlert,
  Palette,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  Power
} from "lucide-react";
import { auth } from "../../lib/firebase";
import { useBranding } from "@/contexts/BrandingContext";
import { toast } from "sonner";

const menuItems = [
  { icon: LayoutDashboard, label: "Pusat Dasbor", path: "/dashboard" },
];

export default function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const { config } = useBranding();
  const [isDevActive, setIsDevActive] = React.useState(localStorage.getItem("alco_developer_mode_active") === "true");
  const [isFullscreen, setIsFullscreen] = React.useState(!!document.fullscreenElement);
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);
  const [isInitiatingExit, setIsInitiatingExit] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = () => {
      setIsDevActive(localStorage.getItem("alco_developer_mode_active") === "true");
    };
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleUnauthorizedNavigation = () => {
      toast.error("Navigasi Keluar Diblokir!", {
        description: "Sesi APK dikonfigurasi dalam mode aman. Gunakan tombol 'Keluar Aplikasi' untuk menutup dengan aman.",
        duration: 5000
      });
    };

    window.addEventListener("alco_developer_auth_changed", checkAuth);
    window.addEventListener("storage", checkAuth);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("alco_unauthorized_navigation_popup", handleUnauthorizedNavigation);

    return () => {
      window.removeEventListener("alco_developer_auth_changed", checkAuth);
      window.removeEventListener("storage", checkAuth);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("alco_unauthorized_navigation_popup", handleUnauthorizedNavigation);
    };
  }, []);

  const handleForceCloseApp = () => {
    setIsInitiatingExit(true);
    (window as any).alco_is_exiting = true;
    
    toast.loading("Tugas selesai. Menutup APK secara aman...");
    
    setTimeout(() => {
      try {
        window.close();
      } catch (e) {
        console.warn(e);
      }
      
      try {
        const win = window.open("", "_self");
        if (win) win.close();
      } catch (e) {
        console.warn(e);
      }
      
      // Secondary fallback to standard about:blank redirect
      setTimeout(() => {
        window.location.href = "about:blank";
      }, 200);
    }, 1200);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
          toast.success("Immersive Screen Activated (APK Style)");
        })
        .catch((err) => {
          console.error(err);
          toast.error("Format tidak mendukung fullscreen otomatis di perangkat ini");
        });
    } else {
      if (!isDevActive) {
        toast.error("Format keluar layar penuh hanya diijinkan melalui sandi di Developer Mode");
        return;
      }
      document.exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
          toast.info("Immersive Screen Deactivated");
        });
    }
  };

  const handleExitDevMode = () => {
    localStorage.removeItem("alco_developer_mode_active");
    setIsDevActive(false);
    window.dispatchEvent(new Event("alco_developer_auth_changed"));
    toast.success("Developer Mode Deactivated");
    window.location.href = "/dashboard";
  };

  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border p-4", className)}>
      {/* Top Left Close APK Button */}
      <div className="flex items-center justify-between mb-4 border-b border-sidebar-border/30 pb-3">
        <button
          onClick={() => setShowExitConfirm(true)}
          id="btn-app-exit"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-white hover:bg-rose-600 bg-rose-500/5 border border-rose-500/10 hover:border-rose-600 transition-all cursor-pointer shadow-sm"
          title="Keluar / Tutup APK"
        >
          <Power className="w-3 h-3 animate-pulse" />
          <span>KELUAR APK</span>
        </button>
      </div>

      <div className="flex items-center gap-3 px-2 mb-10 overflow-hidden">
        <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-lg shadow-lg shadow-primary/20 shrink-0 overflow-hidden">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-[Montserrat] font-black text-xl leading-none">{config.appName.charAt(0)}</span>
          )}
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="font-heading font-bold tracking-tight text-base leading-none truncate">{config.appName}</span>
            {isDevActive && (
              <span className="bg-emerald-500 text-[8px] font-black text-white px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">DEV</span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] truncate">{config.companyName}</span>
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Ekosistem Eksekusi</p>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            id={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
              location.pathname === item.path 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <item.icon className={cn(
              "w-4 h-4 transition-transform duration-300 group-hover:scale-110",
              location.pathname === item.path ? "text-primary-foreground" : "text-muted-foreground/60 group-hover:text-primary"
            )} />
            <span className="text-sm font-semibold">{item.label}</span>
          </Link>
        ))}

        {/* Immersive View Option for APK */}
        <button
          onClick={handleToggleFullscreen}
          id="btn-immersive-screen"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-left"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-primary animate-pulse" />
          ) : (
            <Maximize2 className="w-4 h-4 text-muted-foreground/60" />
          )}
          <span className="text-sm font-semibold">Tampilan APK Layar Penuh</span>
        </button>
      </div>

      <div className="pt-4 border-t border-sidebar-border/50 space-y-3">
        <button
          onClick={() => auth.signOut()}
          id="btn-logout"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-100/40 hover:text-red-400 hover:bg-red-400/5 transition-all text-left group"
        >
          <LogOut className="w-4 h-4 text-red-100/20 group-hover:text-red-400" />
          <span className="text-sm font-medium">Keluar dari Sistem</span>
        </button>

        {/* Subtle, Hidden Admin / Dev Mode Navigation Links */}
        <div className="flex items-center justify-between gap-2 px-2 text-[8px] text-muted-foreground/30 font-semibold tracking-wider pt-2 border-t border-sidebar-border/30">
          <span>SYSTEM v1.5</span>
          {isDevActive ? (
            <div className="flex items-center gap-2">
              <Link to="/developer" className="hover:text-emerald-500 hover:underline uppercase text-[8px] font-black">Panel</Link>
              <Link to="/rebrand" className="hover:text-primary hover:underline uppercase text-[8px] font-black">Rebrand</Link>
              <button onClick={handleExitDevMode} className="hover:text-orange-500 hover:underline uppercase text-[8px] font-black cursor-pointer">Lock</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/rebrand" className="hover:text-primary hover:underline text-[8px] font-black uppercase tracking-wider">
                🎨 Rebrand
              </Link>
              <span>•</span>
              <Link to="/developer" className="hover:text-amber-500 hover:underline text-[8px] uppercase">
                🔒 Admin Session
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Immersive APK Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[100050] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            {/* Ambient status indicator */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-red-600 to-amber-500" />
            
            <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl mx-auto flex items-center justify-center border border-rose-500/20">
              <Power className="w-7 h-7 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-heading font-black tracking-tight text-white uppercase italic">
                Sesi APK Terkunci: Keluar?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                Apakah Anda yakin ingin menyelesaikan tugas digital Anda, memutuskan status koneksi, dan menutup tab browser Chrome ini secara otomatis?
              </p>
            </div>
            
            <div className="flex flex-col gap-2 pt-1 font-sans">
              <button
                onClick={handleForceCloseApp}
                disabled={isInitiatingExit}
                className="w-full h-12 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-800 disabled:opacity-50 active:scale-[0.98] transition-all text-xs font-black uppercase tracking-widest text-white rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isInitiatingExit ? (
                  <span className="animate-pulse">Menghancurkan Sesi...</span>
                ) : (
                  <>YA, TUTUP APK SEKARANG</>
                )}
              </button>
              
              <button
                onClick={() => setShowExitConfirm(false)}
                disabled={isInitiatingExit}
                className="w-full h-11 bg-transparent hover:bg-slate-900 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-white rounded-xl transition-all cursor-pointer"
              >
                KEMBALI KE APLIKASI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
