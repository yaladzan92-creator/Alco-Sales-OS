import React from "react";
import { Search, Brain, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateAIContent, AGENT_PROMPTS } from "@/services/aiService";
import { toast } from "sonner";
import StepWrapper from "./StepWrapper";
import SmartInput from "./SmartInput";
import { cn } from "@/lib/utils";

export default function NicheStep({ project, onSave, onSaveProject }: any) {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    country: "Indonesia",
    age: "18-45",
    interest: "",
    skill: "",
    goal: "",
    budget: "Low",
    traffic: "Organic",
    extraContext: ""
  });
  const [options, setOptions] = React.useState<any[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (project?.nicheData?.input) {
      setFormData(project.nicheData.input);
    }
    if (project?.nicheData?.options) {
      setOptions(project.nicheData.options);
      setSelectedId(project.nicheData.selectedOption?.id || null);
    }
  }, [project]);

  const handleGenerate = async (revision?: string) => {
    if (!formData.interest) {
      toast.error("Please enter a niche interest");
      return;
    }
    setLoading(true);
    try {
      const context = `
        User Inputs: ${JSON.stringify(formData)}.
        ${revision ? `REVISION REQUEST: ${revision}` : ""}
        ${project ? `FULL PROJECT MEMORY: ${JSON.stringify(project)}` : ""}
      `;

      const response = await generateAIContent(
        context,
        AGENT_PROMPTS.STEP_1_NICHE + " Use Indonesian language for descriptions. Respond ONLY with the requested JSON format."
      );
      
      const cleanText = response.text.replace(/```json\n?|```/g, "").trim();
      const data = JSON.parse(cleanText);
      
      setOptions(data.options || []);
      if (data.options?.length > 0) {
        setSelectedId(data.options[0].id);
      }
      
      onSave({ input: formData, options: data.options }, false);
      toast.success("Niche intelligence gathered!");
    } catch (error: any) {
      console.error(error);
      toast.error("Generation failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFixAndContinue = () => {
    if (!selectedId) {
      toast.error("Please select a niche option first");
      return;
    }
    const selected = options.find(o => o.id === selectedId);
    onSave({ input: formData, options, selectedOption: selected }, true);
  };

  return (
    <StepWrapper
      loading={loading}
      onGenerate={handleGenerate}
      onFixAndContinue={handleFixAndContinue}
      hasResult={options.length > 0}
      activeStep={1}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Target Country</Label>
              <Input 
                value={formData.country} 
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="bg-secondary/50 border-border rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Age Range</Label>
              <Input 
                value={formData.age} 
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="bg-secondary/50 border-border rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Your Skills / Assets</Label>
              <Input 
                placeholder="e.g. Design, Coding, Writing..."
                value={formData.skill} 
                onChange={(e) => setFormData({...formData, skill: e.target.value})}
                className="bg-secondary/50 border-border rounded-xl h-12"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Niche Interest</Label>
              <Input 
                placeholder="e.g. Sustainable Living, Fitness..."
                value={formData.interest} 
                onChange={(e) => setFormData({...formData, interest: e.target.value})}
                className="bg-secondary/50 border-border rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Income Goal (Monthly)</Label>
              <Input 
                placeholder="e.g. 10 Million IDR"
                value={formData.goal} 
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                className="bg-secondary/50 border-border rounded-xl h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Traffic Strategy</Label>
              <select 
                value={formData.traffic}
                onChange={(e) => setFormData({...formData, traffic: e.target.value})}
                className="w-full h-12 px-3 bg-secondary/50 border border-border rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Organic">Organic</option>
                <option value="Ads">Paid Ads</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>

        <SmartInput 
            label="Konteks Tambahan Niche"
            placeholder="Ada spesialisasi khusus? Atau preferensi model bisnis tertentu (SaaS, Agency, E-commerce)?"
            value={formData.extraContext}
            onChange={(val) => setFormData({...formData, extraContext: val})}
            context={project}
        />
      </div>

      {options.length > 0 && (
        <div className="space-y-6 pt-8">
          <div className="flex items-center gap-3">
             <Brain className="w-5 h-5 text-primary" />
             <h3 className="text-xl font-heading font-black tracking-tight">AI Generated Recommendations</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {options.map((option) => (
              <Card 
                key={option.id}
                onClick={() => setSelectedId(option.id)}
                className={cn(
                  "cursor-pointer transition-all duration-300 rounded-[2rem] border-2 shadow-lg overflow-hidden group",
                  selectedId === option.id ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border bg-card hover:border-primary/30"
                )}
              >
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="space-y-1">
                            <h4 className="text-2xl font-heading font-black tracking-tight text-foreground uppercase">{option.name}</h4>
                            <div className="h-1 w-12 bg-primary/20 rounded-full" />
                         </div>
                         {selectedId === option.id && <CheckCircle2 className="w-6 h-6 text-primary" />}
                      </div>
                      <p className="text-muted-foreground font-medium italic leading-relaxed">
                        "{option.summary}"
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap md:flex-col gap-3 min-w-[140px] justify-center">
                      {[
                        { label: "Demand", val: option.demand_score },
                        { label: "Competition", val: option.competition_score },
                        { label: "Potential", val: option.viral_potential },
                      ].map(stat => (
                        <div key={stat.label} className="bg-secondary/50 px-4 py-2 rounded-xl border border-border flex flex-col items-center">
                          <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{stat.label}</span>
                          <span className="text-lg font-heading font-black text-foreground">{stat.val}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </StepWrapper>
  );
}
