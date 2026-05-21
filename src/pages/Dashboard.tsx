import React from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { TrendingUp, Users, Package, Search, ArrowUpRight, Zap, Plus, ChevronRight, Loader2, Download, Upload, Trash2, X } from "lucide-react";
import { auth, db } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { useBranding } from "@/contexts/BrandingContext";

export default function Dashboard() {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const { config } = useBranding();
  const [projects, setProjects] = React.useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{[key: string]: number}>({});

  const handleExportProject = (e: React.MouseEvent, proj: any) => {
    e.stopPropagation();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(proj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `project_${proj.name || 'export'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success(`Project "${proj.name}" Berhasil Di-export!`);
  };

  const handleImportProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (!imported || typeof imported !== 'object') {
          throw new Error("Invalid format");
        }
        
        if (!user) {
          toast.error("Anda harus login terlebih dahulu.");
          return;
        }

        const { id, createdAt, updatedAt, userId, ...cleanData } = imported;
        
        const docRef = await addDoc(collection(db, "projects"), {
          ...cleanData,
          userId: user.uid,
          name: cleanData.name ? `${cleanData.name} (Import)` : "Imported Project",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        const newProj = {
          id: docRef.id,
          userId: user.uid,
          ...cleanData,
          name: cleanData.name ? `${cleanData.name} (Import)` : "Imported Project"
        };
        
        setProjects(prev => [newProj, ...prev]);
        toast.success("Progress Project Berhasil Di-import!");
      } catch (err) {
        toast.error("Format file tidak valid. Mohon gunakan file JSON export yang valid.");
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    
    const confirmState = deleteConfirm[projectId] || 0;
    
    if (confirmState === 0) {
      setDeleteConfirm(prev => ({ ...prev, [projectId]: 1 }));
      toast.warning("Klik sekali lagi untuk konfirmasi penghapusan (Konfirmasi 1/2)");
      return;
    }
    
    if (confirmState === 1) {
      setDeleteConfirm(prev => ({ ...prev, [projectId]: 2 }));
      toast.error("Klik terakhir untuk menghapus project secara permanen! (Konfirmasi 2/2)");
      return;
    }
    
    if (confirmState === 2) {
      try {
        const docRef = doc(db, "projects", projectId);
        await deleteDoc(docRef);
        setProjects(prev => prev.filter(p => p.id !== projectId));
        setDeleteConfirm(prev => {
          const updated = { ...prev };
          delete updated[projectId];
          return updated;
        });
        toast.success("Project Berhasil Dihapus!");
      } catch (err: any) {
        console.error("Delete error:", err);
        toast.error("Gagal menghapus project: " + err.message);
      }
    }
  };
  const [loading, setLoading] = React.useState(true);
  const [creating, setCreating] = React.useState(false);
  const [showApiNotice, setShowApiNotice] = React.useState(true);

  React.useEffect(() => {
    // Show welcome toast about API Key
    const hasSeenNotice = localStorage.getItem("hasSeenApiNotice");
    if (!hasSeenNotice) {
      toast.info("Gunakan API Key Pribadi", {
        description: "Demi kelancaran, kami menyarankan Anda menggunakan API Key sendiri. Klik banner di dashboard untuk panduan.",
        duration: 8000
      });
      localStorage.setItem("hasSeenApiNotice", "true");
    }
  }, []);

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
          <div className="flex items-center gap-3 mt-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Unified Cloud Sync Active</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full cursor-pointer hover:bg-orange-500/20 transition-all" onClick={() => toast.info("API Key Mode", { description: "Gunakan API Key Pribadi untuk kuota tak terbatas." })}>
                <Zap className="w-3 h-3 text-orange-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-orange-600">Personal API Key Mode</span>
             </div>
          </div>
          <div className="mt-4 space-y-1">
            <p className="text-muted-foreground text-lg font-medium opacity-80 italic uppercase">{config.dashboardText}</p>
            <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.4em]">{config.tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative">
            <input 
              type="file" 
              id="dashboard-import-project"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
              onChange={handleImportProject}
              accept=".json"
            />
            <Button 
              variant="outline"
              id="btn-import-project-dash"
              className="h-14 px-6 rounded-2xl border-border bg-slate-100 dark:bg-zinc-900 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all font-black text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <Upload className="w-5 h-5 text-primary" />
              Import Project
            </Button>
          </div>

          <Button 
            disabled={creating}
            onClick={handleCreateProject}
            id="btn-create-project-dash"
            className="h-14 px-8 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 flex items-center gap-3 uppercase tracking-widest text-xs w-full md:w-auto"
          >
            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Start Unified Workflow
          </Button>
        </div>
      </header>

      {/* API Key Notice Banner */}
      {showApiNotice && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/5 border border-primary/20 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group shadow-xl shadow-primary/5"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-20" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-inner">
              <Zap className="w-7 h-7 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-heading font-black uppercase tracking-tight text-foreground flex items-center gap-2">
                Unified API Access Mode
                <span className="bg-primary text-white text-[8px] px-2 py-0.5 rounded-full">RECOMMENDED</span>
              </h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.1em] opacity-80 mt-1 max-w-md">
                Hubungkan Google Cloud Project Anda untuk akses tanpa batas ke Model Gemini 3 Pro & Flash.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
            <Button 
              onClick={() => {
                window.location.href = "/onboarding";
              }}
              className="w-full md:w-auto rounded-xl bg-primary text-white hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-primary/20"
            >
              Aktifkan API Saya
            </Button>
            <Button 
              onClick={() => setShowApiNotice(false)}
              variant="ghost" 
              size="icon" 
              className="rounded-xl hover:bg-primary/10 h-12 w-12"
            >
              <Users className="w-5 h-5 opacity-40" />
            </Button>
          </div>
        </motion.div>
      )}

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
                    
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        id={`btn-export-${project.id}`}
                        onClick={(e) => handleExportProject(e, project)}
                        className="h-8 w-8 rounded-lg hover:bg-primary/15 hover:text-primary transition-all text-muted-foreground"
                        title="Export Project Progress"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      {/* Delete Flow with Double Confirmation */}
                      <div className="flex items-center gap-1">
                        {deleteConfirm[project.id] > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(prev => ({ ...prev, [project.id]: 0 }));
                            }}
                            className="h-8 w-8 rounded-lg hover:bg-slate-200 text-slate-500"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          variant={deleteConfirm[project.id] === 2 ? "destructive" : deleteConfirm[project.id] === 1 ? "outline" : "ghost"}
                          size={deleteConfirm[project.id] > 0 ? "sm" : "icon"}
                          id={`btn-delete-${project.id}`}
                          onClick={(e) => handleDeleteProject(e, project.id)}
                          className={cn(
                            "h-8 rounded-lg transition-all text-[9.5px] font-black uppercase tracking-wider",
                            deleteConfirm[project.id] > 0 ? "px-2.5 h-8 gap-1" : "w-8 h-8 hover:bg-red-500/10 text-red-500 hover:text-red-600"
                          )}
                        >
                          {deleteConfirm[project.id] === 2 ? (
                            <>SANGAT YAKIN?</>
                          ) : deleteConfirm[project.id] === 1 ? (
                            <>YUK YAKIN?</>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-1.5 ml-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Step</span>
                        <span className="text-xl font-heading font-black text-foreground">{project.currentStep}/8</span>
                      </div>
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


