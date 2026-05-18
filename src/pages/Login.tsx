import { signInWithGoogle } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { motion } from "motion/react";
import { Zap } from "lucide-react";

export default function Login() {
  return (
    <div className="h-screen w-full bg-[#050505] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white flex items-center justify-center rounded-2xl shadow-2xl shadow-white/20">
            <Zap className="text-black w-8 h-8 fill-black" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">AI Sales OS</h1>
        <p className="text-white/60 mb-8 text-sm">The ultimate AI business assistant for digital product entrepreneurs.</p>
        
        <Button 
          onClick={signInWithGoogle}
          className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-xl font-medium"
        >
          Get Started with Google
        </Button>
        
        <div className="mt-8 pt-8 border-t border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/30">
          Powered by Gemini 3.1
        </div>
      </motion.div>
    </div>
  );
}
