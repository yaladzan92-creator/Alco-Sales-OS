import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
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
  Palette
} from "lucide-react";
import { auth } from "../../lib/firebase";
import { useBranding } from "@/contexts/BrandingContext";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard Hub", path: "/dashboard" },
];

export default function Sidebar({ className }: { className?: string }) {
  const location = useLocation();
  const { config } = useBranding();

  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border p-4", className)}>
      <div className="flex items-center gap-3 px-2 mb-10 overflow-hidden">
        <div className="w-8 h-8 bg-primary flex items-center justify-center rounded-lg shadow-lg shadow-primary/20 shrink-0 overflow-hidden">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-[Montserrat] font-black text-xl leading-none">{config.appName.charAt(0)}</span>
          )}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-heading font-bold tracking-tight text-base leading-none truncate">{config.appName}</span>
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] truncate">{config.companyName}</span>
        </div>
      </div>

      <div className="flex-1 space-y-1">
        <p className="px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Execution Ecosystem</p>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
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
      </div>

      <div className="pt-4 border-t border-sidebar-border/50 space-y-2">
         <Link to="/developer" className="w-full h-10 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-black text-[9px] font-black uppercase tracking-[0.2em] text-white transition-all gap-3 border border-white/10 shadow-lg">
            <ShieldAlert className="w-4 h-4 text-primary" /> Developer Mode
         </Link>
         <Link to="/rebrand" className="w-full h-10 flex items-center justify-center rounded-xl bg-primary/10 hover:bg-primary/20 text-[9px] font-black uppercase tracking-[0.2em] text-primary transition-all gap-3 border border-primary/20 shadow-sm">
            <Palette className="w-4 h-4" /> Rebrand Mode
         </Link>
        
        <button
          onClick={() => auth.signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-100/40 hover:text-red-400 hover:bg-red-400/5 transition-all text-left group"
        >
          <LogOut className="w-4 h-4 text-red-100/20 group-hover:text-red-400" />
          <span className="text-sm font-medium">Logout System</span>
        </button>
      </div>
    </div>
  );
}
