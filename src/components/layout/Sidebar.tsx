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
  LogOut
} from "lucide-react";
import { auth } from "../../lib/firebase";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Search, label: "Niche Research", path: "/niche" },
  { icon: CheckCircle2, label: "Validation", path: "/validation" },
  { icon: Package, label: "Product Builder", path: "/products" },
  { icon: Gift, label: "Offer Generator", path: "/offers" },
  { icon: MousePointer2, label: "Ad Angles", path: "/angles" },
  { icon: Type, label: "Copywriting AI", path: "/copy" },
  { icon: FileCode, label: "Landing Pages", path: "/landing" },
  { icon: Zap, label: "Funnels", path: "/funnels" },
  { icon: TrendingUp, label: "Analytics AI", path: "/analytics" },
];

export default function Sidebar({ className }: { className?: string }) {
  const location = useLocation();

  return (
    <div className={cn("flex flex-col h-full bg-[#050505] p-4", className)}>
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 bg-white flex items-center justify-center rounded-lg">
          <Zap className="text-black w-5 h-5 fill-black" />
        </div>
        <span className="font-bold tracking-tight text-lg">AI Sales OS</span>
      </div>

      <div className="flex-1 space-y-1">
        <p className="px-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-2">Main Menu</p>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
              location.pathname === item.path 
                ? "bg-white/10 text-white shadow-lg shadow-white/5" 
                : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-transform duration-300 group-hover:scale-110",
              location.pathname === item.path ? "text-white" : "text-white/40 group-hover:text-white"
            )} />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="pt-4 border-t border-white/5 space-y-1">
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
        <button
          onClick={() => auth.signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
