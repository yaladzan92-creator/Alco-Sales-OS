import React from "react";
import { 
  Image as ImageIcon, 
  Layout, 
  Video, 
  Sparkles, 
  Brain, 
  Zap, 
  Loader2, 
  CheckCircle2, 
  MessageSquare, 
  RotateCcw, 
  RefreshCcw,
  ChevronRight, 
  ChevronLeft,
  Trophy,
  History,
  Send,
  Plus,
  Download,
  Upload,
  User,
  CreditCard,
  BarChart3,
  Copy,
  Save,
  Rocket,
  Play,
  Film,
  Presentation,
  Maximize2,
  MoreVertical,
  ExternalLink
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { generateAIContent, AGENT_PROMPTS } from "@/services/aiService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const AdsImage = ({ src, alt, className, ...props }: any) => {
  const [error, setError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [retryCount, setRetryCount] = React.useState(0);

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setError(false);
    setLoading(true);
    setRetryCount(prev => prev + 1);
  };

  // Add a unique seed for retries
  const finalSrc = src ? (src.includes('?') ? `${src}&retry=${retryCount}` : `${src}?retry=${retryCount}`) : null;

  if (!src) {
     return (
        <div className={cn("w-full h-full bg-slate-900 flex items-center justify-center", className)}>
           <ImageIcon className="w-8 h-8 text-white/10" />
        </div>
     );
  }

  return (
    <div className={cn("relative w-full h-full bg-slate-900 overflow-hidden", className)}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-slate-900/50 backdrop-blur-sm">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center space-y-2 bg-slate-900">
           <ImageIcon className="w-8 h-8 text-slate-700" />
           <p className="text-[10px] font-black uppercase tracking-tight text-slate-500">Generation Failed</p>
           <Button variant="outline" size="sm" onClick={handleRetry} className="h-7 text-[8px] rounded-lg border-white/10 bg-white/5 hover:bg-white/10">
             <RefreshCcw className="w-3 h-3 mr-1.5" /> Retry
           </Button>
        </div>
      ) : (
        <img
          src={finalSrc || ""}
          alt={alt}
          className={cn("w-full h-full object-cover transition-all duration-700", loading ? "scale-105 opacity-0" : "scale-100 opacity-100")}
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
          referrerPolicy="no-referrer"
          {...props}
        />
      )}
    </div>
  );
};

import { useBranding } from "@/contexts/BrandingContext";

