import React from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Gift, Loader2, Sparkles, CheckCircle2, Zap } from "lucide-react";
import { db, auth } from "../lib/firebase";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { generateAIContent, AGENT_PROMPTS } from "../services/aiService";
import { toast } from "sonner";

export default function OfferGenerator() {
  const [loading, setLoading] = React.useState(false);
  const [products, setProducts] = React.useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null);
  const [offer, setOffer] = React.useState<any>(null);

  const fetchProducts = async () => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "products"), where("userId", "==", auth.currentUser.uid));
    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const handleGenerateOffer = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    try {
      const response = await generateAIContent(
        `Product: ${selectedProduct.name}. Type: ${selectedProduct.type}. Price: ${selectedProduct.price}. ${AGENT_PROMPTS.OFFER}`,
        "You are a sales psychologist and offer architect. Create an irresistible offer stack."
      );
      const data = JSON.parse(response.text);
      setOffer(data);

      await addDoc(collection(db, "products", selectedProduct.id, "offers"), {
        ...data,
        createdAt: serverTimestamp(),
      });
      toast.success("Irresistible offer generated!");
    } catch (error: any) {
      toast.error("Failed to generate offer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header>
        <p className="text-white/40 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Phase 3</p>
        <h1 className="text-4xl font-bold tracking-tight">AI Offer Architect</h1>
        <p className="text-white/60 mt-2">Transform your product into an IRRESISTIBLE offer that people feel stupid saying no to.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((p) => (
          <div 
            key={p.id}
            onClick={() => setSelectedProduct(p)}
            className={`cursor-pointer p-4 rounded-2xl border transition-all ${
              selectedProduct?.id === p.id 
                ? "bg-white/10 border-white/20 shadow-xl shadow-white/5" 
                : "bg-white/[0.03] border-white/5 hover:border-white/10"
            }`}
          >
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{p.type}</p>
            <h3 className="font-bold text-lg">{p.name}</h3>
          </div>
        ))}
      </div>

      {selectedProduct && !offer && (
        <div className="flex justify-center pt-10">
          <Button 
            onClick={handleGenerateOffer}
            disabled={loading}
            className="h-16 px-10 bg-white text-black hover:bg-white/90 rounded-2xl font-bold text-lg shadow-2xl shadow-white/10"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Sparkles className="w-6 h-6 mr-3 fill-black" />}
            Generate Offer Stack
          </Button>
        </div>
      )}

      {offer && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="bg-white/[0.03] border-white/5 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-400 to-cyan-400" />
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center italic">"The Irresistible Stack"</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-10">
              <div className="text-center">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Core Headline</p>
                <h2 className="text-3xl font-black leading-tight uppercase tracking-tight">{offer.headline}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Standard Bonuses</Label>
                  <div className="space-y-3">
                    {offer.bonuses.map((bonus: string, i: number) => (
                      <div key={i} className="flex gap-3 text-sm text-white/70">
                        <Gift className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>{bonus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">The Guarantee</Label>
                    <div className="mt-2 p-4 bg-white/5 rounded-xl border border-white/5 text-sm italic text-white/80">
                      {offer.guarantee}
                    </div>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Scarcity / Urgency</Label>
                    <div className="flex items-center gap-2 mt-2 text-amber-400 font-bold uppercase text-xs tracking-widest">
                      <Zap className="w-4 h-4 fill-amber-400" />
                      {offer.scarcity}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between items-center px-4">
            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">Offer Verified by Sales AI Agent v1.2</p>
            <Button variant="ghost" className="text-white/40 hover:text-white" onClick={() => setOffer(null)}>
              Regenerate
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
