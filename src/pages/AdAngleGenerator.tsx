import React from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MousePointer2, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { generateAIContent, AGENT_PROMPTS } from "@/services/aiService";
import { toast } from "sonner";

export default function AdAngleGenerator() {
  const [loading, setLoading] = React.useState(false);
  const [products, setProducts] = React.useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [angles, setAngles] = React.useState<any[]>([]);

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
    try {
      const response = await generateAIContent(
        `Product: ${selectedProduct.name}. ${AGENT_PROMPTS.ANGLES}`,
        "You are a performance marketer and creative strategist. Generate 5 high-converting ad angles."
      );
      const data = JSON.parse(response.text);
      // Assuming AI returns { angles: [{ hook: "", headline: "", angleType: "" }] }
      const anglesList = data.angles || data;
      setAngles(anglesList);

      for (const angle of anglesList) {
        await addDoc(collection(db, "products", selectedProduct.id, "angles"), {
          ...angle,
          createdAt: serverTimestamp(),
        });
      }
      toast.success("5 Winning angles detected!");
    } catch (error: any) {
      toast.error("Failed to generate angles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header>
        <p className="text-white/40 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Phase 4</p>
        <h1 className="text-4xl font-bold tracking-tight">AI Winning Angle Detector</h1>
        <p className="text-white/60 mt-2">Discover the psychology-based hooks that will lower your CPA and skyrocket conversions.</p>
      </header>

      {!selectedProduct ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <div 
              key={p.id}
              onClick={() => setSelectedProduct(p)}
              className="cursor-pointer p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group"
            >
              <h3 className="font-bold text-lg group-hover:text-white">{p.name}</h3>
              <p className="text-xs text-white/40">Select to generate angles</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/5">
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-1">Target Product</p>
              <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
            </div>
            <Button variant="ghost" className="text-white/40 hover:text-white" onClick={() => {setSelectedProduct(null); setAngles([]);}}>
              Change Product
            </Button>
          </div>

          {!angles.length ? (
            <div className="flex justify-center p-20 border border-dashed border-white/10 rounded-3xl">
              <Button 
                onClick={handleGenerate}
                disabled={loading}
                className="h-14 px-8 bg-white text-black hover:bg-white/90 rounded-2xl font-bold shadow-xl shadow-white/5"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                Scan for Winning Angles
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {angles.map((angle, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-white/[0.03] border-white/5 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 bg-white/[0.02]">
                      <div className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-black uppercase tracking-widest text-white/60">
                        Angle Type: {angle.angleType || "Standard"}
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                        <TrendingUp className="w-3 h-3" />
                        Probable High CTR
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <Label className="text-[9px] font-bold text-white/20 uppercase tracking-widest block mb-1 underline decoration-white/10">The Hook</Label>
                        <p className="text-lg font-bold leading-tight">"{angle.hook}"</p>
                      </div>
                      <div>
                        <Label className="text-[9px] font-bold text-white/20 uppercase tracking-widest block mb-1 underline decoration-white/10">The Headline</Label>
                        <p className="text-sm font-medium text-white/70 italic">{angle.headline}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