export default function AdsContentStep({ project, onSaveProject }: any) {
  const { config } = useBranding();
  // Sub-workflow steps: 1. Script, 2. Visual, 3. Carousel, 4. Video
  const [subStep, setSubStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [loadingStatus, setLoadingStatus] = React.useState("");
  const [assistantLoading, setAssistantLoading] = React.useState(false);
  const [chatInput, setChatInput] = React.useState("");
  
  // Current active result being viewed/edited
  const [currentResult, setCurrentResult] = React.useState<any>(null);
  const [visualResult, setVisualResult] = React.useState<any>(null);
  const [carouselResult, setCarouselResult] = React.useState<any>(null);
  const [videoResult, setVideoResult] = React.useState<any>(null);
  
  // History of generated ads stored in project memory
  const [variations, setVariations] = React.useState<any[]>(project?.adsVariations || []);
  const [isOptimizing, setIsOptimizing] = React.useState(false);

  const [tokens, setTokens] = React.useState({
    daily: 1200,
    dailyTotal: 2000,
    image: 35,
    imageTotal: 100,
    video: 12,
    videoTotal: 30
  });

  const handleGenerateScript = async (type: string, customPrompt?: string) => {
    setLoading(true);
    setLoadingStatus("Menganalisis Strategi & Summaries...");
    try {
      const context = `
        STRATEGY DATA:
        Summary: ${JSON.stringify(project.summaryData || {})}.
        Niche: ${JSON.stringify(project.nicheData?.selectedOption || {})}.
        Audience: ${JSON.stringify(project.audienceData?.selectedOption || {})}.
        Problem: ${JSON.stringify(project.painPointData?.selectedOption || {})}.
        Positioning: ${JSON.stringify(project.positioningData?.selectedOption || {})}.
        Offer: ${JSON.stringify(project.offerData?.selectedOption || {})}.
        Angles: ${JSON.stringify(project.marketingAngles?.selectedOption || {})}.
        Copy: ${JSON.stringify(project.copyDirection?.selectedOption || {})}.
        
        REQUESTED TYPE: ${type}
        ${customPrompt ? `SPECIFIC DIRECTION: ${customPrompt}` : ""}
      `;

      const response = await generateAIContent(
        context,
        AGENT_PROMPTS.GENERATE_ADS_CONTENT
      );
      
      const cleanText = response.text.replace(/```json\n?|```/g, "").trim();
      const data = JSON.parse(cleanText);
      const newVariation = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...data
      };
      
      setCurrentResult(newVariation);
      setSubStep(1);
      toast.success("Full Ads Preparation Generated!");
      setTokens(prev => ({ ...prev, daily: prev.daily - 15 }));
    } catch (error: any) {
      console.error(error);
      toast.error("Generation failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeAds = async () => {
    if (!currentResult) return;
    setIsOptimizing(true);
    setLoadingStatus("Polishing Hooks & Conversion Power...");
    try {
      const context = `CURRENT ADS CONTENT: ${JSON.stringify(currentResult)}`;
      const response = await generateAIContent(context, AGENT_PROMPTS.OPTIMIZE_ADS);
      const cleanText = response.text.replace(/```json\n?|```/g, "").trim();
      const data = JSON.parse(cleanText);
      
      setCurrentResult(prev => ({ ...prev, ...data }));
      toast.success("Ads Content Optimized for High Conversion!");
    } catch (error: any) {
      toast.error("Optimization failed");
    } finally {
      setIsOptimizing(false);
      setLoadingStatus("");
    }
  };

  const handleDownloadPackage = () => {
    if (!currentResult) return;
    
    const packageData = {
      project_name: project.name,
      strategy_summary: project.summaryData,
      ads_content: {
        ...currentResult,
        visual_assets: visualResult,
        carousel_assets: carouselResult,
        video_assets: videoResult
      },
      export_date: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(packageData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `ADS_PACKAGE_${project.name || 'project'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("Ads Package Downloaded (JSON)!");
  };

  const handleGenerateVisual = async () => {
    if (!currentResult) return;
    setLoading(true);
    setLoadingStatus("Menterjemahkan Script ke Bahasa Visual...");
    try {
      const context = `ADS SCRIPT: ${JSON.stringify(currentResult)}`;
      const response = await generateAIContent(context, AGENT_PROMPTS.GENERATE_VISUAL_DIRECTION);
      const data = JSON.parse(response.text.replace(/```json\n?|```/g, "").trim());
      
      setLoadingStatus("Merancang Komposisi & Moodboard...");
      await new Promise(r => setTimeout(r, 1500));
      
      setVisualResult(data);
      setSubStep(2);
      setTokens(prev => ({ ...prev, image: prev.image - 5 }));
      toast.success("Visual Direction & Image Prompt Generated!");
    } catch (error: any) {
      toast.error("Visual generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCarousel = async () => {
    if (!currentResult) return;
    setLoading(true);
    setLoadingStatus("Membangun Struktur Storytelling Carousel...");
    try {
      const context = `ADS SCRIPT & CONTEXT: ${JSON.stringify(currentResult)}`;
      const response = await generateAIContent(context, AGENT_PROMPTS.GENERATE_CAROUSEL_DETAILS);
      const data = JSON.parse(response.text.replace(/```json\n?|```/g, "").trim());
      
      setLoadingStatus("Menghasilkan Ide Visual per Slide...");
      await new Promise(r => setTimeout(r, 2000));
      
      setCarouselResult(data);
      setSubStep(3);
      setTokens(prev => ({ ...prev, image: prev.image - 10 }));
      toast.success("Carousel Design Flow Generated!");
    } catch (error: any) {
      toast.error("Carousel generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!currentResult) return;
    setLoading(true);
    setLoadingStatus("Merancang Storyboard Scene-by-Scene...");
    try {
      const context = `ADS SCRIPT & CONTEXT: ${JSON.stringify(currentResult)}`;
      const response = await generateAIContent(context, AGENT_PROMPTS.GENERATE_VIDEO_STORYBOARD);
      const data = JSON.parse(response.text.replace(/```json\n?|```/g, "").trim());
      
      setLoadingStatus("Menghitung Durasi & Pacing Audio...");
      await new Promise(r => setTimeout(r, 1500));
      
      setVideoResult(data);
      setSubStep(4);
      setTokens(prev => ({ ...prev, video: prev.video - 1 }));
      toast.success("Video Storyboard Generated!");
    } catch (error: any) {
      toast.error("Video generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVariation = () => {
    if (!currentResult) return;
    const itemToSave = {
      ...currentResult,
      visual: visualResult,
      carousel: carouselResult,
      video: videoResult,
      savedAt: new Date().toISOString()
    };
    const updated = [itemToSave, ...variations];
    setVariations(updated);
    onSaveProject({ adsVariations: updated });
    toast.success("Variation saved to project history!");
  };

  const handleDownloadProject = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `project_${project.id || 'export'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("Project data downloaded!");
  };

  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        onSaveProject(imported);
        toast.success("Project imported successfully!");
      } catch (err) {
        toast.error("Invalid project file");
      }
    };
    reader.readAsText(file);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    setAssistantLoading(true);
    try {
      const context = `
        PROJECT HISTORY: ${JSON.stringify(project)}
        CURRENT_AD_SCRIPT: ${JSON.stringify(currentResult)}
        CURRENT_VISUAL: ${JSON.stringify(visualResult)}
        CURRENT_CAROUSEL: ${JSON.stringify(carouselResult)}
        CURRENT_VIDEO: ${JSON.stringify(videoResult)}
        CURRENT_VIEW: ${subStep === 1 ? 'Script' : subStep === 2 ? 'Visual' : subStep === 3 ? 'Carousel' : 'Video'}
        USER_REQUEST: ${chatInput}
      `;
      
      const response = await generateAIContent(
        context,
        `Act as a professional Ads Assistant. Help the user revise their ad content or generate new ones based on their specific request. Respond in Indonesian. 
        If the user wants to change a specific part (Script, Visual, Carousel, or Video), return the updated JSON for THAT specific part only. 
        If it's a general question, just respond with text.`
      );
      
      if (response.text.includes("{") && response.text.includes("}")) {
          const cleanText = response.text.replace(/```json\n?|```/g, "").trim();
          try {
            const data = JSON.parse(cleanText);
            
            // Intelligence logic to determine what was updated
            if (data.hook || data.primary_text) {
              setCurrentResult(prev => ({ ...prev, ...data }));
              toast.success("Ad Script updated!");
            } else if (data.prompt || data.composition) {
              setVisualResult(prev => ({ ...prev, ...data }));
              toast.success("Visual updated!");
            } else if (data.slides && subStep === 3) {
              setCarouselResult(prev => ({ ...prev, ...data }));
              toast.success("Carousel updated!");
            } else if (data.scenes && subStep === 4) {
              setVideoResult(prev => ({ ...prev, ...data }));
              toast.success("Video updated!");
            } else {
              // Fallback
              setCurrentResult(data);
            }
          } catch {
             toast.info(response.text);
          }
      } else {
        toast.info("AI: " + response.text);
      }
      setChatInput("");
    } catch (error: any) {
      toast.error("Assistant failed: " + error.message);
    } finally {
      setAssistantLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleDownloadImage = async (url: string, filename: string) => {
    toast.info("Preparing download...");
    try {
      // Use proxy to bypass CORS
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Failed to fetch image via proxy");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download started!");
    } catch (err) {
      console.error("Download error:", err);
      // Fallback: open in new tab
      window.open(url, '_blank');
      toast.info("Opening in new tab. Right-click and 'Save Image As' to download.");
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 min-h-[900px]">
      {/* LEFT SIDEBAR: PROFILE & CONTROLS */}
      <div className="xl:col-span-3 space-y-6">
        {/* User Card */}
        <div className="p-6 bg-card border border-border rounded-[2.5rem] shadow-xl">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                 <User className="w-6 h-6 text-primary" />
              </div>
              <div className="overflow-hidden">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Logged Account</p>
                 <p className="text-xs font-bold truncate">y.aladzan.92@gmail.com</p>
              </div>
           </div>

           <div className="space-y-4">
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Daily Tokens</span>
                    <span className="text-primary">{tokens.daily} / {tokens.dailyTotal}</span>
                 </div>
                 <Progress value={(tokens.daily / tokens.dailyTotal) * 100} className="h-1.5 bg-slate-200" />
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Image Tokens</span>
                    <span className="text-blue-500">{tokens.image} / {tokens.imageTotal}</span>
                 </div>
                 <Progress value={(tokens.image / tokens.imageTotal) * 100} className="h-1.5 bg-slate-200" />
              </div>
              <div className="space-y-2">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Video Tokens</span>
                    <span className="text-purple-500">{tokens.video} / {tokens.videoTotal}</span>
                 </div>
                 <Progress value={(tokens.video / tokens.videoTotal) * 100} className="h-1.5 bg-slate-200" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-2 mt-8 pt-6 border-t border-border/50">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadProject}
                className="h-10 text-[9px] font-black uppercase tracking-widest rounded-xl gap-2"
              >
                 <Download className="w-3 h-3" /> Export
              </Button>
              <div className="relative">
                 <input 
                   type="file" 
                   className="absolute inset-0 opacity-0 cursor-pointer" 
                   onChange={handleImportProject}
                 />
                 <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full h-10 text-[9px] font-black uppercase tracking-widest rounded-xl gap-2"
                 >
                    <Upload className="w-3 h-3" /> Import
                 </Button>
              </div>
           </div>
        </div>

        {/* Content Generator Menu */}
        <div className="p-6 bg-card border border-border rounded-[2.5rem] shadow-xl">
           <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Create Content
           </h3>
           <div className="space-y-3">
              {[
                { id: "image", label: "Single Image Ad", icon: ImageIcon, color: "text-blue-500" },
                { id: "carousel", label: "Carousel Experience", icon: Layout, color: "text-orange-500" },
                { id: "video", label: "Short Form Video", icon: Video, color: "text-purple-500" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleGenerateScript(item.id)}
                  disabled={loading}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group text-left"
                >
                   <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className={cn("w-5 h-5", item.color)} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground">{item.label}</p>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-60">Start generation</p>
                   </div>
                   <ChevronRight className="w-4 h-4 ml-auto opacity-20 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
           </div>
        </div>

        {/* History / Saved Variations */}
        <div className="p-6 bg-card border border-border rounded-[2.5rem] shadow-xl mt-6">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 opacity-60">
                 <History className="w-3 h-3" /> Saved Pins
              </h3>
              <span className="text-[8px] font-black bg-slate-100 px-2 py-0.5 rounded-full">{variations.length}</span>
           </div>
           <ScrollArea className="h-[200px]">
              <div className="space-y-2 pr-4">
                 {variations.map((v, i) => (
                   <button 
                    key={v.id || i} 
                    onClick={() => {
                        setCurrentResult(v);
                        setVisualResult(v.visual);
                        setCarouselResult(v.carousel);
                        setVideoResult(v.video);
                    }}
                    className="w-full text-left p-3 bg-secondary/30 rounded-xl border border-transparent hover:border-primary/30 transition-all group"
                   >
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary mb-1">{v.type}</p>
                      <p className="text-[10px] font-bold truncate transition-colors group-hover:text-primary">{v.headline || v.headlines?.[0] || v.viral_hook}</p>
                      <p className="text-[7px] font-medium opacity-40 mt-1">{new Date(v.timestamp || v.savedAt).toLocaleDateString()}</p>
                   </button>
                 ))}
              </div>
           </ScrollArea>
        </div>
      </div>

      {/* MAIN WORKFLOW AREA */}
      <div className="xl:col-span-9 space-y-6">
        {/* BREADCRUMB STEPS */}
        <div className="p-4 bg-card border border-border rounded-[2rem] shadow-lg flex items-center justify-between">
           <div className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar">
              {[
                { id: 1, label: "Detailed Script", icon: FileTextIcon, enabled: true },
                { id: 2, label: "Strategic Visual", icon: ImageIcon, enabled: true },
                { id: 3, label: "Carousel Flow", icon: Layout, enabled: config.featureFlags.enableCarousel },
                { id: 4, label: "Video Storyboard", icon: Film, enabled: config.featureFlags.enableVideo }
              ].filter(s => s.enabled).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSubStep(s.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap",
                    subStep === s.id ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "hover:bg-slate-100 opacity-60"
                  )}
                >
                   <span className="text-[10px] font-black transition-all">{s.id}. {s.label}</span>
                </button>
              ))}
           </div>
           <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSaveVariation}
                disabled={!currentResult}
                className="w-10 h-10 rounded-xl hover:bg-primary/10 hover:text-primary"
              >
                 <Save className="w-5 h-5" />
              </Button>
           </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 min-h-[700px] bg-slate-950 rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/5 flex flex-col">
           {/* Result Header */}
           <div className="p-8 border-b border-white/5 bg-slate-900/50 flex flex-wrap justify-between items-center gap-4 relative z-10">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 relative">
                    <Brain className="w-6 h-6 text-white" />
                    {loading && (
                       <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border-2 border-primary">
                          <Loader2 className="w-2 h-2 animate-spin text-primary" />
                       </div>
                    )}
                 </div>
                 <div>
                    <h2 className="text-xl font-heading font-black tracking-tight text-white uppercase italic">
                       {subStep === 1 && "Ads Intelligence Framework"}
                       {subStep === 2 && "Visual Conversion Strategy"}
                       {subStep === 3 && "Carousel Persuasion Flow"}
                       {subStep === 4 && "Retention-First Video Storyboard"}
                    </h2>
                    <p className="text-[9px] font-bold text-primary uppercase tracking-[0.3em]">{config.aiAssistantName} High-Conversion System</p>
                 </div>
              </div>
              
              <AnimatePresence mode="wait">
                 {loading || isOptimizing ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-end gap-1 text-primary"
                    >
                       <Loader2 className="w-5 h-5 animate-spin" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-[#FFF]">{loadingStatus || "AI Thinking..."}</span>
                    </motion.div>
                 ) : (
                    <motion.div 
                      key="actions"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-wrap gap-2 justify-end"
                    >
                       {!currentResult ? (
                         <Button 
                           onClick={() => handleGenerateScript("image")}
                           className="bg-primary hover:bg-primary/90 text-white rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-6 shadow-lg shadow-primary/20 transition-all font-heading"
                         >
                            <Sparkles className="w-4 h-4 mr-2" /> Generate Content
                         </Button>
                       ) : (
                         <>
                           <Button 
                             variant="outline" 
                             size="sm" 
                             onClick={() => handleGenerateScript(currentResult.type || "image")}
                             className="bg-white/5 border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-4 flex gap-2 hover:bg-primary/20 hover:border-primary/20 transition-all group"
                           >
                              <RefreshCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" /> Generate Again
                           </Button>
                           <Button 
                             variant="outline" 
                             size="sm" 
                             disabled={isOptimizing}
                             onClick={handleOptimizeAds}
                             className="bg-orange-500/10 border-orange-500/20 text-orange-500 rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-4 flex gap-2 hover:bg-orange-500/20 transition-all"
                           >
                              <Zap className="w-3 h-3" /> Optimize with AI
                           </Button>
                           <Button 
                             variant="outline" 
                             size="sm" 
                             onClick={handleDownloadPackage}
                             className="bg-cyan-500/10 border-cyan-500/20 text-cyan-500 rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-4 flex gap-2 hover:bg-cyan-500/20 transition-all"
                           >
                              <Download className="w-3 h-3" /> Download Ads Package
                           </Button>
                         </>
                       )}
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Dynamic Content View */}
           <div className="flex-1 overflow-y-auto p-8 relative">
              {!currentResult ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                   <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                      <Sparkles className="w-12 h-12 text-primary" />
                      <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping" />
                   </div>
                   <h3 className="text-2xl font-heading font-black tracking-tighter text-white mb-2 underline decoration-primary decoration-4 underline-offset-8 uppercase">Ready to Prepare Ads</h3>
                   <p className="text-slate-400 text-sm max-w-md mt-4 font-medium uppercase tracking-[0.1em] leading-relaxed">
                      Strategi dari Step 1-9 telah diproses. Tekan 'Generate Content' untuk mulai merancang iklan multi-channel yang saling terhubung.
                   </p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                   {/* SUBSTEP 1: DETAILED SCRIPT & HOOK SYSTEM */}
                   {subStep === 1 && (
                     <div className="space-y-8">
                        {/* THE HOOK SYSTEM */}
                        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
                           {[
                             { t: "Viral Hook", val: currentResult.viral_hook, c: "text-blue-400", bg: "bg-blue-400/5" },
                             { t: "Scroll Stopper", val: currentResult.scroll_stopper_hook, c: "text-pink-400", bg: "bg-pink-400/5" },
                             { t: "Curiosity", val: currentResult.curiosity_hook, c: "text-orange-400", bg: "bg-orange-400/5" },
                             { t: "Emotional", val: currentResult.emotional_hook, c: "text-purple-400", bg: "bg-purple-400/5" },
                             { t: "Urgency", val: currentResult.urgency_hook, c: "text-red-400", bg: "bg-red-400/5" }
                           ].map((h, i) => (
                             <div key={i} className={cn("p-6 rounded-[2rem] border border-white/5 group hover:border-white/20 transition-all", h.bg)}>
                                <p className={cn("text-[9px] font-black uppercase tracking-widest mb-3", h.c)}>{h.t}</p>
                                <p className="text-[11px] font-bold text-white italic leading-relaxed">"{h.val}"</p>
                             </div>
                           ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                           <div className="space-y-6">
                              <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 relative">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Optimized Headlines (TEST 3 VARIATIONS)</p>
                                 <div className="space-y-3">
                                    {currentResult.headlines?.map((h: string, idx: number) => (
                                      <div key={idx} className="flex gap-4 items-center p-4 bg-black/40 rounded-xl border border-white/5 group">
                                         <span className="text-[10px] font-black text-slate-500">#{idx+1}</span>
                                         <p className="text-sm font-bold text-white">{h}</p>
                                         <button onClick={() => copyToClipboard(h)} className="ml-auto opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg"><Copy className="w-3 h-3 text-white" /></button>
                                      </div>
                                    ))}
                                 </div>
                              </div>
                              <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 relative">
                                 <div className="absolute top-6 right-6">
                                    <button onClick={() => copyToClipboard(currentResult.primary_text)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"><Copy className="w-4 h-4" /></button>
                                 </div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Ad Copy / Primary Text</p>
                                 <p className="text-sm text-slate-300 leading-loose whitespace-pre-wrap">{currentResult.primary_text}</p>
                                 <div className="mt-8 flex flex-wrap gap-2">
                                    {currentResult.hashtags?.map((t: string) => (
                                      <span key={t} className="text-[9px] font-bold text-slate-500">#{t.replace('#', '')}</span>
                                    ))}
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <div className="p-8 bg-primary rounded-[3rem] shadow-3xl shadow-primary/20">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-4 flex items-center gap-2"><Trophy className="w-4 h-4" /> Strategy Direction</p>
                                 <div className="space-y-4">
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                       <p className="text-[9px] font-bold text-white/50 uppercase mb-1">Target Psychology</p>
                                       <p className="text-xs font-black text-white">{currentResult.target_psychology}</p>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                       <p className="text-[9px] font-bold text-white/50 uppercase mb-1">Communication Tone</p>
                                       <p className="text-xs text-white leading-relaxed font-bold">{currentResult.communication_tone}</p>
                                    </div>
                                    <div className="pt-2">
                                       <p className="text-[9px] font-bold text-white/80 uppercase mb-2">Campaign Analysis</p>
                                       <p className="text-[11px] italic text-white/70 leading-relaxed">"{currentResult.analysis}"</p>
                                    </div>
                                 </div>
                              </div>
                              <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
                                 <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Final CTA Direction</p>
                                 <h4 className="text-2xl font-heading font-black text-white underline decoration-primary decoration-4 underline-offset-8">{currentResult.cta_direction || currentResult.cta}</h4>
                              </div>
                           </div>
                        </div>
                     </div>
                   )}

                   {/* SUBSTEP 2: STRATEGIC VISUAL (SINGLE IMAGE ADS) */}
                   {subStep === 2 && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                         <div className="lg:col-span-12">
                            <div className="p-8 bg-blue-500/10 rounded-[3rem] border border-blue-500/20">
                               <div className="flex justify-between items-start mb-8">
                                  <div className="flex items-center gap-3">
                                     <Rocket className="w-6 h-6 text-blue-500" />
                                     <h4 className="text-lg font-black uppercase tracking-widest text-white italic">Image Ads Generation Protocol</h4>
                                  </div>
                                  <Button size="sm" onClick={handleGenerateVisual} className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl">Generate Visual</Button>
                               </div>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                  <div className="space-y-6">
                                     <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-2">Visual Psychology & Strategy</p>
                                        <p className="text-sm font-bold text-white mb-2">{currentResult.image_concept || visualResult?.concept}</p>
                                        <p className="text-xs text-slate-400 leading-relaxed">{currentResult.visual_psychology || visualResult?.direction}</p>
                                     </div>
                                     <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5 relative">
                                        <button onClick={() => copyToClipboard(currentResult.image_prompt || visualResult?.prompt)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg text-slate-500"><Copy className="w-3 h-3" /></button>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-2">AI Optimized Image Prompt</p>
                                        <p className="text-xs font-medium text-slate-300 leading-relaxed italic">"{currentResult.image_prompt || visualResult?.prompt || "Generate visual prompt first..."}"</p>
                                     </div>
                                     <div className="p-6 bg-blue-500/20 rounded-[2rem] border border-blue-500/20">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-2">Caption Strategy</p>
                                        <p className="text-xs text-white leading-relaxed italic">"{currentResult.caption}"</p>
                                     </div>
                                  </div>

                                  <div className="aspect-square bg-slate-900 rounded-[3rem] border border-white/10 flex items-center justify-center relative group overflow-hidden shadow-2xl">
                                      {(currentResult.image_prompt || visualResult?.prompt) ? (
                                        <>
                                          <AdsImage 
                                            src={`https://image.pollinations.ai/prompt/${encodeURIComponent((currentResult.image_prompt || visualResult?.prompt) + " photorealistic, commercial photography, high resolution, professional lighting")}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`}
                                            alt="Ad Visual Preview"
                                            className="group-hover:scale-110"
                                          />
                                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                             <Button 
                                               onClick={() => handleDownloadImage(`https://image.pollinations.ai/prompt/${encodeURIComponent(currentResult.image_prompt || visualResult?.prompt)}?width=2048&height=2048&nologo=true`, 'ad_visual.jpg')}
                                               size="sm" 
                                               className="bg-black/50 backdrop-blur-md text-white border border-white/20 rounded-xl"
                                             >
                                                <Download className="w-4 h-4" />
                                             </Button>
                                          </div>
                                        </>
                                      ) : (
                                         <div className="text-center p-8">
                                            <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">No Visual Generated Yet</p>
                                         </div>
                                      )}
                                      <div className="absolute inset-x-4 bottom-4 p-6 bg-black/60 backdrop-blur-md rounded-[2rem] border border-white/10">
                                         <p className="text-[8px] font-black text-blue-400 uppercase mb-1">Layout Protocol</p>
                                         <p className="text-[10px] font-bold text-white line-clamp-2">{currentResult.composition_guide || visualResult?.composition}</p>
                                      </div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </div>
                   )}

                   {/* SUBSTEP 3: CAROUSEL ADS EXPERIENCE */}
                   {subStep === 3 && (
                     <div className="space-y-8">
                        <div className="p-8 bg-orange-500/10 rounded-[3rem] border border-orange-500/20">
                           <div className="flex items-center justify-between mb-8">
                              <div className="space-y-1">
                                 <h4 className="text-xl font-heading font-black text-white uppercase tracking-tight italic">Carousel Persuasion Flow</h4>
                                 <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest leading-none">Multi-Slide Storytelling Strategy</p>
                              </div>
                              <Button size="sm" onClick={handleGenerateCarousel} className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl">Gen Carousel Details</Button>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                              <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-2">Storytelling Direction</p>
                                 <p className="text-sm font-bold text-white leading-relaxed italic">"{currentResult.storytelling_direction}"</p>
                              </div>
                              <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-orange-400 mb-2">Carousel Master Caption</p>
                                 <p className="text-xs text-slate-300 leading-relaxed italic">"{currentResult.carousel_caption || currentResult.caption}"</p>
                              </div>
                           </div>

                           <ScrollArea className="w-full whitespace-nowrap pb-6">
                              <div className="flex gap-4 min-w-full">
                                 {(currentResult.slides || carouselResult?.slides)?.map((slide: any, idx: number) => (
                                   <motion.div 
                                     key={idx}
                                     initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}
                                     className="w-72 shrink-0 bg-black/40 rounded-3xl border border-white/10 overflow-hidden group hover:border-orange-500/50 transition-all"
                                   >
                                      <div className="aspect-square bg-slate-900 flex items-center justify-center relative">
                                         <span className="absolute top-4 left-4 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-black text-white z-20 shadow-lg border-2 border-white/10">{idx + 1}</span>
                                         <AdsImage 
                                           src={`https://image.pollinations.ai/prompt/${encodeURIComponent((slide.visual_prompt || slide.image_desc) + " premium design, modern branding")}?width=800&height=800&nologo=true&seed=${idx + 100}`} 
                                           alt={slide.title} 
                                           className="group-hover:scale-110 transition-all duration-1000"
                                         />
                                         <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end p-6">
                                            <p className="text-[10px] font-black text-white italic leading-tight uppercase">"{slide.subtitle || slide.text_overlay}"</p>
                                         </div>
                                      </div>
                                      <div className="p-6 space-y-3">
                                         <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">{slide.strategy}</p>
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500 opacity-40" />
                                         </div>
                                         <p className="text-[12px] font-bold text-white line-clamp-1">{slide.title}</p>
                                         <p className="text-[9px] text-slate-500 leading-relaxed line-clamp-3 italic opacity-60 font-medium">Visual: {slide.visual_prompt || slide.image_desc}</p>
                                      </div>
                                   </motion.div>
                                 ))}
                              </div>
                           </ScrollArea>
                        </div>
                     </div>
                   )}

                   {/* SUBSTEP 4: VIDEO ADS STORYBOARD */}
                   {subStep === 4 && (
                     <div className="space-y-8">
                        <div className="p-8 bg-purple-500/10 rounded-[3rem] border border-purple-500/20">
                           <div className="flex items-center justify-between mb-8">
                              <div className="space-y-1">
                                 <h4 className="text-xl font-heading font-black text-white uppercase tracking-tight italic">Video Ad Architecture</h4>
                                 <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest leading-none">Optimized for TikTok / Reels / Shorts</p>
                              </div>
                              <Button size="sm" onClick={handleGenerateVideo} className="bg-purple-500 hover:bg-purple-600 text-white rounded-xl">Gen Video Storyboard</Button>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                              <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5 border-l-4 border-l-purple-500">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-2">3s Opening Hook</p>
                                 <p className="text-xs font-black text-white leading-relaxed italic">"{currentResult.opening_3s_hook}"</p>
                              </div>
                              <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-2">Video Tone & Vibe</p>
                                 <p className="text-xs font-bold text-white">{currentResult.communication_tone || videoResult?.music_vibe}</p>
                              </div>
                              <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-2">Pacing & Duration</p>
                                 <p className="text-xs font-bold text-white">{currentResult.emotional_pacing || 'Energetic / Fast'}</p>
                              </div>
                              <div className="p-6 bg-black/40 rounded-[2rem] border border-white/5">
                                 <p className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-2">Platform Structure</p>
                                 <p className="text-xs font-bold text-white">{currentResult.short_video_structure || 'TikTok Optimized'}</p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                              <div className="lg:col-span-12 xl:col-span-8">
                                 <div className="space-y-4">
                                    {(currentResult.storyboard_prompts || videoResult?.scenes)?.map((scene: any, sIdx: number) => (
                                      <div key={sIdx} className="flex gap-6 group p-6 bg-black/40 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all">
                                         <div className="shrink-0 w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-[10px] font-black text-purple-400 border border-purple-500/20">S{sIdx+1}</div>
                                         <div className="flex-1 space-y-2">
                                            <div className="flex justify-between items-center">
                                               <p className="text-[10px] font-black uppercase tracking-widest text-primary">{scene.scene || 'Visual Sequence'}</p>
                                               <span className="text-[9px] font-bold text-slate-500">{scene.duration || '3'}s</span>
                                            </div>
                                            <p className="text-[13px] font-bold text-white leading-relaxed italic">"{scene.text}"</p>
                                            <div className="pt-2 flex items-center gap-2">
                                               <Film className="w-3 h-3 text-purple-500/40" />
                                               <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Visual: {scene.visual || 'Dynamic cinematic movement'}</p>
                                            </div>
                                         </div>
                                      </div>
                                    ))}
                                 </div>
                              </div>
                              <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                                 <div className="p-6 bg-black rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-4">Narration Script</p>
                                    <p className="text-xs text-slate-300 leading-loose italic">{currentResult.narration_script || videoResult?.narration || 'Full script here...'}</p>
                                    <div className="mt-8 flex items-center gap-3">
                                       <MessageSquare className="w-4 h-4 text-purple-500/40" />
                                       <span className="text-[9px] font-black uppercase text-slate-500">Subtitles: {currentResult.subtitle_direction || 'Dynamic / Centered'}</span>
                                    </div>
                                 </div>
                                 <div className="aspect-[9/16] bg-slate-900 rounded-[3rem] border border-white/10 flex items-center justify-center overflow-hidden relative group">
                                    <AdsImage 
                                      src={`https://image.pollinations.ai/prompt/${encodeURIComponent(currentResult.opening_3s_hook + " cinematic studio lighting, social media influencer style")}?width=720&height=1280&nologo=true&seed=video_prev`}
                                      alt="Video Ad Concept"
                                      className="absolute inset-0 opacity-30 group-hover:scale-110 transition-all duration-1000"
                                    />
                                    <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/50 cursor-pointer animate-pulse z-10">
                                       <Play className="w-6 h-6 text-white fill-white ml-1" />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                   )}
                </motion.div>
              )}
           </div>

           {/* FOOTER: REVISI COLUMN / ASSISTANT */}
           <div className="p-8 bg-slate-900/80 border-t border-white/5 backdrop-blur-xl relative z-20">
              <div className="flex flex-col md:flex-row gap-6">
                 <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                       <RefreshCcw className="w-4 h-4 text-primary" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{config.aiAssistantName} Global Campaign Revision</h4>
                    </div>
                    <div className="relative flex items-center">
                       <Textarea 
                         value={chatInput}
                         onChange={e => setChatInput(e.target.value)}
                         onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleChat())}
                         placeholder="Tulis instruksi revisi... misal: 'Ganti hook Single Image jadi lebih viral', 'Buat script video yang lebih emosional', 'Optimasi headline Carousel'..."
                         className="min-h-[70px] bg-black/40 border-white/10 rounded-2xl pl-6 pr-24 py-4 text-white focus:ring-primary focus:border-primary resize-none placeholder:text-slate-700 text-sm"
                       />
                       <div className="absolute right-3 flex items-center gap-2">
                          <Button 
                            onClick={handleChat}
                            disabled={assistantLoading || !chatInput}
                            className="w-14 h-14 rounded-xl bg-primary hover:rotate-6 active:scale-95 transition-all p-0 shadow-xl shadow-primary/20"
                          >
                             {assistantLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                          </Button>
                       </div>
                    </div>
                 </div>
                 <div className="w-full md:w-64 space-y-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Conversion Presets</p>
                    <div className="flex flex-wrap gap-2">
                       {["Viral Hook", "FOMO Urgency", "Emotional Story", "Authority Boost", "Benefit-First"].map(p => (
                         <button 
                           key={p}
                           onClick={() => setChatInput(`Gunakan pendekatan ${p} untuk seluruh konten iklan ini.`)}
                           className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-primary/20 hover:border-primary/20 transition-all"
                         >
                            {p}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function FileTextIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
  );
}

function ShareIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V12"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
  );
}
