import React from "react";
import { useApp } from "../../context/AppContext";
import { CheckCircle2, AlertOctagon, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] p-4 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          // Determine styles and icon
          let bgClass = "bg-blue-500/10 border-blue-500/20 text-blue-500";
          let Icon = Info;
          let iconClass = "";

          if (toast.type === "success") {
            bgClass = "bg-emerald-500/10 border-emerald-500/20 text-emerald-500";
            Icon = CheckCircle2;
            iconClass = "animate-spin-slow"; // slowly rotates as requested!
          } else if (toast.type === "error") {
            bgClass = "bg-rose-500/10 border-rose-500/20 text-rose-500";
            Icon = AlertOctagon;
            iconClass = "animate-bounce";
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.82, x: 50 }}
              className="pointer-events-auto"
            >
              <div
                className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-lg animate-bounce-in ${bgClass}`}
                role="alert"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1 rounded-lg ${toast.type === "success" ? "bg-emerald-500/15" : toast.type === "error" ? "bg-rose-500/15" : "bg-blue-500/15"}`}>
                    <Icon className={`h-4.5 w-4.5 shrink-0 ${iconClass}`} />
                  </div>
                  <span className="text-xs font-semibold leading-relaxed font-sans text-foreground">
                    {toast.message}
                  </span>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-foreground cursor-pointer transition-colors shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
