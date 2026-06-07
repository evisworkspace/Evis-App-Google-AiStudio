import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../../context/AppContext";
import {
  Sparkles,
  Layers,
  HardHat,
  Calendar,
  CloudSun,
  Users,
  FolderDot,
  FileCheck2,
  DollarSign,
  TrendingUp,
  Activity,
  PlusSquare,
  BadgeAlert,
  ShieldAlert,
  Send,
  Eye,
  ArrowRight,
  ChevronLeft,
  Search,
  Filter,
  HelpCircle,
  Coins,
  FileText,
  Trash2,
  Plus,
  Upload,
  CheckCircle,
  Settings,
  AlertTriangle,
  LayoutGrid,
  List
} from "lucide-react";

type ActiveSubTab =
  | "geral"
  | "orcamento"
  | "fisicofinanceiro"
  | "cronograma"
  | "curvas"
  | "rdo"
  | "medicoes"
  | "financeiro"
  | "equipe"
  | "documentos";

export default function ObrasView() {
  const { obras, getActiveProject, setSelectedProjectId, addRdo, addMedicao, lancamentos, activeSubTab, setActiveSubTab, showToast } = useApp();
  const [isListView, setIsListView] = useState(true);
  const [viewMode, setViewMode] = useState<"lista" | "quadro">("lista");
  const [searchTerm, setSearchTerm] = useState("");
  const obra = getActiveProject();
  
  // States for RDO form
  const [rdoWeather, setRdoWeather] = useState("Ensolarado");
  const [rdoWorkers, setRdoWorkers] = useState("45");
  const [rdoProgress, setRdoProgress] = useState("");
  const [rdoObservations, setRdoObservations] = useState("");
  const [rdoTranscription, setRdoTranscription] = useState("");
  const [isGeneratingRdo, setIsGeneratingRdo] = useState(false);

  // States for Medicao form
  const [medicaoAmount, setMedicaoAmount] = useState("");
  const [medicaoDesc, setMedicaoDesc] = useState("");
  const [isRequestingMedicao, setIsRequestingMedicao] = useState(false);

  // States for dynamic addition
  const [projectDocs, setProjectDocs] = useState(obra.documentos);
  const [projectTeam, setProjectTeam] = useState(obra.equipe);
  
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamRole, setNewTeamRole] = useState("Supervisor de Campo");

  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState("PDF");

  React.useEffect(() => {
    setProjectDocs(obra.documentos);
    setProjectTeam(obra.equipe);
  }, [obra.id, obra.documentos, obra.equipe]);

  // Mock schedule item events
  const scheduleItems = [
    { title: "Mobilização de Canteiro & Tapumes", start: "0% / 100%", progress: 100, days: "15 dias", status: "Concluído" },
    { title: "Terraplenagem, Sondagem & Escavações", start: "0% / 100%", progress: 100, days: "45 dias", status: "Concluído" },
    { title: "Sapatas, Estacas e Blocos de Coroamento", start: "0% / 100%", progress: 100, days: "60 dias", status: "Concluído" },
    { title: "Armadura e Concretagem de Lajes (Subsolo ao 6º)", start: "0% / 100%", progress: 100, days: "120 dias", status: "Concluído" },
    { title: "Estrutura de Concreto Armado (7º ao 15º Pavimento)", start: "65% / 100%", progress: 68, days: "180 dias", status: "Ativo" },
    { title: "Alvenarias de Vedação e Enchimentos de Vãos", start: "20% / 100%", progress: 34, days: "140 dias", status: "Ativo" },
    { title: "Infraestrutura Hidrossanitária Prumadas e Água", start: "40% / 100%", progress: 45, days: "110 dias", status: "Ativo" },
    { title: "Cabeamento Elétrico, Quadros de Força e Telefonia", start: "0% / 100%", progress: 0, days: "90 dias", status: "Planejado" },
    { title: "Acabamentos de Rebocos, Drywall e Pisos Frios", start: "0% / 100%", progress: 0, days: "160 dias", status: "Planejado" },
  ];

  const handleCreateRdo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rdoProgress.trim()) return;

    addRdo(obra.id, rdoWeather, parseInt(rdoWorkers) || 40, rdoProgress, rdoObservations);
    setRdoProgress("");
    setRdoObservations("");
    showToast("Relatório Diário de Obra (RDO) registrado e transmitido para aprovação técnica!", "success");
  };

  const handleCreateMedicao = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(medicaoAmount);
    if (isNaN(amountVal) || !medicaoDesc.trim()) return;

    addMedicao(obra.id, amountVal, medicaoDesc);
    setMedicaoAmount("");
    setMedicaoDesc("");
    setIsRequestingMedicao(false);
    showToast("Medição de Obra solicitada com sucesso! O perito do banco financiador receberá os logs para auditoria.", "success");
  };

  const handleSelectObra = (id: string) => {
    setSelectedProjectId(id);
    setIsListView(false);
  };

  if (isListView) {
    const filteredObras = obras.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return (
      <div className="space-y-6 font-sans">
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg">
          {/* Header Controls for List */}
          <div className="p-4 border-b border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-sm font-bold font-mono text-zinc-900 border-l-4 border-[hsl(var(--color-primary))] pl-2">
              Meus Projetos
            </h2>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-zinc-50 border border-zinc-200 rounded-md p-0.5">
                <button 
                  onClick={() => setViewMode("quadro")}
                  className={`px-2 py-1 text-[10px] uppercase font-bold rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === "quadro" ? "bg-white text-[hsl(var(--color-primary))] shadow-xs" : "text-zinc-500 hover:bg-white hover:shadow-xs"
                  }`}>
                  <LayoutGrid className="h-3.5 w-3.5" /> Quadro
                </button>
                <button 
                  onClick={() => setViewMode("lista")}
                  className={`px-2 py-1 text-[10px] uppercase font-bold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "lista" ? "bg-white text-[hsl(var(--color-primary))] shadow-xs" : "text-zinc-500 hover:bg-white hover:shadow-xs"
                  }`}>
                  <List className="h-3.5 w-3.5" /> Lista
                </button>
              </div>

              <button className="px-3 py-1.5 border border-zinc-200 bg-white text-zinc-600 font-semibold text-xs rounded-md flex items-center gap-1.5 hover:bg-zinc-50 transition-all cursor-pointer">
                <Filter className="h-3.5 w-3.5" /> Filtrar
              </button>

              <button className="px-3 py-1.5 border border-zinc-200 bg-white text-zinc-600 font-semibold text-xs rounded-md flex items-center gap-1.5 hover:bg-zinc-50 transition-all hidden sm:flex cursor-pointer">
                <HelpCircle className="h-3.5 w-3.5" /> Como funciona
              </button>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por nome..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-zinc-200 rounded-md text-xs w-full sm:w-48 focus:ring-1 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <button className="px-3 py-1.5 bg-[hsl(var(--color-primary))] hover:bg-opacity-90 text-white font-semibold text-xs rounded-md flex items-center gap-1.5 transition-all cursor-pointer">
                <Plus className="h-4 w-4" /> Criar projeto
              </button>

              <button className="px-3 py-1.5 border border-zinc-200 bg-white text-zinc-600 font-semibold text-xs rounded-md flex items-center gap-1 hover:bg-zinc-50 transition-all cursor-pointer">
                Ações <ChevronLeft className="h-3 w-3 -rotate-90" />
              </button>

              <button className="p-1.5 border border-zinc-200 bg-white text-zinc-600 rounded-md hover:bg-zinc-50 transition-all cursor-pointer">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === "lista" ? (
              <motion.div 
                key="lista"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="bg-white border border-[hsl(var(--color-border))] rounded-lg overflow-x-auto"
              >
                <table className="w-full text-left font-sans">
                  <thead className="bg-zinc-50">
                    <tr className="border-b border-zinc-200 text-[10.5px] font-semibold text-zinc-500">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Projeto</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Etiqueta</th>
                      <th className="py-3 px-4 min-w-[120px]">Adicionado em</th>
                      <th className="py-3 px-4">Responsável</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredObras.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-400 text-xs">Nenhum projeto encontrado.</td>
                      </tr>
                    ) : (
                      filteredObras.map((o, idx) => (
                        <tr 
                          key={o.id} 
                          onClick={() => handleSelectObra(o.id)}
                          className="hover:bg-zinc-50/50 cursor-pointer transition-colors group"
                        >
                          <td className="py-3 px-4 text-xs font-mono text-zinc-400 text-center">{idx + 1}</td>
                          <td className="py-3 px-4 text-xs font-semibold text-zinc-800 group-hover:text-[hsl(var(--color-primary))] transition-colors">
                            {o.name}
                          </td>
                          <td className="py-3 px-4 text-xs text-zinc-600">{o.manager || "Cliente Interno"}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 text-[10px] rounded-full font-medium pb-0.5 ${
                              o.progress >= 100 
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                                : "bg-blue-50 text-blue-600 border border-blue-100"
                            }`}>
                              {o.progress >= 100 ? "Concluído" : "Em andamento"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-zinc-400 font-mono text-xs">{o.status}</td>
                          <td className="py-3 px-4 text-xs text-zinc-500 font-mono">{o.startDate || "01/06/2026"}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <div className="h-5 w-5 rounded bg-zinc-200 text-zinc-600 flex items-center justify-center text-[9px] font-bold">
                                {o.manager.substring(0, 1).toUpperCase()}
                              </div>
                              <span className="text-xs text-zinc-500 truncate max-w-[150px]">{o.manager}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </motion.div>
            ) : (
              <motion.div 
                key="quadro"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-6 pt-4 scrollbar-thin scrollbar-thumb-zinc-200"
              >
                {["Planejamento", "Fundação", "Estrutura", "Acabamento", "Entregue"].map((status) => {
                  const items = filteredObras.filter(o => o.status === status);
                  return (
                    <div key={status} className="bg-zinc-100/60 border border-zinc-200 p-3.5 rounded-2xl shrink-0 min-w-[270px] flex flex-col justify-between shadow-xs max-w-[310px] flex-1">
                      <div>
                        <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-extrabold text-zinc-700 uppercase tracking-wider">
                              {status}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.25 bg-zinc-200 text-zinc-650 rounded-full font-bold font-mono">
                              {items.length}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-black text-[hsl(var(--color-primary))]">
                            R$ {(items.reduce((acc, o) => acc + o.budgetTotal, 0) / 1000).toFixed(0)}k
                          </span>
                        </div>
                        <div className="space-y-3">
                          {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 px-3 border border-dashed border-zinc-300 rounded-xl bg-white/40 text-center animate-fade-in my-1.5">
                              <FolderDot
                                className="h-7.5 w-7.5 text-zinc-300 mb-2.5 animate-bounce"
                                style={{ animationDuration: "3.5s" }}
                              />
                              <p className="text-[10px] font-bold text-zinc-500 leading-snug">Vazio nesta Etapa</p>
                              <p className="text-[9px] text-zinc-400 mt-1 leading-snug max-w-[140px] mx-auto">
                                Nenhum projeto registrado como {status.toLowerCase()}.
                              </p>
                            </div>
                          ) : (
                            items.map(o => {
                              // Define visual accent based on status 
                              let borderClass = "border-l-4 border-l-blue-500 hover:border-blue-400";
                              let glowClass = "hover:shadow-[0_12px_24px_rgba(59,130,246,0.15)]";
                              
                              if (status === "Planejamento") {
                                borderClass = "border-l-4 border-l-purple-500 hover:border-purple-400";
                                glowClass = "hover:shadow-[0_12px_24px_rgba(168,85,247,0.15)]";
                              } else if (status === "Estutura" || status === "Acabamento") {
                                borderClass = "border-l-4 border-l-amber-500 hover:border-amber-400";
                                glowClass = "hover:shadow-[0_12px_24px_rgba(245,158,11,0.15)]";
                              } else if (status === "Entregue") {
                                borderClass = "border-l-4 border-l-emerald-500 hover:border-emerald-400";
                                glowClass = "hover:shadow-[0_12px_24px_rgba(16,185,129,0.15)]";
                              }

                              return (
                                <div
                                  key={o.id}
                                  onClick={() => handleSelectObra(o.id)}
                                  className={`bg-white rounded-xl p-4.5 border border-zinc-200/80 shadow-2xs transition-all duration-300 relative overflow-hidden group/card cursor-pointer ${borderClass} ${glowClass}`}
                                >
                                  {o.progress >= 100 && (
                                    <div className="absolute top-2 right-2 flex items-center gap-1">
                                      <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                      </span>
                                      <span className="text-[7.5px] font-black font-mono tracking-wider text-emerald-600 uppercase select-none">
                                        CONCLUÍDO
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex items-start justify-between gap-3 pr-[14px]">
                                    <span className="text-xs font-bold text-zinc-850 font-sans block truncate max-w-[160px] leading-tight group-hover/card:text-[hsl(var(--color-primary))] transition-colors" title={o.name}>
                                      {o.name}
                                    </span>
                                  </div>

                                  <p className="text-[9.5px] text-zinc-500 font-sans mt-2.5 flex items-center gap-1.5 uppercase tracking-wide truncate border-b border-zinc-100 pb-2">
                                    <HardHat className="h-3 w-3 inline text-zinc-400 shrink-0" /> {o.location}
                                  </p>

                                  <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-zinc-600">
                                    <span className="flex flex-col gap-0.5">
                                      <span className="text-[9px] font-sans text-zinc-400">Progresso Físico</span>
                                      <span className="font-bold">{o.progress}%</span>
                                    </span>
                                  </div>

                                  {/* Interactive Progress Bar */}
                                  <div className="w-full h-1 my-2 rounded-full bg-zinc-100 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${o.progress >= 100 ? "bg-emerald-500" : "bg-[hsl(var(--color-primary))]"}`} 
                                      style={{ width: `${o.progress}%` }}
                                    />
                                  </div>

                                  <div className="mt-3.5 pt-3 border-t border-zinc-100 flex items-center justify-between">
                                    <span className="text-[11px] font-black font-mono text-zinc-900">
                                      R$ {(o.budgetTotal / 1000000).toFixed(2)}M
                                    </span>
                                    <span className="text-[9px] font-mono text-zinc-400 truncate max-w-[65px]" title={o.manager}>
                                      {o.manager.split(" ").slice(-1)[0]}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans flex flex-col">
      <button 
        onClick={() => setIsListView(true)}
        className="self-start px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:bg-white rounded-lg transition-colors cursor-pointer"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Projetos
      </button>

      {/* Master Board Header */}
      <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-[hsl(var(--color-sidebar-accent))] text-[hsl(var(--color-sidebar-primary))] rounded-lg border border-[hsl(var(--color-sidebar-border))] hidden sm:block shrink-0">
            <HardHat className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-950">
                Ficha Técnica: {obra.name}
              </h2>
              <span className="p-1 px-1.5 bg-zinc-50 border border-zinc-150 rounded text-[9px] font-mono font-bold text-zinc-500 uppercase">
                {obra.status}
              </span>
            </div>
            <p className="text-xs text-zinc-600 font-sans mt-1 leading-relaxed max-w-2xl">{obra.description}</p>
            <span className="text-[10px] font-mono text-zinc-400 block mt-2">📍 Região: {obra.location} • Engenheiro Responsável: {obra.manager}</span>
          </div>
        </div>

        <div className="text-right shrink-0 border-t md:border-t-0 pt-3.5 md:pt-0">
          <span className="text-[10px] font-mono text-zinc-400 block uppercase">Desembolso Financeiro</span>
          <span className="text-base font-mono font-bold text-[hsl(var(--color-primary))] mt-1 block">
             R$ {obra.budgetSpent.toLocaleString("pt-BR")}
          </span>
          <span className="text-[10px] text-zinc-500 block">dos R$ {obra.budgetTotal.toLocaleString()} orçados</span>
        </div>
      </div>

      {/* Sub Tabs controller */}
      <div className="flex flex-wrap gap-1 border-b border-zinc-200">
        {[
          { id: "geral", label: "Geral", icon: Layers },
          { id: "orcamento", label: "Orçamento", icon: DollarSign },
          { id: "fisicofinanceiro", label: "Físico-Financeiro", icon: Activity },
          { id: "cronograma", label: "Cronograma", icon: Calendar },
          { id: "curvas", label: "Curva S", icon: TrendingUp },
          { id: "rdo", label: "RDO (Diário)", icon: CloudSun },
          { id: "medicoes", label: "Medições", icon: FileCheck2 },
          { id: "financeiro", label: "Financeiro", icon: Coins },
          { id: "equipe", label: "Equipe", icon: Users },
          { id: "documentos", label: "Documentos", icon: FolderDot },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as ActiveSubTab)}
              className={`px-4 py-2 text-[11px] font-semibold font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "border-[hsl(var(--color-primary))] text-[hsl(var(--color-primary))] bg-zinc-50 rounded-t-md"
                  : "border-transparent text-zinc-450 hover:text-zinc-800 hover:bg-zinc-50/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab renderization */}
      <div className="mt-4">
        {/* TAB GENERALE: PAINEL GERAL */}
        {activeSubTab === "geral" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Middle cols: General visual cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 block">
                  Status de Evolução Física
                </h3>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-zinc-700">Fase Atual: Estrutura & Lajes</span>
                      <span className="font-mono font-bold text-[hsl(var(--color-primary))]">{obra.progress}% Concluído</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-500"
                        style={{ width: `${obra.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-zinc-100 pt-4 mt-2">
                    <div className="p-3 bg-zinc-50 rounded">
                      <span className="text-[10px] font-mono text-zinc-400 block uppercase">Data Início</span>
                      <span className="text-xs font-semibold text-zinc-800 block mt-1">{obra.startDate}</span>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded">
                      <span className="text-[10px] font-mono text-zinc-400 block uppercase">Previsão Entrega</span>
                      <span className="text-xs font-semibold text-zinc-800 block mt-1">{obra.endDate}</span>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded">
                      <span className="text-[10px] font-mono text-zinc-400 block uppercase">Equipe Técnica</span>
                      <span className="text-xs font-semibold text-zinc-800 block mt-1">{obra.equipe.length} Gestores</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick statistics alert card */}
              <div className="p-4 bg-orange-50/70 border border-orange-100 rounded-lg flex gap-3.5">
                <div className="p-1 px-2 bg-[hsl(var(--color-accent-obra))] text-white font-mono font-bold text-xs rounded-sm shrink-0 flex items-center justify-center">
                  OBRA
                </div>
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-orange-950">
                    Aviso Técnico Geral de Segurança — Tabela de Desvios
                  </h4>
                  <p className="text-[11px] text-orange-800 leading-relaxed mt-1">
                    Encontrado um estocamento acima do planejado de <span className="font-bold">aço estrutural CA-50</span> no canteiro interno. Recomenda-se realizar o controle térmico de cura sob as lajes superiores para anular microfissuras incidentes sob baixas temperaturas.
                  </p>
                </div>
              </div>
            </div>

            {/* Right column: active logs preview */}
            <div className="space-y-6">
              <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 block">
                  Diários Recentes (RDO)
                </h3>
                
                <div className="divide-y divide-zinc-100 mt-2">
                  {obra.rdoList.length === 0 ? (
                    <p className="text-xs text-zinc-400 py-6 text-center">Nenhum RDO preenchido para esta obra ainda.</p>
                  ) : (
                    obra.rdoList.slice(0, 2).map((r) => (
                      <div key={r.id} className="py-3.5 space-y-1.5 text-left">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="font-bold text-zinc-800">{r.date}</span>
                          <span className="text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <CloudSun className="h-3.5 w-3.5" /> {r.weather}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-zinc-700 font-sans mt-1 leading-snug">
                          {r.progressNote}
                        </p>
                        <p className="text-[10px] font-sans text-zinc-500 line-clamp-1 italic">
                          Obs: {r.observations}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => setActiveSubTab("rdo")}
                  className="w-full mt-4 py-2 text-center text-xs font-semibold font-mono text-blue-500 bg-blue-50 hover:bg-blue-100/65 rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Ver Todos Relatórios & Cadastrar <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB CRONOGRAMA */}
        {activeSubTab === "cronograma" && (
          <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4 flex-col sm:flex-row gap-2">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                  Cronograma Gantt de Planejamento Ativo
                </h3>
                <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
                  Linha do tempo operacional cobrando as etapas críticas e prazos de conclusão das frentes de trabalho.
                </p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">Total Frentes: 9</span>
            </div>

            <div className="space-y-4">
              {scheduleItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-zinc-50 hover:bg-zinc-100/50 rounded-md border border-zinc-150 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${
                        item.status === "Concluído" ? "bg-emerald-500" : item.status === "Ativo" ? "bg-blue-500 animate-pulse" : "bg-slate-350"
                      }`}></span>
                      <h4 className="text-xs font-bold text-zinc-800 uppercase">{item.title}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-zinc-450 mt-1">
                      <span>Duração: <span className="font-semibold text-zinc-700">{item.days}</span></span>
                      <span>Evolução Fís.: <span className="font-mono font-bold text-zinc-700">{item.progress}%</span></span>
                    </div>
                  </div>

                  <div className="w-full sm:w-48 shrink-0">
                    <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.status === "Concluído" ? "bg-emerald-500" : "bg-[hsl(var(--color-primary))]"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CURVA S FÍSICA */}
        {activeSubTab === "curvas" && (
          <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3">
              Curva S Físico-Financeira Comparativa do Projeto
            </h3>
            
            {/* SVG Curva S custom drawing */}
            <div className="h-64 w-full mt-6">
              <svg className="h-full w-full" viewBox="0 0 600 240">
                <line x1="40" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="130" x2="580" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="180" x2="580" y2="180" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="210" x2="580" y2="210" stroke="#cbd5e1" strokeWidth="1" />

                <text x="5" y="35" fill="#94a3b8" fontSize="8" fontFamily="monospace">100%</text>
                <text x="5" y="85" fill="#94a3b8" fontSize="8" fontFamily="monospace">75%</text>
                <text x="5" y="135" fill="#94a3b8" fontSize="8" fontFamily="monospace">50%</text>
                <text x="5" y="185" fill="#94a3b8" fontSize="8" fontFamily="monospace">25%</text>
                <text x="5" y="213" fill="#94a3b8" fontSize="8" fontFamily="monospace">0%</text>

                {/* Target Meta Curve S */}
                <path
                  d="M 50,210 C 150,210 250,150 350,100 T 550,30"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                />

                {/* Real Curve S */}
                <path
                  d="M 50,210 C 150,212 250,165 350,110"
                  fill="none"
                  stroke="hsl(var(--color-primary))"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                <circle cx="350" cy="110" r="5" fill="hsl(var(--color-primary))" stroke="white" strokeWidth="1.5" />
                <text x="360" y="113" fill="hsl(var(--color-primary))" fontSize="9" fontWeight="bold">Atual: {obra.progress}%</text>
              </svg>
            </div>
            
            <p className="text-xs text-zinc-500 mt-4 leading-relaxed bg-zinc-50 p-3 rounded border border-zinc-150">
              💡 <span className="font-bold text-zinc-900">Análise do Planejamento</span>: O projeto ativo possui um andamento equilibrado. A taxa de desembolso financeiro (<span className="font-bold text-zinc-900">R$ {(obra.budgetSpent / 1000000).toFixed(2)}M</span>) está perfeitamente aderente ao progresso físico de <span className="font-bold text-zinc-900">{obra.progress}%</span>. Risco de desvio classificado em <span className="font-bold text-zinc-900">BAIXO (Seguro)</span>.
            </p>
          </div>
        )}

        {/* TAB ORÇAMENTO COLETIVO */}
        {activeSubTab === "orcamento" && (
          <div className="space-y-6 relative">
            {/* Tabela de Orçamento */}
            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5 space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                    Orçamento de Insumos & Engenharia SINAPI
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
                    Frentes orçamentárias detalhadas no sistema físico-financeiro.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="p-1 px-1.5 bg-orange-100 text-[hsl(var(--color-accent-obra))] font-mono text-[9px] font-bold rounded">
                    SINAPI ATUAL HISTÓRICO
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-zinc-150 text-[10.5px] text-zinc-400 font-mono uppercase">
                      <th className="pb-2 text-left">Macro-categoria / Frente</th>
                      <th className="pb-2 text-right">Planejado</th>
                      <th className="pb-2 text-right">Realizado</th>
                      <th className="pb-2 text-right">Margem / Desvio</th>
                      <th className="pb-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {obra.orcamentoInsumos.map((item, idx) => {
                      const isPositive = item.margin >= 0;
                      return (
                        <tr key={idx} className="hover:bg-zinc-50/50">
                          <td className="py-2.5 text-xs font-semibold text-zinc-850">{item.category}</td>
                          <td className="py-2.5 text-xs text-right text-zinc-600 font-mono">
                            R$ {item.planned.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-xs text-right text-zinc-850 font-mono font-semibold">
                            R$ {item.actual.toLocaleString()}
                          </td>
                          <td className={`py-2.5 text-xs font-bold text-right font-mono ${
                            isPositive ? "text-emerald-600" : "text-rose-600"
                          }`}>
                            {isPositive ? "+" : ""} R$ {item.margin.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={`inline-block px-1.5 py-0.5 text-[8.5px] font-bold font-mono rounded ${
                              isPositive
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-orange-50 text-orange-600 border border-orange-100"
                            }`}>
                              {isPositive ? "Otimizado" : "Desvio Técnico"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB DIÁRIO DE OBRA (RDO) */}
        {activeSubTab === "rdo" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form list diários */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4 block">
                  Criação de Relatório Diário de Obra (RDO)
                </h3>

                <form onSubmit={handleCreateRdo} className="space-y-4 text-xs">
                  {/* Assistente IA de Diário */}
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2 mb-4 shadow-3xs">
                    <div className="flex items-center gap-1.5 text-zinc-950 font-bold">
                      <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                      <span>Gerar Diário de Obra com IA ✨</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-sans leading-relaxed">
                      Cole a mensagem de voz transcrita pelo engenheiro no WhatsApp ou anotações rápidas para extrair climatologia, efetivos e serviços técnicos executados de forma totalmente automatizada.
                    </p>
                    <textarea
                      value={rdoTranscription}
                      onChange={(e) => setRdoTranscription(e.target.value)}
                      rows={3}
                      placeholder="Ex: 'Curitiba chuvosa hoje, sem condições de concretagem externa. Estávamos com 42 operários focados no reboco interno e drywall. Registrado ensaio de corpos de prova sem nenhuma ocorrência de risco...'"
                      className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-sans placeholder-zinc-400 focus:ring-1 focus:ring-primary focus:outline-hidden leading-relaxed"
                    />
                    <button
                      type="button"
                      disabled={isGeneratingRdo || !rdoTranscription.trim()}
                      onClick={async () => {
                        setIsGeneratingRdo(true);
                        try {
                          const res = await fetch("/api/ai/diario", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ transcription: rdoTranscription }),
                          });
                          const data = await res.json();
                          if (res.ok) {
                            if (data.data) {
                              setRdoWeather(data.data.weather || "Ensolarado");
                              setRdoWorkers(data.data.workers?.toString() || "45");
                              setRdoProgress(data.data.progressNote || "");
                              setRdoObservations(data.data.observations || "");
                              showToast("Diário de Obra gerado & estruturado pela I.A.!", "success");
                            }
                          } else {
                            throw new Error(data.error || "Erro de geração");
                          }
                        } catch (err: any) {
                          showToast(`Falha: ${err.message}`, "error");
                        } finally {
                          setIsGeneratingRdo(false);
                        }
                      }}
                      className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-white font-mono font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isGeneratingRdo ? (
                        <>
                          <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                          Registrar & Estruturar com IA
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-zinc-400 block mb-1">Clima / Climatologia</label>
                      <select
                        value={rdoWeather}
                        onChange={(e) => setRdoWeather(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                      >
                        <option value="Ensolarado">Ensolarado (Estável)</option>
                        <option value="Nublado">Nublado / Parcial</option>
                        <option value="Chuvoso / Garoa">Chuvoso (Restrito)</option>
                        <option value="Chuva Forte">Chuva Forte (Interrompido)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase font-bold text-zinc-400 block mb-1">Efetivo de Campo (Trabalhadores)</label>
                      <input
                        type="number"
                        value={rdoWorkers}
                        onChange={(e) => setRdoWorkers(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
                        placeholder="Efetivo ativo de hoje"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-zinc-400 block mb-1">Frente de Avanço / Atividades Concluídas</label>
                    <textarea
                      value={rdoProgress}
                      onChange={(e) => setRdoProgress(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-hidden font-sans placeholder-zinc-450"
                      placeholder="Ex: Conclusão do fechamento de juntas de alvenaria do 10º andar e liberação técnica de fôrmas do 13º pavimento."
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase font-bold text-zinc-400 block mb-1">Observações Técnicas / Notas de Fiscalização</label>
                    <textarea
                      value={rdoObservations}
                      onChange={(e) => setRdoObservations(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-hidden font-sans placeholder-zinc-450"
                      placeholder="Ex: Recebimento de ensaio de resistência de concreto (CP-1, CP-2) comprovando fck 30 MPa."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-[hsl(var(--color-primary))] hover:bg-opacity-90 text-white font-mono uppercase font-bold text-xs rounded transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Send className="h-4.5 w-4.5" /> Registrar RDO Oficial & Salvar
                  </button>
                </form>
              </div>
            </div>

            {/* Historic list */}
            <div className="space-y-4">
              <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-3.5 block">
                  Histórico Técnico RDO
                </h3>

                <div className="space-y-4">
                  {obra.rdoList.map((r) => (
                    <div key={r.id} className="p-3 bg-zinc-50 hover:bg-zinc-100/50 rounded-md border border-zinc-150 transition-colors space-y-1.5">
                      <div className="flex items-center justify-between text-[10.5px] font-mono">
                        <span className="font-bold text-zinc-800">{r.date}</span>
                        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded flex items-center gap-1">
                          {r.weather} • {r.workers} trab.
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-700 leading-snug">
                        {r.progressNote}
                      </p>
                      {r.observations && (
                        <p className="text-[10px] text-zinc-450 italic mt-1 font-sans">
                          Nota: {r.observations}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB MEDIÇÕES DO BANCO */}
        {activeSubTab === "medicoes" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table layout of medicoes */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                    Processo de Liberação de Medições CEF / Itaú
                  </h3>
                  <button
                    onClick={() => setIsRequestingMedicao(true)}
                    className="py-1 px-2.5 bg-[hsl(var(--color-primary))] text-white font-mono text-[10px] font-bold rounded-md hover:bg-blue-600 cursor-pointer flex items-center gap-1"
                  >
                    <PlusSquare className="h-3.5 w-3.5" /> Solicitar Medição
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans">
                    <thead>
                      <tr className="border-b border-zinc-150 text-[10.5px] text-zinc-400 font-mono uppercase">
                        <th className="pb-2">Período / Referência</th>
                        <th className="pb-2 text-right">Valor da Medição</th>
                        <th className="pb-2">Avanço Físico Correspondente</th>
                        <th className="pb-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {obra.medicoesList.map((m) => (
                        <tr key={m.id} className="hover:bg-zinc-50/50">
                          <td className="py-2.5">
                            <span className="text-xs font-bold text-zinc-800 font-mono block">{m.date}</span>
                            <span className="text-[10px] text-zinc-450 block truncate max-w-[200px]">{m.description}</span>
                          </td>
                          <td className="py-2.5 text-xs text-right font-mono font-bold text-zinc-800">
                            R$ {m.amount.toLocaleString()}
                          </td>
                          <td className="py-2.5 text-xs text-zinc-650 font-mono">
                            Equivalente a {(m.amount / obra.budgetTotal * 100).toFixed(1)}% do projeto
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold font-mono rounded ${
                              m.status === "Aprovado" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            }`}>
                              {m.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar details */}
            <div className="space-y-4">
              <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-2 block">
                  Regras de Liberação de Empréstimos
                </h3>
                <p className="text-[11px] text-zinc-600 leading-relaxed font-sans">
                  A Curitiba Construtora opera com financiamento à produção pelo modelo <span className="font-bold">CEF Apoio à Produção</span> ou <span className="font-bold">Itaú Construtora Master</span>. 
                  As liberações de verba ocorrem mediante aprovação técnica mensal do engenheiro perito independente credenciado do banco.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded text-[10.5px] text-amber-900 mt-4 flex gap-2">
                  <ShieldAlert className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    A última medição mensal solicita o valor de <span className="font-bold text-zinc-900">R$ 520k</span>. Certifique-se de anexar os laudos de fck à pasta de documentos!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB DOCUMENTOS SUBTABS SYSTEM */}
        {activeSubTab === "fisicofinanceiro" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-4">
                <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Progresso Físico vs Financeiro</span>
                <div className="flex items-center gap-3.5 mt-2.5">
                  <span className="text-xl font-bold font-mono text-zinc-800">{obra.progress}%</span>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold font-mono">VS</span>
                  <span className="text-xl font-bold font-mono text-emerald-600">
                    {Math.round((obra.budgetSpent / obra.budgetTotal) * 100)}%
                  </span>
                </div>
                <p className="text-[10.5px] text-zinc-500 font-sans mt-2">
                  Aderência de desembolsos contra cronograma físico-financeiro planejado.
                </p>
              </div>

              <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-4">
                <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Taxa de BDI Aplicada (Indiretos)</span>
                <span className="text-xl font-bold font-mono text-zinc-800 mt-2.5 block">24.15%</span>
                <p className="text-[10.5px] text-zinc-500 font-sans mt-2">
                  BDI ponderado para projetos de médio/alto padrão em Curitiba.
                </p>
              </div>

              <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-4">
                <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Status de Desvio Orçamentário</span>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[9.5px] font-bold rounded border border-emerald-100 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Dentro do Teto
                  </span>
                </div>
                <p className="text-[10.5px] text-zinc-500 font-sans mt-2">
                  Saldo de contingência em R$ 360k preservado na conta caixa principal.
                </p>
              </div>
            </div>

            {/* Comparison Visualizer */}
            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4 block">
                Monitor de Aderência Físico-Financeira
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-zinc-650 mb-1.5">
                    <span>Meta de Progresso Físico Executado (Projetado)</span>
                    <span className="font-bold">71%</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded overflow-hidden">
                    <div className="bg-zinc-400 h-2 rounded transition-all" style={{ width: "71%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-zinc-650 mb-1.5">
                    <span>Progresso Físico Real Conduzido (Medido pelo Banco)</span>
                    <span className="font-bold text-blue-600">{obra.progress}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded overflow-hidden">
                    <div className="bg-blue-500 h-2 rounded transition-all" style={{ width: `${obra.progress}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-zinc-650 mb-1.5">
                    <span>Desembolso Orçamentário Processado (Financeiro)</span>
                    <span className="font-bold text-emerald-600">
                      {Math.round((obra.budgetSpent / obra.budgetTotal) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded transition-all" style={{ width: `${Math.round((obra.budgetSpent / obra.budgetTotal) * 100)}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded text-[10.5px] text-blue-900 mt-5 leading-relaxed">
                <strong>Análise Técnica:</strong> O desvio atual de -3% entre o progresso projetado e o real decorre do atraso de entrega de insumos de fechamento da armadura no Batel. As liberações financeiras mantêm-se regulares e alinhadas aos requisitos de medição da Caixa Econômica Federal.
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "financeiro" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-4">
                <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Total Liberado (Receitas)</span>
                <span className="text-base font-mono font-bold text-emerald-600 mt-1 block">
                  R$ {(obra.budgetSpent * 1.05).toLocaleString("pt-BR")}
                </span>
                <p className="text-[9px] text-zinc-450 mt-1">Repasses CEF já liquidados na conta ITAÚ Construtora.</p>
              </div>

              <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-4">
                <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Despesas Apropriadas (Saídas)</span>
                <span className="text-base font-mono font-bold text-zinc-800 mt-1 block">
                  R$ {obra.budgetSpent.toLocaleString("pt-BR")}
                </span>
                <p className="text-[9px] text-zinc-450 mt-1">Insumos SINAPI, subempreiteiros e concreto usinado.</p>
              </div>

              <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-4">
                <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Margem Operacional Líquida</span>
                <span className="text-base font-mono font-bold text-blue-600 mt-1 block">
                  R$ {((obra.budgetSpent * 1.05) - obra.budgetSpent).toLocaleString("pt-BR")}
                </span>
                <p className="text-[9px] text-zinc-450 mt-1">Rentabilidade atual calculada sobre etapas liberadas.</p>
              </div>
            </div>

            {/* Project Specific Ledger (Filtered rateios) */}
            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
              <div className="flex items-center justify-between border-b border-zinc-150 pb-3 mb-4">
                <div>
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 leading-none">
                    Extrato de Rateios do Projeto (Livro de Caixa)
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-sans mt-1">
                    Lançamentos financeiros rateados e direcionados especificamente a este canteiro.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">Total de Registros: {(lancamentos?.filter(l => l.project === obra.id)?.length || 0) + 1}</span>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 text-[10px] text-zinc-400 font-mono uppercase">
                      <th className="pb-2">Data</th>
                      <th className="pb-2">Lançamento / Histórico</th>
                      <th className="pb-2">Apropriação</th>
                      <th className="pb-2 text-right">Valor Líquido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    <tr className="hover:bg-zinc-50/50">
                      <td className="py-2.5 font-mono text-[10.5px] text-zinc-500">2026-06-05</td>
                      <td className="py-2.5">
                        <span className="font-semibold text-zinc-800 block">Concretagem de Lajes Gerdau</span>
                        <span className="text-[9.5px] text-zinc-400 font-mono mt-0.5 block">Itaú Construtora • Cotação S-43</span>
                      </td>
                      <td className="py-2.5 text-[10.5px] font-mono text-zinc-500">Material Estrutural</td>
                      <td className="py-2.5 text-right font-mono font-bold text-rose-600">- R$ 78.500</td>
                    </tr>
                    {lancamentos
                      ?.filter(l => l.project === obra.id)
                      ?.map((ln) => (
                        <tr key={ln.id} className="hover:bg-zinc-50/50">
                          <td className="py-2.5 font-mono text-[10.5px] text-zinc-500">{ln.date}</td>
                          <td className="py-2.5">
                            <span className="font-semibold text-zinc-800 block">{ln.description}</span>
                            <span className="text-[9.5px] text-zinc-400 font-mono mt-0.5 block">Conta rateada</span>
                          </td>
                          <td className="py-2.5 text-[10.5px] font-mono text-zinc-500">{ln.category}</td>
                          <td className={`py-2.5 text-right font-mono font-bold ${ln.type === "receita" ? "text-emerald-600" : "text-rose-600"}`}>
                            {ln.type === "receita" ? "+" : "-"} R$ {ln.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "equipe" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4 block">
                Corpo Técnico Ativo no Canteiro
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {projectTeam.map((eq, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-100 rounded-lg hover:border-zinc-250 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-[hsl(var(--color-sidebar))] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                        {eq.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-850 block leading-none">{eq.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono mt-1.5 block">{eq.role}</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setProjectTeam(prev => prev.filter(t => t.name !== eq.name));
                        alert(`Membro ${eq.name} removido da equipe do projeto.`);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                      title="Remover do Projeto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Form to add collaborator */}
            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5 animate-in fade-in">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4 block">
                Alocar Profissional ao Canteiro
              </h3>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newTeamName.trim()) return;
                  const newMember = { name: newTeamName, role: newTeamRole };
                  setProjectTeam(prev => [...prev, newMember]);
                  setNewTeamName("");
                  alert(`${newTeamName} foi alocado com sucesso como ${newTeamRole} no projeto ${obra.name}!`);
                }}
                className="space-y-4 text-xs text-left"
              >
                <div>
                  <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Ex: Dra. Mariana de Almeida"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-zinc-700 font-sans"
                  />
                </div>

                <div>
                  <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1">Cargo / Função Técnica</label>
                  <select
                    value={newTeamRole}
                    onChange={(e) => setNewTeamRole(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-zinc-700 font-sans"
                  >
                    <option value="Engenheiro Residente">Engenheiro Residente</option>
                    <option value="Mestre de Obras">Mestre de Obras</option>
                    <option value="Projetista Estrutural">Projetista Estrutural</option>
                    <option value="Técnico em Segurança">Técnico em Segurança</option>
                    <option value="Apontador de Campo">Apontador de Campo</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[hsl(var(--color-primary))] text-white font-mono uppercase font-bold text-xs rounded hover:bg-opacity-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Alocar Membro SQUAD
                </button>
              </form>
            </div>
          </div>
        )}

        {activeSubTab === "documentos" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            <div className="lg:col-span-2 bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                  Cofre de Desenhos & Documentos Técnicos (Art. 21)
                </h3>
                <span className="text-[9.5px] font-mono text-zinc-400">Desenhos Ativos: {projectDocs.length}</span>
              </div>

              <div className="space-y-3 mt-4">
                {projectDocs.map((doc, idx) => (
                  <div key={idx} className="p-2.5 bg-zinc-50 hover:bg-zinc-100/50 rounded border border-zinc-150 transition-colors flex items-center justify-between font-mono text-[11px]">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <span className="p-1.5 bg-blue-50 text-blue-500 rounded font-bold text-[9px] font-mono leading-none">{doc.type}</span>
                      <div className="truncate">
                        <span className="text-zinc-800 font-semibold truncate block max-w-[200px]">{doc.name}</span>
                        <span className="text-[9px] text-zinc-400 block">{doc.size} • {doc.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button className="px-2 py-1 bg-white hover:bg-zinc-50 border border-zinc-200 rounded font-sans text-[10px] font-semibold text-zinc-650 flex items-center gap-1 cursor-pointer">
                        <Eye className="h-3 w-3" /> Ver
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setProjectDocs(prev => prev.filter(d => d.name !== doc.name));
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded cursor-pointer"
                        title="Remover Documento"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical drawing upload box */}
            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4 block">
                  Cofre Seguro: Upload de Documentos
                </h3>

                <div 
                  onClick={() => {
                    const dName = prompt("Digite o nome do arquivo técnico de desenho a carregar:");
                    if (dName) {
                      const ext = dName.split(".").pop()?.toUpperCase() || "PDF";
                      const newD = {
                        name: dName,
                        type: ext,
                        size: `${(Math.random() * 10 + 1).toFixed(1)} MB`,
                        date: new Date().toISOString().split("T")[0]
                      };
                      setProjectDocs(prev => [newD, ...prev]);
                      alert("Documento anexado de forma segura sob criptografia no servidor construtora.");
                    }
                  }}
                  className="p-6 border-2 border-dashed border-zinc-200 rounded-lg text-center hover:border-[hsl(var(--color-primary))] cursor-pointer transition-colors bg-zinc-50/50"
                >
                  <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                  <span className="text-xs font-bold text-zinc-700 block">Arraste ou clique para carregar</span>
                  <p className="text-[9.5px] text-zinc-400 mt-1.5">Suporta PDF, DWG, BIM, XLSX e PNG técnicos</p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-100 rounded text-[10.5px] text-zinc-600 mt-5 leading-relaxed">
                <strong>Análise Técnica Segura:</strong> Todos os desenhos técnicos carregados no EVIS ERP passam pelo pré-processamento de compatibilização estrutural automatizado em conformidade com as normas regulamentares NBR brasileiras.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Solicitar Medição Modal */}
      {isRequestingMedicao && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <form onSubmit={handleCreateMedicao} className="bg-white rounded-lg border border-zinc-200 shadow-2xl w-full max-w-sm overflow-hidden font-sans">
            <div className="p-4 bg-[hsl(var(--color-sidebar))] text-white flex items-center justify-between">
              <span className="text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1">
                <FileCheck2 className="h-4 w-4 text-emerald-400" /> Nova Solicitação de Medição
              </span>
              <button type="button" onClick={() => setIsRequestingMedicao(false)} className="text-zinc-400 hover:text-white cursor-pointer font-bold select-none">X</button>
            </div>
            
            <div className="p-5 space-y-4 text-xs text-left">
              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase mb-1">Valor da Etapa Conduzida (R$)</label>
                <input
                  type="number"
                  required
                  value={medicaoAmount}
                  onChange={(e) => setMedicaoAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded"
                  placeholder="Ex: 520000"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-400 block uppercase mb-1">Descrição Técnico-Operacional Correspondente</label>
                <textarea
                  required
                  value={medicaoDesc}
                  onChange={(e) => setMedicaoDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded"
                  placeholder="Ex: Conclusão do desforro de concreto armado do 12º pavimento e reforço em alvenaria estrutural interna externa do Bloco A."
                ></textarea>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestingMedicao(false)}
                  className="flex-1 py-1.5 border border-zinc-200 hover:bg-zinc-50 font-semibold text-zinc-600 rounded cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-[hsl(var(--color-primary))] text-white hover:bg-blue-600 font-semibold rounded cursor-pointer"
                >
                  Disparar Perito CEF
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
