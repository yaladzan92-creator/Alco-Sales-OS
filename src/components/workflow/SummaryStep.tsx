import React from "react";
import { 
  ClipboardList, 
  Download, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  Sparkles, 
  Loader2,
  FileJson,
  Layout
} from "lucide-react";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateAIContent, AGENT_PROMPTS } from "@/services/aiService";
import { toast } from "sonner";
import { useBranding } from "@/contexts/BrandingContext";

interface SummaryStepProps {
  project: any;
  onSave: (data: any, next?: boolean) => void;
  onNext: () => void;
}

export default function SummaryStep({ project, onSave, onNext }: SummaryStepProps) {
  const { config } = useBranding();
  const [loading, setLoading] = React.useState(false);
  const [summary, setSummary] = React.useState<any>(project?.summaryData || null);

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const context = `
        STRATEGY DATA:
        Niche: ${JSON.stringify(project.nicheData || {})}
        Audience: ${JSON.stringify(project.audienceData || {})}
        Pain Points: ${JSON.stringify(project.painPointData || {})}
        Validation: ${JSON.stringify(project.validationData || {})}
        Positioning: ${JSON.stringify(project.positioningData || {})}
        Offer: ${JSON.stringify(project.offerData || {})}
        Angles: ${JSON.stringify(project.marketingAngles || {})}
        Copy Direction: ${JSON.stringify(project.copyDirection || {})}
      `;

      const response = await generateAIContent(context, AGENT_PROMPTS.PROJECT_SUMMARY);
      const cleanText = response.text.replace(/```json\n?|```/g, "").trim();
      const data = JSON.parse(cleanText);
      setSummary(data);
      onSave(data, false);
      toast.success("Strategy Summary Compiled!");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to generate summary: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!summary && !loading) {
      handleGenerateSummary();
    }
  }, []);

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  const exportAsJSON = () => {
    downloadFile(JSON.stringify(project, null, 2), `${project.name || "strategy"}_complete.json`, "application/json");
  };

  const exportAsText = () => {
    if (!summary) return;
    let text = `==================================================\n`;
    text += `PROJECT STRATEGY SUMMARY: ${project.name?.toUpperCase()}\n`;
    text += `==================================================\n\n`;

    const sections = [
      { t: "NICHE RESEARCH", d: summary.niche_summary },
      { t: "TARGET AUDIENCE", d: summary.target_audience },
      { t: "MARKET ANALYSIS", d: summary.analysis },
      { t: "BUSINESS MODEL", d: summary.business_model },
      { t: "MARKETING STRATEGY", d: summary.marketing_strategy },
    ];

    sections.forEach(s => {
      text += `[ ${s.t} ]\n`;
      Object.entries(s.d).forEach(([key, val]: any) => {
        text += `- ${key.replace(/_/g, ' ').toUpperCase()}: ${Array.isArray(val) ? val.join(', ') : val}\n`;
      });
      text += `\n`;
    });

    downloadFile(text, `${project.name || "strategy"}_summary.txt`, "text/plain");
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground italic">Compiling Strategy Memory...</p>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <ClipboardList className="w-6 h-6 text-cyan-500" />
           </div>
           <div>
              <h2 className="text-2xl font-heading font-black tracking-tight text-foreground uppercase italic underline decoration-cyan-500 decoration-4 underline-offset-8">Project Strategy Summary</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Foundational Intelligence for {project.name}</p>
           </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={exportAsJSON} className="rounded-xl h-10 gap-2 border-border hover:border-cyan-500/50">
              <FileJson className="w-4 h-4 text-cyan-500" /> JSON
           </Button>
           <Button variant="outline" size="sm" onClick={exportAsText} className="rounded-xl h-10 gap-2 border-border hover:border-cyan-500/50">
              <FileText className="w-4 h-4 text-blue-500" /> DOCX/TXT
           </Button>
           <Button onClick={() => toast.info("PDF Generation feature coming soon!")} className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl h-10 gap-2">
              <Download className="w-4 h-4" /> Download All
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-[2.5rem] border-border shadow-xl hover:shadow-2xl transition-all border-l-8 border-l-blue-500">
          <CardContent className="p-8 space-y-6">
             <div className="flex items-center gap-2 text-blue-500">
                <Layout className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-widest">Niche & Audience</h3>
             </div>
             <div className="space-y-4">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Main Niche</p>
                   <p className="text-sm font-bold">{summary.niche_summary.main_niche}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Target Persona</p>
                   <p className="text-sm font-bold text-blue-600">{summary.target_audience.persona}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Top Desires</p>
                      <p className="text-[11px] leading-relaxed italic">"{summary.target_audience.desires}"</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Core Fears</p>
                      <p className="text-[11px] leading-relaxed italic">"{summary.target_audience.fears}"</p>
                   </div>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-border shadow-xl hover:shadow-2xl transition-all border-l-8 border-l-amber-500">
          <CardContent className="p-8 space-y-6">
             <div className="flex items-center gap-2 text-amber-500">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-widest">Market Logic</h3>
             </div>
             <div className="space-y-4">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Prime Pain Points</p>
                   <p className="text-sm font-bold">{summary.analysis.pain_points}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Positioning Statement</p>
                   <p className="text-xs font-medium leading-loose bg-secondary/50 p-3 rounded-xl border border-border italic">"{summary.business_model.positioning}"</p>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">USP / Unique Mechanism</p>
                   <p className="text-xs font-black text-amber-600">{summary.business_model.usp || summary.analysis.unique_mechanism}</p>
                </div>
             </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-border shadow-xl hover:shadow-2xl transition-all border-l-8 border-l-pink-500 md:col-span-2">
          <CardContent className="p-8">
             <div className="flex items-center gap-2 text-pink-500 mb-8">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-sm font-black uppercase tracking-widest">Winning Marketing Strategy</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                   <div className="p-4 bg-secondary/30 rounded-2xl border border-border">
                      <p className="text-[9px] font-black uppercase tracking-widest text-pink-500 mb-1">Hooks & Angles</p>
                      <p className="text-xs font-bold leading-relaxed">{summary.marketing_strategy.winning_angles}</p>
                   </div>
                   <div className="p-4 bg-secondary/30 rounded-2xl border border-border">
                      <p className="text-[9px] font-black uppercase tracking-widest text-pink-500 mb-1">Emotional Triggers</p>
                      <p className="text-xs font-bold leading-relaxed">{summary.marketing_strategy.triggers}</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="p-4 bg-slate-900 text-white rounded-2xl">
                      <p className="text-[9px] font-black uppercase tracking-widest text-pink-400 mb-1">Offer Structure</p>
                      <p className="text-xs font-bold">{summary.business_model.offer_structure}</p>
                      <p className="text-[10px] font-black text-pink-500 mt-2">{summary.business_model.pricing_strategy}</p>
                   </div>
                   <div className="p-4 bg-secondary/30 rounded-2xl border border-border">
                      <p className="text-[9px] font-black uppercase tracking-widest text-pink-500 mb-1">Communication Tone</p>
                      <p className="text-xs font-bold">{summary.marketing_strategy.tone}</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="p-4 bg-secondary/30 rounded-2xl border border-border">
                      <p className="text-[9px] font-black uppercase tracking-widest text-pink-500 mb-1">Content Strategy</p>
                      <p className="text-xs font-bold leading-relaxed">{summary.marketing_strategy.content_strategy}</p>
                   </div>
                   <div className="p-4 border-2 border-dashed border-pink-500/30 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-foreground mb-2">Proceed to Activation</p>
                      <Button onClick={onNext} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl h-10 shadow-lg shadow-pink-500/20">
                         Ads Preparation <ChevronRight className="w-4 h-4" />
                      </Button>
                   </div>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center pt-8">
        <Button 
          variant="outline" 
          onClick={handleGenerateSummary}
          className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-8 gap-2 border-border"
        >
          <RefreshCcw className="w-4 h-4" /> Regenerate Strategy Summary
        </Button>
      </div>
    </div>
  );
}

function RefreshCcw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}
