import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2, Lightbulb, Wand2, MessageSquareQuote } from "lucide-react";
import { generateAIContent, AGENT_PROMPTS, safeParseJSON } from "@/services/aiService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SmartInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  context?: any;
  placeholder?: string;
  compact?: boolean;
}

type AssistMode = "example" | "suggest" | "improve";

interface AssistResult {
  text: string;
  suggestions: string[];
  examples: string[];
}

export default function SmartInput({ label, value, onChange, context, placeholder, compact = false }: SmartInputProps) {
  const [loading, setLoading] = React.useState(false);
  const [assistResult, setAssistResult] = React.useState<AssistResult | null>(null);

  const handleAssist = async (mode: AssistMode) => {
    setLoading(true);
    try {
      const inputContext = `
        Context: ${JSON.stringify(context || {})}.
        Target Field Label: ${label}
        Current User Input (can be empty): ${value || ""}
      `;

      let response;

      if (mode === "improve") {
        const promptText = `
          Lakukan optimasi dan selaraskan teks input pengguna berikut untuk kolom "${label}" agar lebih jelas, lebih spesifik, lebih meyakinkan, dan tetap mudah dipahami digital marketer pemula.
          Pengguna menginput: "${value || ""}"
          Kembalikan harus dalam JSON valid berbentuk persis seperti:
          { "optimized_text": "[Teks hasil optimasi di sini]", "suggestions": ["[Saran 1]", "[Saran 2]", "[Saran 3]"] }
          Pastikan merespon HANYA dengan JSON valid.
        `;
        response = await generateAIContent(inputContext, `${AGENT_PROMPTS.OPTIMIZE_INPUT}\n\n${promptText}`);
      } else {
        const promptText = `
          Bantu pengguna memahami cara mengisi kolom "${label}" berdasarkan konteks proyek.
          ${mode === "example" ? "Fokus utama: berikan contoh jawaban yang siap dipakai." : "Fokus utama: berikan saran isi yang paling relevan untuk kolom ini."}
          Kembalikan harus dalam JSON valid berbentuk persis seperti:
          {
            "optimized_text": "[Satu jawaban terbaik yang bisa langsung dipakai user]",
            "suggestions": ["[Saran 1]", "[Saran 2]", "[Saran 3]"],
            "example_answers": ["[Contoh 1]", "[Contoh 2]", "[Contoh 3]"]
          }
          Pastikan merespon HANYA dengan JSON valid.
        `;
        response = await generateAIContent(inputContext, `${AGENT_PROMPTS.GET_INPUT_SUGGESTIONS}\n\n${promptText}`);
      }

      const data = safeParseJSON(response.text, {});
      setAssistResult({
        text: data.optimized_text || data.text || "",
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
        examples: Array.isArray(data.example_answers) ? data.example_answers : [],
      });

      toast.success(
        mode === "example"
          ? "Contoh isian berhasil dibuat."
          : mode === "suggest"
            ? "Saran isian berhasil dibuat."
            : "Jawaban berhasil diperjelas."
      );
    } catch (error) {
      console.error(error);
      toast.error("Gagal memproses bantuan AI untuk kolom ini.");
    } finally {
      setLoading(false);
    }
  };

  const applyAssistResult = () => {
    if (assistResult?.text) {
      onChange(assistResult.text);
      setAssistResult(null);
    }
  };

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      <div className={cn("flex items-center justify-between gap-3", compact && "items-start")}>
        <label className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</label>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => handleAssist("example")}
            className="h-8 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary gap-1.5 px-3 rounded-lg border border-primary/20 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin text-primary" /> : <MessageSquareQuote className="w-3.5 h-3.5 text-primary" />}
            <span className="text-[10px] font-black uppercase tracking-widest">Kasih Contoh</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => handleAssist("suggest")}
            className="h-8 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary gap-1.5 px-3 rounded-lg border border-primary/25 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin text-primary" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
            <span className="text-[10px] font-black uppercase tracking-widest">AI Bantu Isi</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || !value}
            onClick={() => handleAssist("improve")}
            className="h-8 bg-white text-foreground hover:bg-secondary gap-1.5 px-3 rounded-lg border border-border cursor-pointer"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-black uppercase tracking-widest">Perjelas Jawaban</span>
          </Button>
        </div>
      </div>

      <div className="relative group">
        <Textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "bg-secondary/30 border-border rounded-xl focus:ring-primary focus:border-primary transition-all pr-12",
            compact ? "min-h-[92px]" : "min-h-[120px]"
          )}
        />
        {value && !loading && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles className="w-4 h-4 text-primary/40 animate-pulse" />
          </div>
        )}
      </div>

      {assistResult && (
        <div className={cn("p-6 bg-primary/5 rounded-[2rem] border border-primary/20 space-y-6 animate-in slide-in-from-top-4 duration-500", compact && "p-4 rounded-2xl space-y-4")}>
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              Jawaban Rekomendasi
            </p>
            <p className="text-sm font-medium text-foreground italic leading-relaxed">
              "{assistResult.text}"
            </p>
          </div>

          {assistResult.examples.length > 0 && (
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <MessageSquareQuote className="w-3 h-3" />
                Contoh Jawaban
              </p>
              <div className="grid grid-cols-1 gap-2">
                {assistResult.examples.map((example, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onChange(example)}
                    className="text-left p-3 bg-white rounded-xl border border-primary/10 text-[11px] font-medium text-muted-foreground hover:border-primary/30 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <Lightbulb className="w-3 h-3" />
              Saran AI
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {assistResult.suggestions.map((s, i) => (
                <div key={i} className="p-3 bg-white rounded-xl border border-primary/10 text-[10px] font-bold text-muted-foreground">
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={applyAssistResult}
              className="flex-1 bg-primary text-white h-10 rounded-xl font-bold uppercase tracking-widest text-[9px] gap-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Pakai Jawaban Ini
            </Button>
            <Button
              variant="outline"
              onClick={() => setAssistResult(null)}
              className="h-10 rounded-xl font-bold uppercase tracking-widest text-[9px]"
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
