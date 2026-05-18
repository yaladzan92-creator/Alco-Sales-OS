import React from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Search, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { generateAIContent, AGENT_PROMPTS } from "../services/aiService";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

interface NicheResult {
  niche_name: string;
  demand_score: number;
  competition_score: number;
  pain_points: string[];
  audience_analysis: string;
  product_ideas: string[];
}

export default function NicheResearch() {
  const [loading, setLoading] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [result, setResult] = React.useState<NicheResult | null>(null);

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const response = await generateAIContent(
        `Niche: ${input}. ${AGENT_PROMPTS.RESEARCH}`,
        "You are an expert market researcher. Analyze the niche provided and return a JSON response with niche_name, demand_score (0-100), competition_score (0-100), pain_points (array of strings), audience_analysis (detailed string), and product_ideas (array of strings)."
      );

      const data = JSON.parse(response.text);
      setResult(data);

      // Save to Firebase
      await addDoc(collection(db, "niches"), {
        ...data,
        userId: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
      });

      toast.success("Niche research completed and saved!");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to generate research. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <header>
        <p className="text-white/40 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Phase 1</p>
        <h1 className="text-4xl font-bold tracking-tight">AI Niche Research</h1>
        <p className="text-white/60 mt-2">Identify high-demand, low-competition opportunities for your digital products.</p>
      </header>

      <Card className="bg-white/[0.03] border-white/5 backdrop-blur-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleResearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="niche" className="text-xs font-semibold text-white/40 uppercase tracking-widest pl-1">
                Describe your niche idea
              </Label>
              <div className="flex gap-2">
                <Input 
                  id="niche"
                  placeholder="e.g. Yoga for busy remote developers" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="bg-black/20 border-white/10 h-12 rounded-xl focus:border-white/20 transition-all"
                />
                <Button 
                  disabled={loading || !input.trim()}
                  className="h-12 px-6 bg-white text-black hover:bg-white/90 rounded-xl"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  <span className="ml-2 font-semibold">Analyze</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white/[0.03] border-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/40 uppercase tracking-widest">Niche Demand</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <div className="text-4xl font-bold">{result.demand_score}%</div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase mb-1.5">High Potential</div>
                </div>
                <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${result.demand_score}%` }}
                    className="h-full bg-emerald-400"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.03] border-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/40 uppercase tracking-widest">Competition</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <div className="text-4xl font-bold">{result.competition_score}%</div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase mb-1.5">Moderate</div>
                </div>
                <div className="mt-4 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${result.competition_score}%` }}
                    className="h-full bg-amber-400"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/[0.03] border-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Audience Deep Dive
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Pain Points</Label>
                <div className="flex flex-wrap gap-2">
                  {result.pain_points.map((point, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-lg text-xs text-white/80">
                      <AlertCircle className="w-3 h-3 text-white/40" />
                      {point}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Persona Analysis</Label>
                <p className="text-sm leading-relaxed text-white/70 bg-white/[0.02] p-4 rounded-xl border border-white/5 italic">
                  {result.audience_analysis}
                </p>
              </div>

              <div>
                <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2 block">Product Opportunities</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.product_ideas.map((idea, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl group hover:border-white/10 transition-all cursor-pointer">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-medium text-white/80">{idea}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
