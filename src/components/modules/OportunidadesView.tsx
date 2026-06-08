import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Oportunidade } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import OportunidadeDetail from "./OportunidadeDetail";
import {
  Sparkles,
  Search,
  PlusSquare,
  Building2,
  TrendingUp,
  TrendingDown,
  User,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Calculator,
  FolderOpen,
  Trash2,
  X,
  Plus,
  Compass,
  DollarSign,
  Briefcase,
  Upload,
  LayoutGrid,
  List
} from "lucide-react";

export default function OportunidadesView() {
  const { oportunidades, setOportunidades, addOportunidade, showToast } = useApp();
  const [filterText, setFilterText] = useState("");
  const [viewMode, setViewMode] = useState<"lista" | "quadro">("quadro");
  const [isAdding, setIsAdding] = useState(false);
  const [activeStagePreset, setActiveStagePreset] = useState<Oportunidade["stage"]>("Proposta");
  const [selectedOportunidadeId, setSelectedOportunidadeId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState<Oportunidade["stage"]>("Proposta");
  const [customProbability, setCustomProbability] = useState<number>(50);

  // AI Lead Extraction states
  const [addMethod, setAddMethod] = useState<"manual" | "ai">("manual");
  const [aiText, setAiText] = useState("");
  const [aiImageBase64, setAiImageBase64] = useState<string | null>(null);
  const [aiImageMimeType, setAiImageMimeType] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedLead, setExtractedLead] = useState<any | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valFloat = parseFloat(value);
    if (!title.trim() || !client.trim() || isNaN(valFloat)) {
      showToast("Por favor preencha todos os campos obrigatórios com valores válidos.", "error");
      return;
    }

    // Call standard CRM insert helper
    addOportunidade(title, client, valFloat, stage);

    // Let's modify the last added opportunity probability if they used the custom modal slider
    setOportunidades((prev) => {
      const updated = [...prev];
      if (updated.length > 0 && updated[0].title === title) {
        updated[0].probability = customProbability;
      }
      return updated;
    });

    setTitle("");
    setClient("");
    setValue("");
    setCustomProbability(50);
    setIsAdding(false);
    showToast("Nova oportunidade de construção integrada com sucesso ao funil CRM!", "success");
  };

  const handleProbabilityChange = (id: string, prob: number) => {
    setOportunidades((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          return { ...o, probability: prob };
        }
        return o;
      })
    );
  };

  const deleteOp = (id: string, title: string) => {
    setOportunidades((prev) => prev.filter((o) => o.id !== id));
    showToast(`Proposta "${title}" removida do funil ERP.`, "info");
  };

  // Group columns
  const stages: Oportunidade["stage"][] = ["Proposta", "Negociação", "Apresentação", "Ganho", "Perdido"];

  const getFilteredOps = (stg: Oportunidade["stage"]) => {
    return oportunidades.filter(
      (o) =>
        o.stage === stg &&
        (o.title.toLowerCase().includes(filterText.toLowerCase()) ||
          o.client.toLowerCase().includes(filterText.toLowerCase()))
    );
  };

  const moveStage = (id: string, direction: "forward" | "back") => {
    setOportunidades((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const currentIdx = stages.indexOf(o.stage);
          let nextIdx = currentIdx;
          if (direction === "forward" && currentIdx < stages.length - 1) {
            nextIdx = currentIdx + 1;
          } else if (direction === "back" && currentIdx > 0) {
            nextIdx = currentIdx - 1;
          }

          if (nextIdx !== currentIdx) {
            const nextStage = stages[nextIdx];
            showToast(`"${o.title}" movido para o estágio de "${nextStage}"`, "success");
            return {
              ...o,
              stage: nextStage,
              probability: nextStage === "Ganho" ? 100 : nextStage === "Perdido" ? 0 : o.probability,
            };
          }
        }
        return o;
      })
    );
  };

  // Calculations for CRM overview KPI panel
  const totalCRMValue = oportunidades.reduce((sum, item) => sum + item.value, 0);
  const activeOpportunities = oportunidades.filter((op) => op.stage !== "Ganho" && op.stage !== "Perdido");
  const winCount = oportunidades.filter((op) => op.stage === "Ganho").length;
  const lostCount = oportunidades.filter((op) => op.stage === "Perdido").length;
  const conversionRate = oportunidades.length > 0
    ? Math.round((winCount / (winCount + lostCount || 1)) * 100)
    : 0;

  const getProbabilityColor = (prob: number) => {
    if (prob >= 75) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (prob >= 40) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-rose-500 bg-rose-500/10 border-rose-500/20";
  };

  const getGlowAndAccent = (stg: Oportunidade["stage"]) => {
    switch (stg) {
      case "Ganho":
        return {
          glow: "hover:shadow-[0_12px_24px_rgba(16,185,129,0.15)] hover:border-emerald-400",
          border: "border-l-4 border-l-emerald-500"
        };
      case "Perdido":
        return {
          glow: "hover:shadow-[0_12px_24px_rgba(244,63,94,0.1)] hover:border-rose-400",
          border: "border-l-4 border-l-rose-400"
        };
      case "Apresentação":
        return {
          glow: "hover:shadow-[0_12px_24px_rgba(168,85,247,0.15)] hover:border-purple-400",
          border: "border-l-4 border-l-purple-500"
        };
      case "Negociação":
        return {
          glow: "hover:shadow-[0_12px_24px_rgba(245,158,11,0.15)] hover:border-amber-400",
          border: "border-l-4 border-l-amber-500"
        };
      case "Proposta":
      default:
        return {
          glow: "hover:shadow-[0_12px_24px_rgba(59,130,246,0.15)] hover:border-blue-400",
          border: "border-l-4 border-l-blue-500"
        };
    }
  };

  const getStageHeaderStyle = (stg: Oportunidade["stage"]) => {
    switch (stg) {
      case "Ganho":
        return "bg-emerald-500 text-white";
      case "Perdido":
        return "bg-rose-505 bg-rose-450 text-white";
      case "Apresentação":
        return "bg-purple-500 text-white";
      case "Negociação":
        return "bg-amber-500 text-black";
      default:
        return "bg-blue-500 text-white";
    }
  };

  // Filter count indicator matching query
  const totalFilteredCount = stages.reduce(
    (count, stg) => count + getFilteredOps(stg).length,
    0
  );

  if (selectedOportunidadeId) {
    const op = oportunidades.find((o) => o.id === selectedOportunidadeId);
    if (op) {
      return (
        <OportunidadeDetail
          oportunidade={op}
          onBack={() => setSelectedOportunidadeId(null)}
        />
      );
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Dynamic CRM KPI Metric Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-wider block">Volume do Funil CRM</span>
            <span className="text-xl font-black text-zinc-900 mt-1 block">R$ {(totalCRMValue / 1000000).toFixed(1)}M</span>
            <span className="text-[9px] text-zinc-500 font-sans block mt-0.5">Soma de todas as concorrências</span>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-[hsl(var(--color-border))] rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-wider block">Negociações Ativas</span>
            <span className="text-xl font-black text-zinc-900 mt-1 block">{activeOpportunities.length} Contratos</span>
            <span className="text-[9px] text-emerald-600 font-sans font-medium block mt-0.5">Em andamento consultivo</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Briefcase className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-[hsl(var(--color-border))] rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-wider block">Taxa de Conversão</span>
            <span className="text-xl font-black text-zinc-900 mt-1 block">{conversionRate}%</span>
            <span className="text-[9px] text-zinc-500 font-sans block mt-0.5">Eficiência de propostas ganhas</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-[hsl(var(--color-border))] rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-wider block">Propostas Encerradas</span>
            <span className="text-xl font-black text-zinc-900 mt-1 block">{winCount + lostCount} Totais</span>
            <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">Ganhas: {winCount} | Perdidas: {lostCount}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Compass className="h-5 w-5 animate-spin-slow" />
          </div>
        </div>
      </div>

      {/* CRM Actions header with animated expanding search */}
      <div className="bg-white border border-[hsl(var(--color-border))] rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-black font-mono uppercase tracking-widest text-zinc-950 flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" /> Funil de Oportunidades & Bidding CRM
          </h2>
          <p className="text-[10px] text-zinc-500 font-sans mt-1">
            Gerenciamento de licitações públicas, propostas comerciais e aprovações financeiras corporativas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
          {/* Toggle buttons */}
          <div className="flex bg-zinc-50 border border-zinc-200 rounded-md p-0.5">
            <button 
              onClick={() => setViewMode("quadro")}
              className={`px-2 py-1 text-[10px] uppercase font-bold rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "quadro" ? "bg-white text-[hsl(var(--color-primary))] shadow-xs" : "text-zinc-500 hover:bg-white hover:shadow-xs"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Quadro
            </button>
            <button 
              onClick={() => setViewMode("lista")}
              className={`px-2 py-1 text-[10px] uppercase font-bold rounded flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "lista" ? "bg-white text-[hsl(var(--color-primary))] shadow-xs" : "text-zinc-500 hover:bg-white hover:shadow-xs"
              }`}
            >
              <List className="h-3.5 w-3.5" /> Lista
            </button>
          </div>

          {/* Animated search box */}
          <div className="relative flex-1 sm:flex-initial flex items-center gap-2">
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Localizar negociação..."
              className="pl-8 pr-12 py-2 bg-zinc-50 border border-zinc-200 focus:border-primary rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary/10 focus:bg-white focus:outline-hidden transition-all duration-300 w-full sm:w-48 sm:focus:w-72 shadow-inner font-sans"
            />
            <Search className="absolute left-2.5 top-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <AnimatePresence>
              {filterText && (
                <div className="absolute right-3 top-2 flex items-center gap-1.5">
                  <span className="text-[9px] font-mono font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full select-none animate-fade-in">
                    {totalFilteredCount}
                  </span>
                  <button
                    onClick={() => setFilterText("")}
                    className="p-0.5 hover:bg-zinc-200 rounded-full text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => {
              setStage("Proposta");
              setIsAdding(true);
            }}
            className="py-2 px-3.5 bg-primary text-primary-foreground font-mono font-bold text-xs rounded-xl hover:bg-opacity-95 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="h-4.5 w-4.5" /> Nova Proposta
          </button>
        </div>
      </div>

      {/* Lia Comercial Insights Layer */}
      <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/40 rounded-xl p-5 mb-6 shadow-sm">
         <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-purple-800 dark:text-purple-400 mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Lia Comercial (Analista de CRM)
         </h3>
         <p className="text-sm font-semibold text-purple-950 dark:text-purple-100 mb-3">
            Este lead <span className="font-bold underline decoration-purple-300">Residencial Kairo</span> parece quente porque demonstrou urgência e pediu retorno rápido. <span className="text-orange-600 block mt-1">Sugiro contato em até 24 horas. Posso preparar um briefing para orçamento, mas você confirma antes.</span>
         </p>
         <div className="flex gap-3">
            <button className="text-[10px] font-bold px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 cursor-pointer shadow-sm transition-all"
               onClick={() => alert("Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.")}
            >
              Preparar briefing para orçamento
            </button>
            <button className="text-[10px] font-bold px-3 py-1.5 bg-white border border-purple-200 text-purple-700 rounded hover:bg-purple-50 cursor-pointer shadow-sm transition-all"
               onClick={() => alert("Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.")}
            >
              Gerar rascunho de engajamento (Gmail)
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
                  <th className="py-3 px-4">Proposta</th>
                  <th className="py-3 px-4">Cliente / Concorrência</th>
                  <th className="py-3 px-4">Estágio</th>
                  <th className="py-3 px-4">Valor Estimado</th>
                  <th className="py-3 px-4">Contato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {stages.flatMap(stg => getFilteredOps(stg)).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-zinc-400 text-xs">Nenhuma proposta encontrada.</td>
                  </tr>
                ) : (
                  stages.flatMap(stg => getFilteredOps(stg)).map((op, idx) => {
                    const { border } = getGlowAndAccent(op.stage);
                    return (
                      <tr 
                        key={op.id} 
                        onClick={() => setSelectedOportunidadeId(op.id)}
                        className="hover:bg-zinc-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="py-3 px-4 text-xs font-mono text-zinc-400 text-center">{idx + 1}</td>
                        <td className="py-3 px-4 text-xs font-semibold text-zinc-800 group-hover:text-[hsl(var(--color-primary))] transition-colors">
                          {op.title}
                        </td>
                        <td className="py-3 px-4 text-xs text-zinc-600 flex items-center gap-2">
                          <Building2 className="h-3 w-3 text-zinc-400" /> {op.client}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 text-[10px] rounded-full font-medium pb-0.5 ${getStageHeaderStyle(op.stage).replace("text-white", "text-zinc-900 border")}`}>
                            {op.stage}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono font-bold text-[hsl(var(--color-primary))]">
                          R$ {(op.value / 1000000).toFixed(2)}M
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className="h-5 w-5 rounded bg-zinc-200 text-zinc-600 flex items-center justify-center text-[9px] font-bold">
                              {op.owner.substring(0, 1).toUpperCase()}
                            </div>
                            <span className="text-xs text-zinc-500 truncate max-w-[150px]">{op.owner}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-200"
          >
            {stages.map((stg) => {
            const opsInStg = getFilteredOps(stg);
            const colSum = opsInStg.reduce((acc, current) => acc + current.value, 0);
  
            return (
              <div
                key={stg}
                className="bg-zinc-100/60 border border-zinc-200 p-3.5 rounded-2xl shrink-0 min-w-[270px] flex flex-col justify-between shadow-xs max-w-[310px] flex-1"
              >
                {/* Column header */}
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold text-zinc-700 uppercase tracking-wider">
                        {stg}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.25 bg-zinc-200 text-zinc-650 rounded-full font-bold font-mono">
                        {opsInStg.length}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-black text-primary">
                      R$ {(colSum / 1000).toFixed(0)}k
                    </span>
                  </div>
  
                  {/* Column cards bucket */}
                  <div className="space-y-3">
                    {opsInStg.length === 0 ? (
                      /* Elegant Empty State inside individual columns */
                      <div className="flex flex-col items-center justify-center py-10 px-3 border border-dashed border-zinc-300 rounded-xl bg-white/40 text-center animate-fade-in my-1.5">
                        <FolderOpen
                          className="h-7.5 w-7.5 text-zinc-300 mb-2.5 animate-bounce"
                          style={{ animationDuration: "3.5s" }}
                        />
                        <p className="text-[10px] font-bold text-zinc-500 leading-snug">Vazio nesta Etapa</p>
                        <p className="text-[9px] text-zinc-400 mt-1 leading-snug max-w-[140px] mx-auto">
                          Nenhuma proposta na triagem comercial de {stg.toLowerCase()}.
                        </p>
                        <button
                          onClick={() => {
                            setStage(stg);
                            setIsAdding(true);
                          }}
                          className="mt-3 py-1 px-2 border border-zinc-200 bg-white hover:bg-zinc-50 text-[9px] font-mono font-bold text-zinc-600 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <Plus className="h-3 w-3 text-primary" /> Criar Proposta
                        </button>
                      </div>
                    ) : (
                      opsInStg.map((op) => {
                        const { glow, border } = getGlowAndAccent(op.stage);
                        const isHighValue = op.value >= 10000000;
                        const hasHighProbability = op.probability >= 80;
  
                        return (
                          <div
                            key={op.id}
                            onClick={() => setSelectedOportunidadeId(op.id)}
                            className={`bg-white rounded-xl p-4.5 border border-zinc-200/80 shadow-2xs transition-all duration-300 relative overflow-hidden group/card cursor-pointer ${border} ${glow}`}
                          >
                            {/* Animated "Hot Lead/Alta Probabilidade" active badge */}
                            {(isHighValue || hasHighProbability) && (
                              <div className="absolute top-2 right-2 flex items-center gap-1">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                <span className="text-[7.5px] font-black font-mono tracking-wider text-emerald-600 uppercase select-none">
                                  HOT DEAL
                                </span>
                              </div>
                            )}
  
                            {/* Top row with title and trash delete trigger */}
                            <div className="flex items-start justify-between gap-3 pr-[14px]">
                              <span className="text-xs font-bold text-zinc-850 font-sans block truncate max-w-[160px] leading-tight group-hover/card:text-primary transition-colors" title={op.title}>
                                {op.title}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteOp(op.id, op.title);
                                }}
                                className="p-1 rounded-md text-zinc-300 hover:text-rose-500 hover:bg-rose-50 cursor-pointer select-none transition-all duration-150 shrink-0 opacity-0 group-hover/card:opacity-100"
                                title="Remover oportunidade"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
  
                            {/* Client company name */}
                            <p className="text-[9.5px] text-zinc-500 font-sans mt-2.5 flex items-center gap-1.5 uppercase tracking-wide truncate">
                              <Building2 className="h-3 w-3 inline text-zinc-400 shrink-0" /> {op.client}
                            </p>
  
                            {/* Trending and Probability Indicator Row */}
                            <div className="mt-3.5 flex items-center justify-between gap-2">
                              {/* Animated system trend badge */}
                              <div className="flex items-center gap-1">
                                {op.probability >= 70 ? (
                                  <div className="flex items-center gap-1 text-[8.5px] font-bold font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                                    <TrendingUp className="h-2.5 w-2.5 animate-pulse" /> UP
                                  </div>
                                ) : op.probability <= 30 ? (
                                  <div className="flex items-center gap-1 text-[8.5px] font-bold font-mono text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                                    <TrendingDown className="h-2.5 w-2.5 animate-bounce" /> RISCO
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-[8.5px] font-bold font-mono text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded-md border border-zinc-150">
                                    <span>→ NEUTRO</span>
                                  </div>
                                )}
                              </div>
  
                              {/* Probability Value Badge */}
                              <span className={`text-[9.2px] font-mono font-extrabold px-1.5 py-0.5 rounded-md border ${getProbabilityColor(op.probability)}`}>
                                P: {op.probability}%
                              </span>
                            </div>
  
                            {/* Custom Gradient Slider for direct probability manipulation */}
                            <div className="mt-3 space-y-1">
                              <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                                <span>Sensibilidade do Funil</span>
                                <span className="font-bold">{op.probability < 50 ? "Fraca" : op.probability < 80 ? "Moderada" : "Alta"}</span>
                              </div>
                              <div className="relative group/slider pt-0.5">
                                {/* Glowing background slider */}
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={op.probability}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleProbabilityChange(op.id, parseInt(e.target.value))}
                                  className="w-full h-1 my-1.5 rounded-full appearance-none cursor-ew-resize focus:outline-hidden relative [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-zinc-300 [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-125 hover:[&::-webkit-slider-thumb]:bg-primary hover:[&::-webkit-slider-thumb]:border-primary transition-all duration-150"
                                  style={{
                                    background: `linear-gradient(to right, #f43f5e, #eab308, #10b981 ${op.probability}%, #e4e4e7 ${op.probability}%)`,
                                  }}
                                />
                              </div>
                            </div>
  
                            {/* Card Footer: Financial estimation and owner with stage advancement controls */}
                            <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-zinc-100">
                              <span className="text-[11px] font-black font-mono text-zinc-900">
                                R$ {(op.value / 1000000).toFixed(2)}M
                              </span>
  
                              {/* Easy pipeline quick controls */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-mono text-zinc-400 truncate max-w-[65px] mr-1" title={op.owner}>
                                  {op.owner.split(" ").slice(-1)[0]}
                                </span>
                                
                                <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-lg p-0.5 shadow-2xs">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveStage(op.id, "back");
                                    }}
                                    disabled={stages.indexOf(op.stage) === 0}
                                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-800 disabled:opacity-20 disabled:pointer-events-none hover:bg-white active:scale-90 transition-all cursor-pointer"
                                    title="Retornar estágio anterior"
                                  >
                                    <ChevronLeft className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      moveStage(op.id, "forward");
                                    }}
                                    disabled={stages.indexOf(op.stage) === stages.length - 1}
                                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-800 disabled:opacity-20 disabled:pointer-events-none hover:bg-white active:scale-90 transition-all cursor-pointer"
                                    title="Avançar estágio"
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
  
                {/* Column statistics summary footer */}
                <div className="mt-5 pt-3 border-t border-zinc-200/60 text-center font-mono">
                  <span className="text-[8px] tracking-widest text-zinc-400 uppercase">
                    Logística Real-Time CRM
                  </span>
                </div>
              </div>
            );
          })}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Creation Proposal Modal Wrapper with Framer Motion FadeInScale Animation */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 flex items-center justify-center z-[999]">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md cursor-pointer"
            />

             {/* Elastic scale sheet */}
            <motion.form
              onSubmit={(e) => {
                if (addMethod === "ai") {
                  e.preventDefault();
                  return;
                }
                handleSubmit(e);
              }}
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: "spring", duration: 0.45, bounce: 0.2 }}
              className={`bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full overflow-hidden font-sans relative z-10 transition-all duration-300 ${
                addMethod === "ai" ? "max-w-md" : "max-w-sm"
              }`}
            >
              {/* Modal header */}
              <div className="p-4 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
                <span className="text-xs font-bold uppercase font-mono tracking-widest flex items-center gap-1.5">
                  <Calculator className="h-4 w-4 text-amber-500 animate-pulse" /> Cadastrar Proposta CRM
                </span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer select-none"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Selector Tabs for Manual Input vs AI Extraction */}
              <div className="flex border-b border-zinc-100 bg-zinc-50/50 p-1.5">
                <button
                  type="button"
                  onClick={() => setAddMethod("manual")}
                  className={`flex-1 py-1.5 rounded-lg text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    addMethod === "manual"
                      ? "bg-white text-zinc-950 border border-zinc-200/50 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  Ficha Manual
                </button>
                <button
                  type="button"
                  onClick={() => setAddMethod("ai")}
                  className={`flex-1 py-1.5 rounded-lg text-[10.5px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    addMethod === "ai"
                      ? "bg-white text-[hsl(var(--color-primary))] border border-zinc-200/50 shadow-xs"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Extrair com IA ✨
                </button>
              </div>

              {/* Modal body */}
              <div className="p-5.5 space-y-4 text-xs text-left max-h-[80vh] overflow-y-auto">
                {addMethod === "manual" ? (
                  <>
                    <div>
                      <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1 tracking-wider">
                        Nome do Empreendimento
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-gradient-to-b from-zinc-50 to-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-hidden font-sans text-xs"
                        placeholder="Ex: Ampliação Condomínio Pinheiros"
                      />
                    </div>

                    <div>
                      <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1 tracking-wider">
                        Cliente Incorporador
                      </label>
                      <input
                        type="text"
                        required
                        value={client}
                        onChange={(e) => setClient(e.target.value)}
                        className="w-full px-3 py-2 bg-gradient-to-b from-zinc-50 to-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-hidden font-sans text-xs"
                        placeholder="Ex: Invescon S.A."
                      />
                    </div>

                    <div>
                      <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1 tracking-wider">
                        Estimativa de Financiamento (R$)
                      </label>
                      <input
                        type="number"
                        required
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-3 py-2 bg-gradient-to-b from-zinc-50 to-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-hidden font-mono text-xs"
                        placeholder="12500000"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 pt-0.5">
                      <div>
                        <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1 tracking-wider">
                          Estágio Inicial do Funil
                        </label>
                        <select
                          value={stage}
                          onChange={(e) => setStage(e.target.value as any)}
                          className="w-full px-3 py-2 bg-gradient-to-b from-zinc-50 to-white border border-zinc-200 rounded-xl cursor-pointer focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-hidden font-sans text-xs"
                        >
                          <option value="Proposta">Proposta Comercial</option>
                          <option value="Negociação">Negociação</option>
                          <option value="Apresentação">Apresentação Técnica</option>
                          <option value="Ganho">Ganho (Contratado)</option>
                          <option value="Perdido">Perdido</option>
                        </select>
                      </div>
                    </div>

                    {/* Interactive gradient slider in modal */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">
                          Probabilidade Inicial
                        </label>
                        <span className="text-[10px] font-mono font-extrabold text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                          {customProbability}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={customProbability}
                        onChange={(e) => setCustomProbability(parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-ew-resize focus:outline-hidden my-2"
                        style={{
                          background: `linear-gradient(to right, #f43f5e, #eab308, #10b981)`,
                        }}
                      />
                      <p className="text-[8.5px] text-zinc-400 font-mono text-right">
                        Arraste para calibrar a taxa de sucesso da venda
                      </p>
                    </div>

                    {/* Actions buttons */}
                    <div className="flex gap-2.5 pt-3 border-t border-zinc-100">
                      <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="flex-1 py-2 px-3 border border-zinc-200 bg-secondary text-foreground/80 hover:bg-border/30 font-bold rounded-xl transition-colors cursor-pointer select-none text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2 px-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-95 transition-all cursor-pointer text-xs shadow-xs hover:shadow-sm"
                      >
                        Sincronizar CRM
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-4">
                      {/* Description input */}
                      <div>
                        <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1 tracking-wider">
                          Detalhes do Lead ou Memorial de WhatsApp
                        </label>
                        <textarea
                          rows={4}
                          value={aiText}
                          onChange={(e) => setAiText(e.target.value)}
                          placeholder="Ex: 'Olá EVIS, temos um lead de Curitiba Construtora. O empreendimento é o Residencial Vista Alegre da Invescon. Área em torno de 4.800m², orçamento planejado de R$ 9.200.000 para começar em outubro...'"
                          className="w-full px-3 py-2 bg-gradient-to-b from-zinc-50 to-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary focus:outline-hidden font-sans text-xs resize-none leading-relaxed"
                        />
                      </div>

                      {/* Image uploader */}
                      <div>
                        <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1 tracking-wider">
                          Upload de Documento Comercial (PNG/JPG)
                        </label>
                        <div className="relative border border-dashed border-zinc-200 bg-zinc-50/50 rounded-xl p-4 transition-all hover:bg-zinc-100/50 hover:border-zinc-300 flex flex-col items-center justify-center text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setAiImageBase64((reader.result as string).split(",")[1] || null);
                                  setAiImageMimeType(file.type);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <Upload className="h-5 w-5 text-zinc-400 mb-1" />
                          <span className="text-[10px] font-semibold text-zinc-650">
                            {aiImageMimeType ? "Imagem anexada com sucesso" : "Carregar contrato ou proposta scaneada"}
                          </span>
                          <span className="text-[8px] text-zinc-400 block mt-0.5">JPEG, PNG até 5MB</span>
                          {aiImageMimeType && (
                            <span className="mt-1.5 inline-block text-[8.5px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
                              {aiImageMimeType.split("/")[1]} • Ativo
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Analyze button */}
                      <button
                        type="button"
                        onClick={async () => {
                          if (!aiText.trim() && !aiImageBase64) {
                            showToast("Insira ao menos uma mensagem de texto ou anexe uma imagem para analisar.", "error");
                            return;
                          }
                          setIsExtracting(true);
                          try {
                            const res = await fetch("/api/ai/extract-lead", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                text: aiText,
                                imageBase64: aiImageBase64,
                                mimeType: aiImageMimeType,
                              }),
                            });
                            const data = await res.json();
                            if (res.ok) {
                              setExtractedLead(data);
                              showToast("Extração concluída com sucesso! Verifique a revisão HITL.", "success");
                            } else {
                              throw new Error(data.error || "Erro de OCR");
                            }
                          } catch (err: any) {
                            showToast(`Falha na extração: ${err.message}`, "error");
                          } finally {
                            setIsExtracting(false);
                          }
                        }}
                        disabled={isExtracting}
                        className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-white font-mono font-bold text-[10.5px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isExtracting ? (
                          <>
                            <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
                            Analisando Documentos...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 text-amber-400" />
                            Mapear com Inteligência Artificial
                          </>
                        )}
                      </button>

                      {/* Review HITL Component with confidence badges */}
                      {extractedLead && (
                        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2.5 max-h-56 overflow-y-auto mt-2">
                          <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5 mb-1.5 text-[9px] font-mono font-bold uppercase text-zinc-400">
                            <span>Mapeador de Lead (HITL)</span>
                            <span className="text-[8px] bg-zinc-200 text-zinc-600 px-1.5 py-0.2 rounded leading-none shrink-0 font-extrabold uppercase">
                              {extractedLead.sourceDetails?.ocrStatus || "OK"}
                            </span>
                          </div>

                          {[
                            { label: "Proposta", field: "opportunityName", val: extractedLead.data.opportunityName },
                            { label: "Cliente", field: "customerName", val: extractedLead.data.customerName },
                            { label: "Valor Estimado", field: "budget", val: extractedLead.data.budget ? `R$ ${extractedLead.data.budget.toLocaleString("pt-BR")}` : "Não identificado" },
                            { label: "Cidade", field: "city", val: extractedLead.data.city ? `${extractedLead.data.city} - ${extractedLead.data.state || ""}` : "Não identificado" },
                            { label: "Área da Obra", field: "m2", val: extractedLead.data.m2 ? `${extractedLead.data.m2} m²` : "Não identificado" },
                            { label: "Resumo", field: "necessityDescription", val: extractedLead.data.necessityDescription },
                          ].map((x, idx) => {
                            const conf = extractedLead.confidence?.[x.field] || 0.85;
                            const pct = Math.round(conf * 100);
                            let col = "text-emerald-700 bg-emerald-50 border-emerald-100";
                            if (pct < 60) {
                              col = "text-red-700 bg-red-50 border-red-100";
                            } else if (pct < 85) {
                              col = "text-amber-700 bg-amber-50 border-amber-100";
                            }
                            return (
                              <div key={idx} className="flex flex-col gap-0.5 border-b border-zinc-150/50 pb-1.5 last:border-0 last:pb-0 text-xs">
                                <div className="flex items-center justify-between text-[8.5px] font-mono font-bold uppercase text-zinc-400">
                                  <span>{x.label}</span>
                                  <span className={`px-1 rounded font-mono text-[8.5px] font-bold ${col}`}>
                                    {pct}% Confiança
                                  </span>
                                </div>
                                <p className="text-zinc-800 font-semibold mt-0.5 truncate-2-lines">{x.val || "Pendente"}</p>
                              </div>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() => {
                              setTitle(extractedLead.data.opportunityName || "");
                              setClient(extractedLead.data.customerName || "");
                              if (extractedLead.data.budget) {
                                setValue(extractedLead.data.budget.toString());
                              }
                              setAddMethod("manual");
                              showToast("Ficha do lead comercial importada! Faça seus ajustes e envie.", "success");
                            }}
                            className="w-full mt-2 py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 hover:bg-emerald-700 transition-colors cursor-pointer select-none"
                          >
                            <span>Aplicar e Revisar Manualmente</span>
                          </button>
                        </div>
                      )}

                      {/* Footer cancel */}
                      <div className="flex gap-2.5 pt-3 border-t border-zinc-100 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAdding(false);
                            setAddMethod("manual");
                          }}
                          className="flex-1 py-1.5 border border-zinc-200 bg-secondary text-foreground/80 hover:bg-border/30 font-bold rounded-xl text-xs cursor-pointer select-none"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
