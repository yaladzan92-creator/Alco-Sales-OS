import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, CheckCircle2, MessageSquare, RotateCcw } from "lucide-react";

interface StepWrapperProps {
  children: React.ReactNode;
  loading: boolean;
  onGenerate: (revision?: string) => void;
  onFixAndContinue: () => void;
  onSaveProject?: () => void;
  hasResult: boolean;
  activeStep: number;
  isFinal?: boolean;
}

export default function StepWrapper({ 
  children, 
  loading, 
  onGenerate, 
  onFixAndContinue,
  onSaveProject,
  hasResult,
  activeStep,
  isFinal
}: StepWrapperProps) {
  const [revision, setRevision] = React.useState("");

  return (
    <div className="space-y-8">
      {/* Input Area */}
      <div className="space-y-6">
        {children}
      </div>

      {/* Action Area */}
      <div className="flex flex-col gap-4 pt-6 border-t border-border">
        <div className="flex items-center justify-between mb-2">
           <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">AI Discussion & Optimization</span>
           </div>
           {onSaveProject && (
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={onSaveProject}
                className="h-8 text-[9px] font-black uppercase tracking-widest border border-border rounded-lg"
             >
                Save Project
             </Button>
           )}
        </div>

        {!hasResult ? (
          <Button 
            disabled={loading} 
            onClick={() => onGenerate()}
            className="w-full h-16 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 group"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Sparkles className="w-6 h-6 mr-2" />}
            Analyze Step {activeStep}
          </Button>
        ) : (
          <>
            <div className="p-6 bg-secondary/30 rounded-3xl border border-border space-y-4">
              <Textarea 
                placeholder="Ask AI to adjust the result... (e.g. 'Make it more professional', 'Focus more on Gen Z')"
                value={revision}
                onChange={(e) => setRevision(e.target.value)}
                className="bg-background border-border rounded-xl min-h-[80px]"
              />
              <div className="flex flex-wrap gap-4">
                <Button 
                  disabled={loading} 
                  variant="outline"
                  onClick={() => onGenerate(revision)}
                  className="flex-1 min-w-[140px] h-12 rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  Generate Again
                </Button>
                <Button 
                  disabled={loading} 
                  onClick={onFixAndContinue}
                  className="flex-1 min-w-[140px] h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isFinal ? "Finish & Save" : "Fix & Continue"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
