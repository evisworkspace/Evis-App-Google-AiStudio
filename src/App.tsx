import React, { useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import DashboardView from "./components/modules/DashboardView";
import ObrasView from "./components/modules/ObrasView";
import OportunidadesView from "./components/modules/OportunidadesView";
import FinanceiroView from "./components/modules/FinanceiroView";
import ComprasView from "./components/modules/ComprasView";
import TarefasView from "./components/modules/TarefasView";
import WorkspaceView from "./components/modules/WorkspaceView";
import AdminView from "./components/modules/AdminView";
import MapaAgentesView from "./components/modules/MapaAgentesView";
import WhatsAppDrawer from "./components/modules/WhatsAppDrawer";
import EvisChat from "./components/assistente/EvisChat";
import ToastContainer from "./components/layout/ToastContainer";
import { motion, AnimatePresence } from "motion/react";
import AuthScreen from "./components/layout/AuthScreen";
import OnboardingScreen from "./components/layout/OnboardingScreen";

function AppContent() {
  const { currentRoute, navigate, currentUser, authLoading, isWhatsAppOpen, setIsWhatsAppOpen, needsOnboarding, setCompanyId, setNeedsOnboarding } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Execute when Alt is pressed and keys match, avoiding typing interference
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === "d") {
          e.preventDefault();
          navigate("dashboard");
        } else if (key === "p") {
          e.preventDefault();
          navigate("obras");
        } else if (key === "t") {
          e.preventDefault();
          navigate("tarefas");
        } else if (key === "o") {
          e.preventDefault();
          navigate("oportunidades");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  const renderActiveView = () => {
    if (currentRoute === "dashboard") {
      return <DashboardView />;
    }
    if (currentRoute === "obras" || currentRoute === "obra-detail") {
      return <ObrasView />;
    }
    if (currentRoute === "mapa-agentes") {
      return <MapaAgentesView />;
    }
    if (currentRoute === "oportunidades") {
      return <OportunidadesView />;
    }
    if (currentRoute === "tarefas") {
      return <TarefasView />;
    }
    if (currentRoute === "workspace") {
      return <WorkspaceView />;
    }
    if (currentRoute === "compras" || currentRoute === "estoque") {
      return <ComprasView />;
    }
    if (currentRoute.startsWith("financeiro-")) {
      return <FinanceiroView />;
    }
    if (
      currentRoute.startsWith("cadastros-") ||
      currentRoute.startsWith("configuracoes-") ||
      currentRoute === "planos"
    ) {
      return <AdminView />;
    }
    return <DashboardView />;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <span className="animate-spin h-8 w-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full"></span>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  if (needsOnboarding && currentUser) {
    return (
      <OnboardingScreen
        user={currentUser}
        onComplete={(id) => { setCompanyId(id); setNeedsOnboarding(false); }}
      />
    );
  }

  return (
    <div id="evis_root_shell" className="h-screen bg-app-surface flex text-foreground overflow-hidden antialiased font-sans transition-colors duration-200">
      {/* Coluna Esquerda: Sidebar */}
      <Sidebar />

      {/* Area de Conteudo Direita */}
      <div
        className="flex-1 flex flex-col h-screen overflow-y-auto overflow-x-hidden transition-all duration-300 relative"
      >
        {/* Top Header sticky */}
        <Header />

        {/* Dynamic content view with motion transitions */}
        <main className="flex-1 p-4 md:p-6 pb-24 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRoute}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="w-full h-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Smart AI Assistente Floating Widget */}
        <EvisChat />

        {/* Omnichannel CRM WhatsApp Drawer Overlay */}
        <WhatsAppDrawer isOpen={isWhatsAppOpen} onClose={() => setIsWhatsAppOpen(false)} />

        {/* Floating System-wide Toasts Feedback Wrapper */}
        <ToastContainer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
