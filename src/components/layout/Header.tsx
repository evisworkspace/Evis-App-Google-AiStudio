import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { MenuRoute } from "../../types";
import { initAuth, googleSignIn, logout as googleLogout } from "../../lib/auth";
import { User as FirebaseUser } from "firebase/auth";
import {
  Menu,
  Bell,
  ChevronDown,
  Building2,
  CheckCircle2,
  Calendar,
  Layers,
  CircleAlert,
  Info,
  LogOut,
  User,
  CreditCard,
  Sliders,
  ExternalLink,
  Sun,
  Moon,
  Sparkles,
  MessageCircle,
  Maximize,
  Minimize
} from "lucide-react";

export default function Header() {
  const {
    sidebarOpen,
    setSidebarOpen,
    currentRoute,
    setCurrentRoute,
    obras,
    selectedProjectId,
    setSelectedProjectId,
    getActiveProject,
    theme,
    setTheme,
    isWhatsAppOpen,
    setIsWhatsAppOpen,
    currentUser
  } = useApp();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await googleSignIn();
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await googleLogout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const activeProj = getActiveProject();

  const getBreadcrumbs = () => {
    const parts = ["Curitiba Construtora"];
    
    if (currentRoute.startsWith("financeiro-")) {
      parts.push("Financeiro");
      const sub = currentRoute.replace("financeiro-", "");
      parts.push(sub.charAt(0).toUpperCase() + sub.slice(1).replace("-", " "));
    } else if (currentRoute.startsWith("cadastros-")) {
      parts.push("Cadastros");
      parts.push(currentRoute.replace("cadastros-", "").toUpperCase());
    } else if (currentRoute.startsWith("configuracoes-")) {
      parts.push("Configurações");
      parts.push(currentRoute.replace("configuracoes-", "").replace("-", " "));
    } else {
      parts.push(currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1));
    }
    
    return parts;
  };

  const notifications = [
    { id: 1, text: "Nova medição cadastrada para Residencial Belle Vue (R$ 520.000)", time: "Há 10 min", type: "info" },
    { id: 2, text: "Oolarila Curitibana enviou cotação de blocos cerâmicos", time: "Há 2 horas", type: "success" },
    { id: 3, text: "RDO de ontem do Residencial Kairo enviado pela Enga. Amanda", time: "Há 5 horas", type: "warning" },
  ];

  return (
    <header
      id="evis_header"
      className="h-14 font-sans bg-white border-b border-border sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between print:hidden"
    >
      {/* Overlay to close dropdowns when clicking outside */}
      {(profileOpen || notificationOpen) && (
        <div 
          className="fixed inset-0 z-40 transition-opacity" 
          onClick={() => {
            setProfileOpen(false);
            setNotificationOpen(false);
          }}
        />
      )}

      {/* Left section */}
      <div className="flex items-center gap-3 relative z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg border border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-secondary))] cursor-pointer text-zinc-700 hover:text-zinc-950 transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Breadcrumb & Title */}
        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
            {getBreadcrumbs().map((b, i, arr) => (
              <React.Fragment key={i}>
                <span className={i === arr.length - 1 ? "text-zinc-500 font-semibold uppercase" : ""}>
                  {b}
                </span>
                {i < arr.length - 1 && <span>/</span>}
              </React.Fragment>
            ))}
          </div>
          <h1 className="text-xs font-bold font-mono tracking-tight text-zinc-900 leading-none mt-1">
            {getBreadcrumbs()[getBreadcrumbs().length - 1]}
          </h1>
        </div>
      </div>

      {/* Right / Quick Controls */}
      <div className="flex items-center gap-3 relative z-50">
        {/* Active Project Switcher Dropdown */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[hsl(var(--color-secondary))] border border-[hsl(var(--color-border))] rounded-lg">
          <Building2 className="h-3.5 w-3.5 text-zinc-500" />
          <span className="hidden md:inline text-[10px] font-mono text-zinc-400">Obra Principal:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-transparent border-none text-[11px] font-sans font-semibold text-zinc-800 cursor-pointer focus:ring-0 focus:outline-hidden"
          >
            {obras.map((o) => (
              <option key={o.id} value={o.id} className="text-zinc-800 bg-white">
                {o.name}
              </option>
            ))}
          </select>
        </div>

        {/* Focus Mode Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            !sidebarOpen 
              ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
              : 'bg-[hsl(var(--color-secondary))] text-zinc-500 border-[hsl(var(--color-border))] hover:bg-zinc-100 hover:text-zinc-700'
          }`}
          title="Modo Foco"
        >
          {sidebarOpen ? <Maximize className="h-3.5 w-3.5" /> : <Minimize className="h-3.5 w-3.5" />}
          <span className="text-[10px] font-bold uppercase tracking-wider">{!sidebarOpen ? 'Sair Foco' : 'Modo Foco'}</span>
        </button>

        {/* Theme Segment Control (Desktop Header) */}
        <div className="hidden md:flex items-center gap-1 p-0.5 bg-[hsl(var(--color-secondary))]/60 border border-[hsl(var(--color-border))] rounded-lg">
          <button
            onClick={() => setTheme("claro")}
            title="Tema Claro"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium font-sans cursor-pointer transition-all ${
              theme === "claro"
                ? "bg-white text-blue-600 shadow-sm font-semibold"
                : "text-zinc-550 hover:text-zinc-900"
            }`}
          >
            <Sun className="h-3 w-3" />
            <span>Claro</span>
          </button>
          
          <button
            onClick={() => setTheme("escuro")}
            title="Tema Escuro"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium font-sans cursor-pointer transition-all ${
              theme === "escuro"
                ? "bg-[hsl(var(--color-card))] text-indigo-400 shadow-sm font-semibold border border-[hsl(var(--color-border))]"
                : "text-zinc-550 hover:text-zinc-900"
            }`}
          >
            <Moon className="h-3 w-3" />
            <span>Escuro</span>
          </button>

          <button
            onClick={() => setTheme("hibrido")}
            title="Tema Híbrido"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium font-sans cursor-pointer transition-all ${
              theme === "hibrido"
                ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-500 shadow-sm font-semibold border border-blue-500/20 backdrop-blur-md"
                : "text-zinc-550 hover:text-zinc-900"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Híbrido</span>
          </button>
        </div>

        {/* Current Date Widget */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-[hsl(var(--color-secondary))]/50 border border-[hsl(var(--color-border))] rounded-lg text-[10px] font-mono text-zinc-500">
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          <span>Sábado, 06 de Junho de 2026 UTC</span>
        </div>

        {/* WhatsApp CRM Trigger */}
        <button
          onClick={() => setIsWhatsAppOpen(!isWhatsAppOpen)}
          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all relative cursor-pointer flex items-center gap-2 ${isWhatsAppOpen ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 hover:shadow-sm'}`}
          title="WhatsApp CRM"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">WhatsApp</span>
          <span className={`absolute -top-1 -right-1 flex h-3 w-3 rounded-full ${isWhatsAppOpen ? 'bg-white border-2 border-emerald-600' : 'bg-emerald-500 border border-white animate-pulse'}`}></span>
        </button>

        {/* Bell badge Notification widget */}
        <div className="relative notification-dropdown">
          <button
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setProfileOpen(false);
            }}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition-all relative cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-[hsl(var(--color-destructive))]"></span>
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-lg border border-[hsl(var(--color-border))] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-1.5 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800">Notificações</span>
                <span className="text-[9px] font-mono font-medium text-blue-500 hover:underline cursor-pointer">Lidas</span>
              </div>
              <div className="divide-y divide-zinc-50">
                {notifications.map((not) => (
                  <div key={not.id} className="p-3 hover:bg-zinc-50 transition-colors flex gap-2 w-full text-left">
                    <div className="h-5 w-5 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Info className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-sans text-zinc-700 leading-normal">
                        {not.text}
                      </p>
                      <span className="text-[9px] font-mono text-zinc-400 mt-0.5 block">{not.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Dropdown or Login */}
        <div className="relative user-dropdown">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationOpen(false);
              }}
              className="flex items-center gap-1.5 p-1 hover:bg-zinc-100 rounded-lg transition-all cursor-pointer"
            >
              <div className="h-7 w-7 rounded-sm bg-[hsl(var(--color-primary))] text-white font-sans font-bold text-xs flex items-center justify-center border border-primary/20 shrink-0">
                {currentUser?.displayName ? currentUser.displayName.substring(0, 2).toUpperCase() : "EB"}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-2xl py-0.5 z-50 animate-in fade-in slide-in-from-top-3 duration-200 font-sans overflow-hidden">
                {/* Premium Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 text-white font-sans font-bold text-sm flex items-center justify-center shadow-lg border border-white/20 whitespace-nowrap shrink-0 overflow-hidden">
                      {currentUser?.photoURL ? <img src={currentUser.photoURL} alt="User" referrerPolicy="no-referrer" /> : "EB"}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5 leading-none">
                        {currentUser?.displayName || "Engenheiro Berti"}
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-400 text-zinc-950 font-mono text-[8px] font-black tracking-wider uppercase scale-90">
                          PRO
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-350 font-mono mt-1 opacity-80 truncate">
                        {currentUser?.email || "berti@curitibaconstrutora.com.br"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status and Active Limits Quota Block */}
                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 font-sans">
                  <div className="flex items-center justify-between text-[10px] text-slate-505">
                    <span className="font-medium text-slate-500">Armazenamento Workspace</span>
                    <span className="font-mono font-semibold text-emerald-600">Conectado</span>
                  </div>
                  <div className="mt-1.5 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono mt-1 leading-normal">
                    Drive, Calendar, Sheets & Gmail ativos.
                  </p>
                </div>

            {/* Profile Actions List */}
              <div className="p-1 space-y-0.5">
                <div className="px-3 py-1 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Minha Conta
                </div>
                <button
                  onClick={() => {
                    setCurrentRoute("configuracoes-empresa");
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 transition-all text-left cursor-pointer group"
                >
                  <User className="h-4 w-4 text-slate-450 group-hover:text-slate-700 transition-colors" />
                  <div>
                    <span className="font-semibold block text-slate-700 group-hover:text-slate-950">Perfil & Empresa</span>
                    <span className="text-[9px] text-slate-400 font-mono block">Dados da Curitiba Construtora</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setCurrentRoute("planos");
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 transition-all text-left cursor-pointer group"
                >
                  <CreditCard className="h-4 w-4 text-amber-500 group-hover:scale-105 transition-transform" />
                  <div>
                    <span className="font-semibold block text-slate-700 group-hover:text-slate-950">Faturamento & Planos</span>
                    <span className="text-[9px] text-slate-450 font-sans block text-amber-600 font-medium">Plano Anual Ativo</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setCurrentRoute("configuracoes-contas");
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 transition-all text-left cursor-pointer group"
                >
                  <Sliders className="h-4 w-4 text-slate-450 group-hover:text-slate-700 transition-colors" />
                  <div>
                    <span className="font-semibold block text-slate-700 group-hover:text-slate-950">Configurações Gerais</span>
                    <span className="text-[9px] text-slate-400 font-mono block">Segurança, chaves e integrações</span>
                  </div>
                </button>
              </div>

              {/* Theme Preference Selector */}
              <div className="p-2.5 border-t border-slate-100/85 bg-slate-50/40">
                <div className="px-2 pb-1.5 text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Tema do Painel
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setTheme("claro")}
                    className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                      theme === "claro"
                        ? "bg-white border-blue-500 shadow-sm text-blue-600"
                        : "bg-white/60 border-slate-200/60 text-slate-500 hover:bg-white hover:text-slate-800"
                    }`}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-semibold">Claro</span>
                  </button>
                  <button
                    onClick={() => setTheme("escuro")}
                    className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                      theme === "escuro"
                        ? "bg-slate-900 border-indigo-500 shadow-sm text-indigo-400"
                        : "bg-white/60 border-slate-200/60 text-slate-500 hover:bg-white hover:text-slate-800"
                    }`}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-semibold">Escuro</span>
                  </button>
                  <button
                    onClick={() => setTheme("hibrido")}
                    className={`flex flex-col items-center gap-1 py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                      theme === "hibrido"
                        ? "bg-gradient-to-b from-blue-50/50 to-indigo-50/50 border-blue-400 text-blue-600 shadow-sm"
                        : "bg-white/60 border-slate-200/60 text-slate-500 hover:bg-white hover:text-slate-800"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-bold">Híbrido</span>
                  </button>
                </div>
              </div>

              {/* Developer / Platform link & Logout */}
              <div className="p-1 border-t border-slate-100 bg-slate-50/40">
                <a
                  href="https://ai.studio/build"
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 transition-all"
                >
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="font-semibold block text-slate-700">Google AI Studio Build</span>
                    <span className="text-[9px] text-slate-400 font-mono block">Editar este applet</span>
                  </div>
                </a>
                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition-all text-left cursor-pointer font-bold mt-1">
                  <LogOut className="h-4 w-4" />
                  <span>Sair do ERP</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
