import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Target, 
  Gift, 
  TrendingUp, 
  FileText,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";

// Step Components (Stubs for now, will be implemented)
import NicheStep from "@/components/workflow/NicheStep";
import AudienceStep from "@/components/workflow/AudienceStep";
import PainPointStep from "@/components/workflow/PainPointStep";
import ValidationStep from "@/components/workflow/ValidationStep";
import PositioningStep from "@/components/workflow/PositioningStep";
import OfferStep from "@/components/workflow/OfferStep";
import AngleStep from "@/components/workflow/AngleStep";
import CopyStep from "@/components/workflow/CopyStep";
import AdsContentStep from "@/components/workflow/AdsContentStep";

const STEPS = [
  { id: 1, title: "Niche Research", icon: Search, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: 2, title: "Audience Discovery", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: 3, title: "Pain Point Analysis", icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  { id: 4, title: "Market Validation", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: 5, title: "Product Positioning", icon: Target, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: 6, title: "Offer Creation", icon: Gift, color: "text-pink-500", bg: "bg-pink-500/10" },
  { id: 7, title: "Marketing Angles", icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { id: 8, title: "Copy Direction", icon: FileText, color: "text-orange-500", bg: "bg-orange-500/10" },
];

const MODES = [
  { id: "strategy", title: "Sales Strategy Preparation", icon: Target },
  { id: "ads", title: "Ads Content Preparation", icon: Zap },
];

export default function WorkflowWizard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeStep, setActiveStep] = React.useState(1);
  const [activeMode, setActiveMode] = React.useState<"strategy" | "ads">("strategy");

  const { config } = useBranding();

  React.useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      try {
        const params = new URLSearchParams(window.location.search);
        const modeParam = params.get("mode");

        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProject(data);
          setActiveStep(data.currentStep || 1);
          
          if (modeParam === "ads" && (data.currentStep || 1) >= 8) {
            setActiveMode("ads");
          } else if (modeParam === "strategy") {
            setActiveMode("strategy");
          } else if (data.currentStep >= 9) {
            setActiveMode("ads");
          }
        } else {
          toast.error("Project not found");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching project");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId, navigate]);

  const updateProjectData = async (stepKey: string, data: any, nextStep?: boolean) => {
    if (!projectId) return;
    try {
      const docRef = doc(db, "projects", projectId);
      const updates: any = {
        [stepKey]: data,
        updatedAt: serverTimestamp(),
      };
      if (nextStep && activeStep < 8) {
        updates.currentStep = activeStep + 1;
        setActiveStep(activeStep + 1);
      } else if (nextStep && activeStep === 8) {
        // Move to Ads phase
        updates.currentStep = 9;
        setActiveMode("ads");
      }
      await updateDoc(docRef, updates);
      setProject((prev: any) => ({ ...prev, ...updates }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to save progress");
    }
  };

  const handleManualSave = async (data: any) => {
    if (!projectId) return;
    try {
      const docRef = doc(db, "projects", projectId);
      await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
      setProject(prev => ({ ...prev, ...data }));
    } catch (error) {
       console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Syncing Project Memory...</p>
      </div>
    );
  }

  const renderContent = () => {
    const commonProps = {
      project,
      onSaveProject: handleManualSave,
      onSave: (data: any, next?: boolean) => {
        const stepKeys = [
          "", "nicheData", "audienceData", "painPointData", 
          "validationData",
          "positioningData", "offerData", "marketingAngles", "copyDirection"
        ];
        const key = stepKeys[activeStep];
        updateProjectData(key, data, next);
      }
    };

    if (activeMode === "ads") {
      return <AdsContentStep {...commonProps} />;
    }

    switch (activeStep) {
      case 1: return <NicheStep {...commonProps} />;
      case 2: return <AudienceStep {...commonProps} />;
      case 3: return <PainPointStep {...commonProps} />;
      case 4: return <ValidationStep {...commonProps} />;
      case 5: return <PositioningStep {...commonProps} />;
      case 6: return <OfferStep {...commonProps} />;
      case 7: return <AngleStep {...commonProps} />;
      case 8: return <CopyStep {...commonProps} />;
      default: return <NicheStep {...commonProps} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top Navigation: Status Bar */}
      <div className="bg-card border-b border-border p-4 px-8 flex items-center justify-between">
        <div className="flex items-center gap-8">
           <h1 className="text-xl font-heading font-black tracking-tighter text-foreground group cursor-pointer" onClick={() => navigate('/dashboard')}>
             {config.brandName.toUpperCase()} <span className="text-primary">{config.toolName.toUpperCase()}</span>
           </h1>
           <div className="h-4 w-px bg-border hidden md:block" />
           <div className="hidden md:flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                 <Target className="w-4 h-4 text-primary" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-foreground">{project?.name}</p>
                 <p className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest">Active Intelligence Session</p>
              </div>
           </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center bg-secondary/50 px-4 py-2 rounded-xl border border-border">
              <Zap className="w-3.5 h-3.5 text-primary mr-2" />
              <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Syncing strategy memory...</span>
           </div>
           <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center font-black text-xs text-primary">
              {auth.currentUser?.displayName?.charAt(0) || "S"}
           </div>
        </div>
      </div>

      {activeMode === "strategy" && (
        <div className="h-2 w-full bg-secondary flex overflow-hidden">
          {STEPS.map((step) => (
            <div 
              key={step.id} 
              className={`h-full flex-1 transition-all duration-500 ${step.id <= activeStep ? "bg-primary" : "bg-transparent opacity-20"}`}
            />
          ))}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar (Only for Strategy Mode) */}
        {activeMode === "strategy" && (
          <div className="w-16 md:w-80 border-r border-border bg-card/50 flex flex-col overflow-y-auto">
            <div className="p-4 md:p-8">
              <h2 className="hidden md:block text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-8">Workflow Engine</h2>
              <div className="space-y-3">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isActive = activeStep === step.id;
                  const isCompleted = activeStep > step.id;
                  
                  return (
                    <div 
                      key={step.id}
                      onClick={() => step.id <= (project?.currentStep || 1) && setActiveStep(step.id)}
                      className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                        isActive ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" : 
                        isCompleted ? "bg-secondary/50 text-foreground border-border hover:border-primary/30" : 
                        "opacity-40 grayscale border-transparent pointer-events-none"
                      }`}
                    >
                      <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? "bg-white/20" : step.bg}`}>
                        <Icon className={`w-4 h-4 ${isActive ? "text-white" : step.color}`} />
                      </div>
                      <div className="hidden md:block flex-1 min-w-0">
                        <p className={`text-xs font-black uppercase tracking-widest truncate ${isActive ? "text-white" : "text-foreground"}`}>
                          Step {step.id}
                        </p>
                        <p className={`text-[10px] font-medium opacity-60 truncate ${isActive ? "text-white/80" : "text-muted-foreground"}`}>
                          {step.title}
                        </p>
                      </div>
                      {isCompleted && !isActive && <CheckCircle2 className="hidden md:block w-4 h-4 text-emerald-500" />}
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-auto p-4 md:p-6 space-y-3 bg-secondary/20 border-t border-border">
              <div className="p-4 bg-card rounded-2xl border border-border shadow-inner mb-4 hidden md:block">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Context Sync</span>
                </div>
                <p className="text-[9px] text-muted-foreground font-medium leading-relaxed italic">
                  AI is processing your previous steps to maintain perfect consistency.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Workflow Modes</p>
                {MODES.map((mode) => {
                  const isEnabled = mode.id === "ads" ? config.featureFlags.enableCarousel || config.featureFlags.enableVideo : true;
                  if (!isEnabled) return null;

                  return (
                    <Button
                      key={mode.id}
                      variant={activeMode === mode.id ? "default" : "ghost"}
                      onClick={() => {
                        if (mode.id === "ads" && (project?.currentStep || 1) < 8) {
                          toast.error("Please complete strategy steps first");
                          return;
                        }
                        setActiveMode(mode.id as any);
                      }}
                      className={cn(
                        "w-full h-12 justify-start gap-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all",
                        activeMode === mode.id ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <mode.icon className="w-4 h-4" />
                      <span className="truncate">
                        {mode.id === "strategy" ? "1. SALES STRATEGY PREPARATION" : "2. ADS CONTENT PREPARATION"}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Workspace Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12">
          <div className={activeMode === "ads" ? "w-full" : "max-w-4xl mx-auto"}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMode === "ads" ? "ads" : activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeMode === "strategy" && (
                  <div className="mb-8 flex items-end justify-between border-b border-border pb-6">
                    <div>
                      <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-1">Module {activeStep} of 8</p>
                      <h1 className="text-3xl font-heading font-black tracking-tighter text-foreground leading-none">
                        {STEPS[activeStep - 1].title}
                      </h1>
                    </div>
                    <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-xl border border-border shadow-sm">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">AI SYNC ACTIVE</span>
                    </div>
                  </div>
                )}

                {renderContent()}

                {activeMode === "strategy" && (
                  <div className="flex items-center justify-between mt-12 pt-12 border-t border-border">
                    <Button 
                      variant="ghost" 
                      disabled={activeStep === 1}
                      onClick={() => setActiveStep(prev => prev - 1)}
                      className="rounded-xl font-bold gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>
                    
                    {activeStep < (project?.currentStep || 1) && (
                      <Button 
                        onClick={() => setActiveStep(prev => prev + 1)}
                        className="rounded-xl bg-secondary text-foreground hover:bg-secondary/80 font-bold gap-2 px-8"
                      >
                        Next Step
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
