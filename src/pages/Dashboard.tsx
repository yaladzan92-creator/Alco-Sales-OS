import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { TrendingUp, Users, Package, Search, ArrowUpRight } from "lucide-react";
import { auth } from "../lib/firebase";

const stats = [
  { label: "Niches Explored", value: "12", icon: Search, change: "+3" },
  { label: "Products Built", value: "4", icon: Package, change: "+1" },
  { label: "Winning Angles", value: "8", icon: TrendingUp, change: "+2" },
  { label: "Total Leads", value: "1.2k", icon: Users, change: "+240" },
];

export default function Dashboard() {
  const user = auth.currentUser;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Workspace Overview</p>
          <h1 className="text-4xl font-bold tracking-tight">System Ready, {user?.displayName?.split(' ')[0]}.</h1>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-[0.2em] mb-1">Plan Status</p>
          <div className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-white tracking-widest uppercase">
            Professional Tier
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/[0.03] border-white/5 backdrop-blur-sm overflow-hidden group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-white/40 uppercase tracking-wider">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight mb-1">{stat.value}</div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.change} this month
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/[0.03] border-white/5">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">Active Funnels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Product Funnel #{i}</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">Digital Course • Health Niche</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tracking-tight">2.4% CR</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase">Optimized</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.03] border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingUp className="w-32 h-32" />
          </div>
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">AI Agent Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Status</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Research Agent</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Offer Agent</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60">Copy Agent</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <p className="text-[11px] text-white/60 leading-relaxed italic">
                "System is currently analyzing market data for 'Digital Fitness' niche. Expect winning angles in 4 minutes."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Fixed import for Zap
import { Zap } from "lucide-react";
