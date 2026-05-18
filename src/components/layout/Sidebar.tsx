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

      <div className="pt-4 border-t border-white/5 space-y-1">
        <div className="grid grid-cols-2 gap-2 mb-2">
           <Link to="/developer" className="h-8 flex items-center justify-center rounded-lg bg-primary/5 hover:bg-primary/10 text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all gap-1 border border-primary/5">
              <ShieldAlert className="w-3 h-3" /> Dev
           </Link>
           <Link to="/rebranding" className="h-8 flex items-center justify-center rounded-lg bg-primary/5 hover:bg-primary/10 text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all gap-1 border border-primary/5">
              <Palette className="w-3 h-3" /> Brand
           </Link>
        </div>
        
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
