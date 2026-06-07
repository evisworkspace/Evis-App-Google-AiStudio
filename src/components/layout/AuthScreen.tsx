import React, { useState } from "react";
import { motion } from "motion/react";
import { googleSignIn } from "../../lib/auth";
import { HardHat, LogIn, Sparkles } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function AuthScreen() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useApp();

  const handleLogin = async () => {
    try {
      setLoading(true);
      await googleSignIn();
    } catch (error: any) {
      console.error(error);
      showToast("Falha ao fazer login com o Google. Tente novamente.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-surface text-foreground flex items-center justify-center p-4 font-sans antialiased">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-secondary border border-border rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center relative"
      >
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
        
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-500/5">
          <HardHat className="h-8 w-8" />
        </div>

        <h1 className="text-3xl font-display font-bold tracking-tight text-center mb-2">
          EVIS <span className="text-emerald-500">OS</span>
        </h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          Acesso seguro ao CRM & ERP Inteligente da Curitiba Construtora.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md transition-colors rounded-xl py-3 px-4 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
              Conectando...
            </span>
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              Entrar com Google
            </>
          )}
        </button>

        <div className="mt-8 pt-6 border-t border-border w-full flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>Protegido pelo sistema inteligente LIA</span>
        </div>
      </motion.div>
    </div>
  );
}
