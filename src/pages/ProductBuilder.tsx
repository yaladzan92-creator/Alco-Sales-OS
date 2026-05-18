import React from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Package, Loader2, Plus, ArrowRight } from "lucide-react";
import { db, auth } from "../lib/firebase";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

export default function ProductBuilder() {
  const [loading, setLoading] = React.useState(false);
  const [products, setProducts] = React.useState<any[]>([]);
  const [form, setForm] = React.useState({
    name: "",
    type: "Digital Course",
    price: "",
    usp: ""
  });

  const fetchProducts = async () => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "products"), where("userId", "==", auth.currentUser.uid));
    const snapshot = await getDocs(q);
    setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        ...form,
        price: Number(form.price),
        userId: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
      });
      toast.success("Product created!");
      setForm({ name: "", type: "Digital Course", price: "", usp: "" });
      fetchProducts();
    } catch (error: any) {
      toast.error("Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header>
        <p className="text-white/40 text-xs font-semibold uppercase tracking-[0.2em] mb-2">Phase 2</p>
        <h1 className="text-4xl font-bold tracking-tight">Product Builder</h1>
        <p className="text-white/60 mt-2">Define your digital asset and unique selling proposition.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 bg-white/[0.03] border-white/5 h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Name</Label>
                <Input 
                  id="name"
                  placeholder="The 7-Day Niche Hacker"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-black/20 border-white/10 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Type</Label>
                <Input 
                  id="type"
                  placeholder="Masterclass / E-book"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="bg-black/20 border-white/10 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Price ($)</Label>
                <Input 
                  id="price"
                  type="number"
                  placeholder="47"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="bg-black/20 border-white/10 rounded-xl"
                />
              </div>
              <Button disabled={loading} className="w-full bg-white text-black hover:bg-white/90 rounded-xl font-bold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Product
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Your Products</p>
          <div className="grid grid-cols-1 gap-4">
            {products.length === 0 ? (
              <div className="h-40 border border-dashed border-white/10 rounded-3xl flex items-center justify-center text-white/20 text-sm">
                No products yet. Create your first one.
              </div>
            ) : (
              products.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-white/[0.03] border-white/5 hover:border-white/10 transition-all group cursor-pointer">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                          <Package className="text-white/40 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                          <p className="text-[10px] text-white/40 uppercase tracking-widest">{p.type} • ${p.price}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                        <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
