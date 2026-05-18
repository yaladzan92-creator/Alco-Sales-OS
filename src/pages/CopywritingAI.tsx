import React from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Type, Loader2, Copy as CopyIcon, Check, FileText } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { generateAIContent, AGENT_PROMPTS } from "@/services/aiService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const copyTypes = [
  { id: "landing_page", label: "Landing Page", icon: FileText },
  { id: "email", label: "Email Sequence", icon: Type },
  { id: "ads", label: "Ad Copy", icon: MousePointer2 },
  { id: "whatsapp", label: "WhatsApp Follow-up", icon: Phone },
];

import { MousePointer2, Phone } from "lucide-react";

export default function CopywritingAI() {
  const [loading, setLoading] = React.useState(false);
  const [products, setProducts] = React.useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [selectedType, setSelectedType] = React.useState("landing_page");
  const [generatedCopy, setGeneratedCopy] = React.useState<string>("");
  const [copied, setCopied] = React.useState(false);

  const fetchProducts = async () => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "products"), where("userId", "==", auth.currentUser.uid));
    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const handleGenerate = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    setGeneratedCopy("");
    try {
      const response = await generateAIContent(
        `Product: ${selectedProduct.name}. Type: ${selectedType}. ${AGENT_PROMPTS.COPY}`,
        "You are an A-list copywriter. Write persuasive, high-converting copy in English. Use direct response marketing principles."
      );
      // Assuming AI returns text or JSON
      let content = response.text;
      try {
        const data = JSON.parse(response.text);
        content = data.content || data.copy || response.text;
      } catch {
        content = response.text;
      }
      
      setGeneratedCopy(content);

      await addDoc(collection(db, "products", selectedProduct.id, "copies"), {
        type: selectedType,
        content: content,
        createdAt: serverTimestamp(),
      });
      toast.success("Copywriting generated!");
    } catch (error: any) {
      toast.error("Failed to generate copy.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.info("Copied to clipboard");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header>
        <p className="text-white/40 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Phase 5</p>
        <h1 className="text-4xl font-bold tracking-tight">AI Copywriter</h1>
        <p className="text-white/60 mt-2">Generate high-converting headlines, emails, and landing page body copy in seconds.</p>
      </header>

      {!selectedProduct ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <div 
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className="cursor-pointer p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group"
            >
              <h3 className="font-bold text-lg tracking-tight">{p.name}</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Select for Copywriting</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/5">
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Drafting for</p>
              <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
            </div>
            <Button variant="ghost" className="text-white/40 hover:text-white" onClick={() => {setSelectedProduct(null); setGeneratedCopy("");}}>
              Change
            </Button>
          </div>

          <Tabs defaultValue="landing_page" onValueChange={setSelectedType} className="w-full">
            <TabsList className="bg-white/5 border border-white/5 p-1 h-auto grid grid-cols-2 md:grid-cols-4 rounded-2xl">
              {copyTypes.map((type) => (
                <TabsTrigger 
                  key={type.id} 
                  value={type.id}
                  className="rounded-xl py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-black transition-all"
                >
                  <type.icon className="w-4 h-4 mr-2 hidden md:inline" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">{type.label.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-8">
              {!generatedCopy ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-3xl space-y-6">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                    <Type className="w-8 h-8 text-white/20" />
                  </div>
                  <Button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="h-14 px-8 bg-white text-black hover:bg-white/90 rounded-2xl font-bold"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                    Compose {selectedType.replace('_', ' ')}
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-white/[0.03] border-white/10 relative">
                    <div className="absolute top-4 right-4 z-10">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="bg-white/10 hover:bg-white/20 border-white/10 rounded-xl"
                        onClick={copyToClipboard}
                      >
                        {copied ? <Check className="w-4 h-4 mr-2 text-emerald-400" /> : <CopyIcon className="w-4 h-4 mr-2" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <CardHeader className="border-b border-white/5">
                      <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-white/40">Generated Draft</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-white/80 font-mono bg-black/20 p-6 rounded-2xl border border-white/5">
                        {generatedCopy}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
}
