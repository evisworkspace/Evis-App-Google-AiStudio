import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { MenuRoute } from "../../types";
import {
  LayoutDashboard,
  Coins,
  HardHat,
  CheckCircle2,
  ShoppingCart,
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  Briefcase,
  FileSpreadsheet,
  Settings,
  FolderLock,
  ChevronDown,
  ChevronRight,
  Cloud,
  FileClock,
  SendHorizontal,
  FolderHeart,
  TrendingUp,
  LineChart,
  Users,
  CircleCheck,
  Zap,
  Building,
  DollarSign,
  Bot,
  X
} from "lucide-react";

export default function Sidebar() {
  const { currentRoute, setCurrentRoute, sidebarOpen, setSidebarOpen, getActiveProject, currentUser } = useApp();
  const [financeiroExpanded, setFinanceiroExpanded] = useState(true);

  if (!sidebarOpen) return null;

  const navigate = (route: MenuRoute) => {
    setCurrentRoute(route);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const currentObra = getActiveProject();
  const userName = currentUser?.displayName || currentUser?.email || "Usuário EVIS";
  const userEmail = currentUser?.email || "email não informado";
  const initials = userName
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "UE";

  const financeiroItems = [
    { label: "Resumo", route: "financeiro-resumo" as MenuRoute, icon: CircleCheck },
    { label: "Receitas", route: "financeiro-receitas" as MenuRoute, icon: ArrowUpRight },
    { label: "Despesas", route: "financeiro-despesas" as MenuRoute, icon: ArrowDownLeft },
    { label: "Conciliação Central", route: "financeiro-central" as MenuRoute, icon: DollarSign },
    { label: "Lançamentos", route: "financeiro-lancamentos" as MenuRoute, icon: FileClock },
    { label: "Transferências", route: "financeiro-transferencias" as MenuRoute, icon: SendHorizontal },
    { label: "Fluxo de Caixa", route: "financeiro-fluxo-de-caixa" as MenuRoute, icon: TrendingUp },
    { label: "DRE de Obra", route: "financeiro-dre" as MenuRoute, icon: FileSpreadsheet },
    { label: "Categorias", route: "financeiro-categorias" as MenuRoute, icon: FolderHeart },
  ];

  const adminCadastros = [
    { label: "Clientes", route: "cadastros-clientes" as MenuRoute },
    { label: "Fornecedores", route: "cadastros-fornecedores" as MenuRoute },
    { label: "Insumos SINAPI", route: "cadastros-insumos" as MenuRoute },
  ];

  const adminConfiguracoes = [
    { label: "Empresa", route: "configuracoes-empresa" as MenuRoute },
    { label: "Contas Bancárias", route: "configuracoes-contas" as MenuRoute },
    { label: "Equipe de Engenharia", route: "configuracoes-equipe" as MenuRoute },
  ];

  return (
    <aside
      id="evis_sidebar"
      className="absolute inset-y-0 left-0 z-50 w-full md:relative md:w-[280px] h-full shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col justify-between overflow-y-auto select-none font-sans transition-colors duration-200 print:hidden"
    >
      {/* Upper Area */}
      <div>
        {/* LOGO BLOCK (px-5, h-14) */}
        <div className="px-5 h-14 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-sidebar-primary flex items-center justify-center shadow-lg shadow-sidebar-primary/10">
              <span className="text-white font-mono font-bold text-sm tracking-tighter">E</span>
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-wider flex items-center gap-1">
                EVIS <span className="text-sidebar-primary font-mono text-[9px] font-bold py-0.5 px-1 bg-neutral-800 rounded border border-neutral-700">ERP</span>
              </span>
              <p className="text-[8px] text-sidebar-muted tracking-widest uppercase font-mono">
                Curitiba Construtora
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-sidebar-muted hover:text-white transition-colors cursor-pointer p-2 rounded-lg hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* NAV GROUPS (py-4, px-3) */}
        <nav className="py-4 px-3 space-y-4">
          {/* Dashboard item (No label group) */}
          <div className="space-y-1">
            <button
              onClick={() => navigate("dashboard")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${currentRoute === "dashboard"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
            >
              <LayoutDashboard className={`h-4 w-4 ${currentRoute === "dashboard" ? "text-primary animate-pulse" : "text-sidebar-muted"}`} />
              Painel de Controle
            </button>
          </div>

          {/* Group: Projects */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono font-bold text-sidebar-muted uppercase tracking-wider block mb-1">
              Projetos & CRM
            </span>
            <button
              onClick={() => navigate("oportunidades")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${currentRoute === "oportunidades"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
            >
              <Briefcase className={`h-4 w-4 ${currentRoute === "oportunidades" ? "text-primary" : "text-sidebar-muted"}`} />
              Oportunidades (CRM)
            </button>
            <button
              onClick={() => navigate("obras")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${currentRoute === "obras"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
            >
              <LayoutDashboard className={`h-4 w-4 ${currentRoute === "obras" ? "text-primary" : "text-sidebar-muted"}`} />
              Projetos (Visão Global)
            </button>
            <button
              onClick={() => navigate("obra-detail")}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${currentRoute === "obra-detail"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-[3px] border-primary shadow-sm"
                  : "text-sidebar-foreground border-l-[3px] border-transparent hover:bg-sidebar-accent/50"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <HardHat className={`h-4 w-4 ${currentRoute === "obra-detail" ? "text-primary" : "text-sidebar-muted"}`} />
                <span className="truncate max-w-[150px]">{currentObra?.name || "Detalhe da Obra"}</span>
              </div>
            </button>
            <button
              onClick={() => navigate("tarefas")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${currentRoute === "tarefas"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
            >
              <CheckCircle2 className={`h-4 w-4 ${currentRoute === "tarefas" ? "text-primary" : "text-sidebar-muted"}`} />
              Tarefas de Engenharia
            </button>
            <button
              onClick={() => navigate("workspace")}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${currentRoute === "workspace"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <Cloud className={`h-4 w-4 ${currentRoute === "workspace" ? "text-primary" : "text-sidebar-primary"}`} />
                <span>Google Workspace</span>
              </div>
              <span className="h-2 w-2 rounded-full bg-sidebar-primary animate-pulse border border-[hsl(var(--color-background))]"></span>
            </button>
            <button
              onClick={() => navigate("mapa-agentes")}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${currentRoute === "mapa-agentes"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <Bot className={`h-4 w-4 ${currentRoute === "mapa-agentes" ? "text-purple-600" : "text-purple-500"}`} />
                <span>Central de Agentes IA</span>
              </div>
            </button>
          </div>

          {/* Group: Financeiro (9 items, collapsible) */}
          <div className="space-y-1">
            <button
              onClick={() => setFinanceiroExpanded(!financeiroExpanded)}
              className="w-full px-3 py-1.5 flex items-center justify-between text-[10px] font-mono font-bold text-sidebar-muted uppercase tracking-wider hover:text-sidebar-foreground transition-all text-left cursor-pointer group"
            >
              <span>Financeiro Obra</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 transform ${financeiroExpanded ? "rotate-180 text-sidebar-foreground" : "rotate-0"}`} />
            </button>

            {financeiroExpanded && (
              <div className="pl-1.5 space-y-1 mt-1 border-l border-sidebar-border ml-3 animate-slide-in-up">
                {financeiroItems.map((fi) => {
                  const Icon = fi.icon;
                  const isActive = currentRoute === fi.route;
                  return (
                    <button
                      key={fi.route}
                      onClick={() => navigate(fi.route)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium rounded transition-all duration-150 cursor-pointer hover:translate-x-0.5 ${isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary animate-bounce-in" : "text-sidebar-muted"}`} />
                      {fi.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Group: Admin & Cadastros */}
          <div className="space-y-2">
            <span className="px-3 text-[10px] font-mono font-bold text-sidebar-muted uppercase tracking-wider block">
              Configurações & Cadastros
            </span>

            {/* Registers subgroup */}
            <div className="space-y-1">
              <span className="px-3 text-[9px] font-sans text-sidebar-muted block font-medium">Cadastros</span>
              {adminCadastros.map((cad) => (
                <button
                  key={cad.route}
                  onClick={() => navigate(cad.route)}
                  className={`w-full flex items-center gap-2 px-3 py-1 text-[11px] font-medium rounded transition-all pl-6 cursor-pointer ${currentRoute === cad.route
                      ? "text-sidebar-accent-foreground font-semibold bg-sidebar-accent"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${currentRoute === cad.route ? "bg-primary" : "bg-sidebar-muted"}`}></span>
                  {cad.label}
                </button>
              ))}
            </div>

            {/* Config subgroup */}
            <div className="space-y-1">
              <span className="px-3 text-[9px] font-sans text-sidebar-muted block font-medium">Configuração Geral</span>
              {adminConfiguracoes.map((conf) => (
                <button
                  key={conf.route}
                  onClick={() => navigate(conf.route)}
                  className={`w-full flex items-center gap-2 px-3 py-1 text-[11px] font-medium rounded transition-all pl-6 cursor-pointer ${currentRoute === conf.route
                      ? "text-sidebar-accent-foreground font-semibold bg-sidebar-accent"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${currentRoute === conf.route ? "bg-primary" : "bg-sidebar-muted"}`}></span>
                  {conf.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Footer (plano gratuito / Plan Upgrade Banner) */}
      <div className="p-3 border-t border-sidebar-border bg-black/10">
        <div className="p-3 bg-sidebar/40 rounded-lg border border-sidebar-border">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 bg-sidebar-primary text-white font-mono text-[8px] font-bold rounded">
                PLANO GRATUITO
              </span>
            </div>
            <Zap className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="text-[10px] text-sidebar-foreground opacity-75 font-sans leading-relaxed">
            Sua construtora possui 3 obras ativas cadastradas.
          </p>
          <button
            onClick={() => navigate("planos")}
            className="w-full mt-2.5 py-1.5 px-2.5 bg-sidebar-primary text-white font-sans font-bold text-[10px] rounded hover:bg-sidebar-primary/90 transition-colors cursor-pointer text-center"
          >
            Fazer Upgrade Pro
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2.5 px-2">
          <div className="h-7 w-7 rounded-full bg-sidebar-accent flex items-center justify-center text-white font-mono font-semibold text-xs shrink-0 uppercase">
            {initials}
          </div>
          <div className="truncate">
            <span className="text-[10px] text-sidebar-foreground font-semibold block leading-none">
              {userName}
            </span>
            <span className="text-[9px] text-sidebar-muted truncate block font-mono">
              {userEmail}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
