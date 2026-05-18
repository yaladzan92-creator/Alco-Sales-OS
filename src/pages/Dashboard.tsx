import React from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { TrendingUp, Users, Package, Search, ArrowUpRight, Zap, Plus, ChevronRight, Loader2 } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { useBranding } from "@/contexts/BrandingContext";

export default function Dashboard() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const { config } = useBranding();
  const [projects, setProjects] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      try {
        const q = query(collection(db, "projects"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProjects(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user]);

  const handleCreateProject = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const name = `Project ${projects.length + 1}`;
      const docRef = await addDoc(collection(db, "projects"), {
        userId: user.uid,
        name: name,
        currentStep: 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("Project Identity Initialized");
      navigate(`/wizard/${docRef.id}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-3 font-heading">{config.brandName} Ecosystem Entry</p>
          <h1 className="text-5xl font-heading font-black tracking-tighter text-foreground leading-[1.1]">
            Greetings, <span className="text-primary">{user?.displayName?.split(' ')[0] || "Strategist"}</span>.
          </h1>
          <div className="mt-2 space-y-1">
            <p className="text-muted-foreground text-lg font-medium opacity-80 italic uppercase">{config.dashboardText}</p>
            <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em]">{config.tagline}</p>
          </div>
        </div>
        <Button 
          disabled={creating}
          onClick={handleCreateProject}
          className="h-14 px-8 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 flex items-center gap-3 uppercase tracking-widest text-xs"
        >
          {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          Start Unified Workflow
        </Button>
      </header>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {loading ? (
           [1, 2, 3].map(i => (
             <div key={i} className="h-64 bg-secondary/30 rounded-[2.5rem] animate-pulse" />
           ))
        ) : (
          projects.length > 0 ? (
            projects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(`/wizard/${project.id}`)}
                className="cursor-pointer group"
              >
                <Card className="bg-card border-border shadow-md hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] overflow-hidden border-b-4 border-b-transparent hover:border-b-primary relative">
                  <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between">
                    <div className="p-3 bg-secondary rounded-2xl group-hover:bg-primary transition-all duration-300">
                      <Zap className="h-5 w-5 text-primary group-hover:text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Step</span>
                      <span className="text-xl font-heading font-black text-foreground">{project.currentStep}/8</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-4 space-y-6">
                    <div>
                      <h3 className="text-2xl font-heading font-black tracking-tight text-foreground group-hover:text-primary transition-colors">{project.name}</h3>
                      <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60 mt-1 truncate">
                        {project.nicheData?.selectedOption?.name || "Digital Asset Pipeline"}
                      </p>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between items-end">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Completion Progress</span>
                          <span className="text-sm font-heading font-black text-primary">{Math.round((project.currentStep / 8) * 100)}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-1000" 
                            style={{ width: `${(project.currentStep / 8) * 100}%` }}
                          />
                       </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-1">
                         <p className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Active Syncing</p>
                         <p className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest truncate">
                            Updated: {project.updatedAt?.toDate ? project.updatedAt.toDate().toLocaleDateString() : 'Just now'}
                         </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </div>
  
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/wizard/${project.id}?mode=strategy`);
                        }}
                        className="h-10 text-[9px] font-black uppercase tracking-widest border-border/50 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        1. Sales Strategy
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={project.currentStep < 8}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/wizard/${project.id}?mode=ads`);
                        }}
                        className="h-10 text-[9px] font-black uppercase tracking-widest border-border/50 hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        2. Ads Content
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-6">
              <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl rotate-3">
                <Search className="w-10 h-10 text-slate-300" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-black uppercase tracking-tighter italic">No Projects Detected</h3>
                <p className="text-muted-foreground text-sm font-medium mt-1 uppercase tracking-widest opacity-60">Ready to build your digital empire?</p>
              </div>
              <Button onClick={handleCreateProject} size="lg" className="h-12 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs">Initialize First Project</Button>
            </div>
          )
        )}
      </div>

      <footer className="pt-10 border-t border-border text-center pb-10">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-1">{config.footerText}</p>
         <p className="text-[8px] font-bold text-muted-foreground/40">{config.companyName} &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}


