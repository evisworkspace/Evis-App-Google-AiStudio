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
  DollarSign
} from "lucide-react";

export default function Sidebar() {
  const { currentRoute, setCurrentRoute, sidebarOpen, setSidebarOpen } = useApp();
  const [financeiroExpanded, setFinanceiroExpanded] = useState(true);

  if (!sidebarOpen) return null;

  const navigate = (route: MenuRoute) => {
    setCurrentRoute(route);
  };

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
      className="w-64 h-full shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col justify-between overflow-y-auto select-none font-sans"
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
            className="md:hidden text-sidebar-muted hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* NAV GROUPS (py-4, px-3) */}
        <nav className="py-4 px-3 space-y-4">
          {/* Dashboard item (No label group) */}
          <div className="space-y-1">
            <button
              onClick={() => navigate("dashboard")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${
                currentRoute === "dashboard"
                  ? "bg-sidebar-accent/75 text-white border-l-4 border-sidebar-primary shadow-lg shadow-sidebar-primary/5"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/30"
              }`}
            >
              <LayoutDashboard className={`h-4 w-4 ${currentRoute === "dashboard" ? "text-sidebar-primary animate-pulse" : "text-sidebar-muted"}`} />
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
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${
                currentRoute === "oportunidades"
                  ? "bg-sidebar-accent/75 text-white border-l-4 border-sidebar-primary shadow-lg shadow-sidebar-primary/5"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/30"
              }`}
            >
              <Briefcase className="h-4 w-4 text-sidebar-muted" />
              Oportunidades (CRM)
            </button>
            <button
              onClick={() => navigate("obras")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${
                currentRoute === "obras"
                  ? "bg-sidebar-accent/75 text-white border-l-4 border-sidebar-primary shadow-lg shadow-sidebar-primary/5"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/30"
              }`}
            >
              <HardHat className="h-4 w-4 text-sidebar-muted" />
              Projetos (Obras)
            </button>
            <button
              onClick={() => navigate("tarefas")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${
                currentRoute === "tarefas"
                  ? "bg-sidebar-accent/75 text-white border-l-4 border-sidebar-primary shadow-lg shadow-sidebar-primary/5"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/30"
              }`}
            >
              <CheckCircle2 className="h-4 w-4 text-sidebar-muted" />
              Tarefas de Engenharia
            </button>
            <button
              onClick={() => navigate("workspace")}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${
                currentRoute === "workspace"
                  ? "bg-sidebar-accent/75 text-white border-l-4 border-sidebar-primary shadow-lg shadow-sidebar-primary/5"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/30"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Cloud className="h-4 w-4 text-sidebar-primary" />
                <span>Google Workspace</span>
              </div>
              <span className="h-2 w-2 rounded-full bg-sidebar-primary animate-pluse border border-[hsl(var(--color-background))]"></span>
            </button>
          </div>

          {/* Group: Operations */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-mono font-bold text-sidebar-muted uppercase tracking-wider block mb-1">
              Operações
            </span>
            <button
              onClick={() => navigate("compras")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${
                currentRoute === "compras"
                  ? "bg-sidebar-accent/75 text-white border-l-4 border-sidebar-primary shadow-lg shadow-sidebar-primary/5"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/30"
              }`}
            >
              <ShoppingCart className="h-4 w-4 text-sidebar-muted" />
              Compras & Insumos
            </button>
            <button
              onClick={() => navigate("estoque")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer transform hover:translate-x-1 ${
                currentRoute === "estoque"
                  ? "bg-sidebar-accent/75 text-white border-l-4 border-sidebar-primary shadow-lg shadow-sidebar-primary/5"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/30"
              }`}
            >
              <Boxes className="h-4 w-4 text-sidebar-muted" />
              Estoque Físico
            </button>
          </div>

          {/* Group: Financeiro (9 items, collapsible) */}
          <div className="space-y-1">
            <button
              onClick={() => setFinanceiroExpanded(!financeiroExpanded)}
              className="w-full px-3 py-1.5 flex items-center justify-between text-[10px] font-mono font-bold text-sidebar-muted uppercase tracking-wider hover:text-white transition-all text-left cursor-pointer group"
            >
              <span>Financeiro Obra</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 transform ${financeiroExpanded ? "rotate-180 text-white" : "rotate-0"}`} />
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
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium rounded transition-all duration-150 cursor-pointer hover:translate-x-0.5 ${
                        isActive
                          ? "bg-sidebar-accent text-white font-semibold"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/30"
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? "text-sidebar-primary animate-bounce-in" : "opacity-75"}`} />
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
                  className={`w-full flex items-center gap-2 px-3 py-1 text-[11px] font-medium rounded transition-all pl-6 cursor-pointer ${
                    currentRoute === cad.route
                      ? "text-white font-semibold"
                      : "text-sidebar-foreground/80 hover:text-white"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary"></span>
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
                  className={`w-full flex items-center gap-2 px-3 py-1 text-[11px] font-medium rounded transition-all pl-6 cursor-pointer ${
                    currentRoute === conf.route
                      ? "text-white font-semibold"
                      : "text-sidebar-foreground/80 hover:text-white"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-sidebar-muted"></span>
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
            EB
          </div>
          <div className="truncate">
            <span className="text-[10px] text-sidebar-foreground font-semibold block leading-none">
              Engenheiro Berti
            </span>
            <span className="text-[9px] text-sidebar-muted truncate block font-mono">
              berti@curitibaconstrutora...
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
