import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2, RotateCcw, Lightbulb } from "lucide-react";
import { generateAIContent, AGENT_PROMPTS } from "@/services/aiService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SmartInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  context?: any;
  placeholder?: string;
}

export default function SmartInput({ label, value, onChange, context, placeholder }: SmartInputProps) {
  const [loading, setLoading] = React.useState(false);
  const [optimized, setOptimized] = React.useState<{ text: string, suggestions: string[] } | null>(null);

  const handleOptimize = async () => {
    if (!value) {
      toast.error("Please enter some text to optimize");
      return;
    }
    setLoading(true);
    try {
      const inputContext = `
        Context: ${JSON.stringify(context || {})}.
        User Input: ${value}
      `;
      const response = await generateAIContent(inputContext, AGENT_PROMPTS.OPTIMIZE_INPUT + " Respond in Indonesian.");
      const cleanText = response.text.replace(/```json\n?|```/g, "").trim();
      const data = JSON.parse(cleanText);
      setOptimized({ text: data.optimized_text, suggestions: data.suggestions });
      toast.success("Input optimized by AI!");
    } catch (error) {
      console.error(error);
      toast.error("Optimization failed");
    } finally {
      setLoading(false);
    }
  };

  const applyOptimization = () => {
    if (optimized) {
      onChange(optimized.text);
      setOptimized(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</label>
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={loading || !value}
          onClick={handleOptimize}
          className="h-8 text-primary hover:bg-primary/5 gap-2 px-3 rounded-lg border border-primary/10"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          <span className="text-[9px] font-black uppercase tracking-widest">Optimize with AI</span>
        </Button>
      </div>
      
      <div className="relative group">
        <Textarea 
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-secondary/30 border-border rounded-xl min-h-[120px] focus:ring-primary focus:border-primary transition-all pr-12"
        />
        {value && !loading && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="w-4 h-4 text-primary/40 animate-pulse" />
          </div>
        )}
      </div>

      {optimized && (
        <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Optimized Version
            </p>
            <p className="text-sm font-medium text-foreground italic leading-relaxed">
              "{optimized.text}"
            </p>
          </div>
          
          <div className="space-y-3">
             <p className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Lightbulb className="w-3 h-3" />
              AI Suggestions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {optimized.suggestions.map((s, i) => (
                <div key={i} className="p-3 bg-white rounded-xl border border-primary/10 text-[10px] font-bold text-muted-foreground">
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
             <Button 
              onClick={applyOptimization}
              className="flex-1 bg-primary text-white h-10 rounded-xl font-bold uppercase tracking-widest text-[9px] gap-2"
             >
               <CheckCircle2 className="w-3.5 h-3.5" />
               Apply Optimized Version
             </Button>
             <Button 
              variant="outline"
              onClick={() => setOptimized(null)}
              className="h-10 rounded-xl font-bold uppercase tracking-widest text-[9px]"
             >
               Discard
             </Button>
          </div>
        </div>
      )}
    </div>
  );
}
