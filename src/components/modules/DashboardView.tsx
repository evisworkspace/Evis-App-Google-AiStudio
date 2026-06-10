import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  TrendingUp,
  HardHat,
  Briefcase,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  CloudSun,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ClipboardList,
  Building,
  Activity,
  ArrowUp,
  X,
  Calendar,
  Flag,
  ShieldAlert,
  Bot
} from "lucide-react";

import { getAgentProfileByRole } from "../../utils/agentesConfig";

const AgentIcon = ({ role, className }: { role: string, className?: string }) => {
  const profile = getAgentProfileByRole(role);
  return React.createElement(profile.icon, { className: className || "h-4 w-4" });
};



// Micro-component to smoothly count up to values
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [current, setCurrent] = useState(value * 0.4);

  useEffect(() => {
    let start = value * 0.4;
    const end = value;
    if (Math.abs(end - start) < 1) {
      setCurrent(end);
      return;
    }
    const duration = 900;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCurrent(end);
      } else {
        setCurrent(start);
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {value % 1 === 0 ? Math.floor(current).toLocaleString("pt-BR") : current.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      {suffix}
    </span>
  );
}

export default function DashboardView() {
  const { obras, oportunidades, lancamentos, tasks, addLancamento, showToast } = useApp();
  const [logHoursOpen, setLogHoursOpen] = useState(false);
  const [selectedTaskForHours, setSelectedTaskForHours] = useState<any>(null);
  const [loggedHours, setLoggedHours] = useState("2");
  const [isFinanceLoading, setIsFinanceLoading] = useState(false);

  interface Milestone {
    id: string;
    obraId: string;
    obraName: string;
    title: string;
    date: string;
    status: "Pending" | "In Progress" | "Delayed";
    description: string;
  }

  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: "ms_1",
      obraId: "ob_1",
      obraName: "Residencial Belle Vue",
      title: "Concretagem de Laje Máxima",
      date: "2026-06-15",
      status: "In Progress",
      description: "Lançamento e cura de concreto usinado FCK 30 no 13º pavimento."
    },
    {
      id: "ms_2",
      obraId: "ob_1",
      obraName: "Residencial Belle Vue",
      title: "Instalação de Esquadrias e Vidros",
      date: "2026-07-20",
      status: "Pending",
      description: "Montagem dos perfis de alumínio e vedação interna."
    },
    {
      id: "ms_3",
      obraId: "ob_2",
      obraName: "Residencial Kairo",
      title: "Escavação SAP_04 Consolidação",
      date: "2026-06-10",
      status: "Delayed",
      description: "Trabalho paralisado em decorrência do excesso de umidade no solo."
    },
    {
      id: "ms_4",
      obraId: "ob_2",
      obraName: "Residencial Kairo",
      title: "Entrega do Projeto Hidrossanitário",
      date: "2026-06-25",
      status: "In Progress",
      description: "Liberação de desenhos técnicos das prumadas Hidráulicas."
    },
    {
      id: "ms_5",
      obraId: "ob_3",
      obraName: "Smart Tower Corporate",
      title: "Instalação do Canteiro Primário",
      date: "2026-06-08",
      status: "In Progress",
      description: "Montagem de alojamentos, tapumes e infraestrutura elétrica provisória."
    },
    {
      id: "ms_6",
      obraId: "ob_3",
      obraName: "Smart Tower Corporate",
      title: "Fundações Profundas Hélice",
      date: "2026-07-15",
      status: "Pending",
      description: "Mobilização de perfuratrizes rotativas de alta capacidade."
    }
  ]);

  const [filteredObraId, setFilteredObraId] = useState<string>("all");

  const cycleMilestoneStatus = (id: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id === id) {
        let nextStatus: "Pending" | "In Progress" | "Delayed";
        if (m.status === "Pending") nextStatus = "In Progress";
        else if (m.status === "In Progress") nextStatus = "Delayed";
        else nextStatus = "Pending";
        
        showToast(`Status de "${m.title}" atualizado para: ${
          nextStatus === "Pending" ? "Pendente" : nextStatus === "In Progress" ? "Em Progresso" : "Atrasado"
        }`, "success");
        return { ...m, status: nextStatus };
      }
      return m;
    }));
  };

  const filteredMilestones = filteredObraId === "all" 
    ? milestones 
    : milestones.filter(m => m.obraId === filteredObraId);

  // Auto trigger a quick simulated shimmer animation for UX showcase on component mount
  useEffect(() => {
    setIsFinanceLoading(true);
    const t = setTimeout(() => {
      setIsFinanceLoading(false);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  // Sum finances
  const totalBudget = obras.reduce((acc, o) => acc + o.budgetTotal, 0);
  const totalSpent = obras.reduce((acc, o) => acc + o.budgetSpent, 0);
  const globalProgress = obras.length > 0 ? Math.round(obras.reduce((acc, o) => acc + o.progress, 0) / obras.length) : 0;

  // Filter urgent tasks
  const urgentTasks = tasks.filter((t) => t.priority === "Alta" && t.status !== "Concluido");

  // Recent transactions
  const recentTransactions = lancamentos.slice(0, 4);

  const openMaestro = (agentRole: string) => {
    window.dispatchEvent(new CustomEvent("open-maestro", { detail: { agentRole } }));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Alert Header - Curitiba Civil Specific weather indicator */}
      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shrink-0 mt-0.5 shadow-[0_2px_8px_rgba(43,91,156,0.2)]">
            <CloudSun className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-primary">
              Operação Climática & Condições de Concretagem — Curitiba/PR
            </h4>
            <p className="text-[11px] text-muted leading-relaxed mt-0.5 max-w-2xl font-sans">
              Tempo parcialmente nublado com umidade relativa do ar em <span className="font-bold text-foreground">78%</span>. Recomendações de aditivos retardadores recomendáveis para a concretagem das lajes do <span className="font-bold text-foreground">Residencial Belle Vue</span>. Risco de garoa isolada à noite de <span className="font-bold text-foreground">25%</span>.
            </p>
          </div>
        </div>
        <div className="px-3 py-1.5 bg-[hsl(var(--color-card))]/50 backdrop-blur border border-blue-200/50 rounded-md shrink-0 flex items-center gap-1.5 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-success animate-ping"></span>
          <span className="text-[10px] font-mono font-bold text-primary">Canteiros Estáveis</span>
        </div>
      </div>

      {/* Mensagem Recebida: Sentinela de Riscos */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-red-500"></div>
        <div className="h-10 w-10 shrink-0 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center border border-red-200 dark:border-red-900/50 shadow-sm">
          <AgentIcon role="Sentinela de Riscos" className="h-5 w-5" />
        </div>
        <div className="flex-1 w-full min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">Sentinela</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Sentinela de Riscos</span>
              <span className="text-[8px] bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 font-bold px-1.5 py-0.5 rounded uppercase uppercase ml-1">
                Crítico
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">14:22</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase border border-zinc-200 dark:border-zinc-700">
              Escopo: Portfólio Global
            </span>
          </div>
          <p className="text-[12px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium mb-3">
            Detectei risco crítico no <strong>Batel Tower</strong>. Emissão frequente de SC para Aço CA-50 está superando os volumes do SINAPI. Impacto alto estimado em prazo e margem.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => openMaestro("Sentinela")}
              className="text-[10px] uppercase font-bold bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              Abrir Conversa <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Mensagem Recebida: EVA Executiva */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-500"></div>
        <div className="h-10 w-10 shrink-0 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-200 dark:border-indigo-900/50 shadow-sm">
          <AgentIcon role="EVA Executiva" className="h-5 w-5" />
        </div>
        <div className="flex-1 w-full min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">EVA</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">EVA Executiva</span>
              <span className="text-[8px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded uppercase uppercase ml-1">
                Atenção
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">08:00</span>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase border border-zinc-200 dark:border-zinc-700">
              Escopo: Portfólio Global
            </span>
          </div>
          <p className="text-[12px] text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium mb-3">
            Aqui está o resumo do dia. Existem 3 decisões operacionais pendentes e 1 conflito de agenda afetando as frentes de serviço. Notei risco financeiro concentrado no <strong>Residencial Kairo</strong>.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => openMaestro("EVA")}
              className="text-[10px] uppercase font-bold bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              Abrir Conversa <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Widgets Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Orçamento Global */}
        <div className="bg-white border border-border rounded-lg relative overflow-hidden group p-5 shadow-sm">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-muted uppercase font-bold block">
                Orçamento Geral Portfólio
              </span>
              <span className="mt-1 inline-block p-1 px-1.5 bg-primary/10 border border-primary/20 rounded text-[9px] font-mono font-bold text-primary">
                Meta U-2026
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="text-xl font-mono font-bold text-foreground mt-4 leading-none">
            R$ <AnimatedNumber value={totalBudget} />
          </p>
          <div className="flex items-center gap-2 mt-3.5 border-t border-border/40 pt-2.5">
            <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +12.4%
            </span>
            <span className="text-[9px] text-muted truncate">Aprovações consolidadas</span>
          </div>
        </div>

        {/* KPI: Gasto Executado */}
        <div className="bg-white border border-border rounded-lg relative overflow-hidden group p-5 shadow-sm">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-muted uppercase font-bold block">
                Desembolso Acumulado Real
              </span>
              <span className="mt-1 inline-block p-1 px-1.5 bg-destructive/10 border border-destructive/20 rounded text-[9px] font-mono font-bold text-destructive">
                ALERTA CRÍTICO
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <ArrowDownLeft className="h-5 w-5 text-destructive" />
            </div>
          </div>
          <p className="text-xl font-mono font-bold text-foreground mt-4 leading-none">
            R$ <AnimatedNumber value={totalSpent} />
          </p>
          <div className="flex items-center gap-2 mt-3.5 border-t border-border/40 pt-2.5 text-[10px]">
            <span className="text-[9px] font-mono bg-destructive text-white rounded px-1.5 py-0.5 font-bold">
              {Math.round((totalSpent / totalBudget) * 100)}% Consumido
            </span>
            <span className="text-[9px] text-muted truncate font-semibold">R$ {(totalBudget - totalSpent).toLocaleString()} Restantes</span>
          </div>
        </div>

        {/* KPI: Progresso Físico Médio */}
        <div className="bg-white border border-border rounded-lg relative overflow-hidden group p-5 shadow-sm">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-muted uppercase font-bold block">
                Média Progresso Físico
              </span>
              <span className="mt-1 inline-block p-1 px-1.5 bg-accent/25 border border-accent/40 rounded text-[9px] font-mono font-bold text-accent">
                Curva S Geral
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Layers className="h-5 w-5 text-accent" />
            </div>
          </div>
          <p className="text-xl font-mono font-bold text-foreground mt-4 leading-none flex items-baseline gap-1">
            <AnimatedNumber value={globalProgress} />% <span className="text-[10px] text-muted normal-case font-normal font-sans">Média Ponderada</span>
          </p>
          {/* Simple progress pill */}
          <div className="w-full bg-secondary h-2.5 rounded-full mt-4 overflow-hidden border border-border/50">
            <div
              className="bg-primary h-full rounded-full transition-all duration-1000"
              style={{ width: `${globalProgress}%` }}
            ></div>
          </div>
        </div>

        {/* KPI: Oportunidades do Funil */}
        <div className="bg-white border border-border rounded-lg relative overflow-hidden group p-5 shadow-sm">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="text-[10px] font-mono tracking-wider text-muted uppercase font-bold block">
                Funil de Novos Contratos
              </span>
              <span className="mt-1 inline-block p-1 px-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] font-mono font-bold text-emerald-500">
                LÍQUIDOS GANHOS
              </span>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-xl font-mono font-bold text-foreground mt-4 leading-none">
            R$ <AnimatedNumber value={oportunidades.reduce((acc, o) => acc + (o.stage !== "Perdido" ? o.value : 0), 0)} />
          </p>
          <div className="flex items-center gap-1.5 mt-3.5 border-t border-border/40 pt-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[9px] text-muted font-sans font-medium">
              <span className="font-bold text-zinc-900">{oportunidades.filter((o) => o.stage === "Negociação").length}</span> propostas em fase final de fechamento.
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable Construction Milestone Timeline Component */}
      <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3.5 mb-5">
          <div>
            <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-foreground flex items-center gap-1.5 leading-none">
              <Flag className="h-4 w-4 text-primary animate-pulse" /> Cronograma de Marcos Próximos (Milestones)
            </h3>
            <p className="text-[10px] text-muted font-sans mt-1">
              Calendário de marcos críticos das obras sob gestão. Clique em qualquer status para atualizar o canteiro.
            </p>
          </div>
          
          {/* Canteiros filter pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilteredObraId("all")}
              className={`px-2.5 py-1 text-[9.5px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                filteredObraId === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary text-muted hover:bg-border/40 hover:text-foreground"
              }`}
            >
              Todos os Marcos
            </button>
            {obras.map(o => (
              <button
                key={o.id}
                onClick={() => setFilteredObraId(o.id)}
                className={`px-2.5 py-1 text-[9.5px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                  filteredObraId === o.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-secondary text-muted hover:bg-border/40 hover:text-foreground"
                }`}
              >
                {o.name.replace("Residencial ", "").replace(" Smart Tower", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal scroll content container */}
        <div className="relative">
          <div className="overflow-x-auto flex gap-4 pb-3 pt-6 px-1.5 scrollbar-thin scrollbar-thumb-zinc-200 hover:scrollbar-thumb-zinc-300 scrollbar-track-transparent">
            {filteredMilestones.length === 0 ? (
              <div className="py-6 text-center text-zinc-400 w-full text-xs font-sans">
                Nenhum marco programado para o canteiro selecionado.
              </div>
            ) : (
              <div className="flex gap-4 pr-4 relative min-w-full">
                {/* Horizontal dash connecting path representing timeline */}
                <div className="absolute top-[3px] left-6 right-6 h-0.5 border-t border-dashed border-zinc-200 -z-0" />
                
                {filteredMilestones.map((m, idx) => {
                  let statusLabel = "Pendente";
                  let statusStyle = "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15";
                  let dotColor = "bg-amber-500 ring-amber-500/25";

                  if (m.status === "In Progress") {
                    statusLabel = "Em Progresso";
                    statusStyle = "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/15";
                    dotColor = "bg-blue-500 ring-blue-500/25";
                  } else if (m.status === "Delayed") {
                    statusLabel = "Atrasado";
                    statusStyle = "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/15";
                    dotColor = "bg-rose-500 ring-rose-500/25";
                  }

                  return (
                    <div
                      key={m.id}
                      className="relative bg-[hsl(var(--color-card))] backdrop-blur-md border border-[hsl(var(--color-border))] hover:border-primary/40 rounded-xl p-4 min-w-[280px] max-w-[300px] flex-1 flex flex-col justify-between hover:shadow-lg hover:shadow-black/[0.04] hover:-translate-y-0.5 transition-all duration-200 group z-10"
                    >
                      {/* Timeline Dot seated right on the horizontal connector */}
                      <div className="absolute -top-[19px] left-6 z-25 flex items-center justify-center">
                        <span className={`h-2.5 w-2.5 rounded-full ring-4 ${dotColor} bg-[hsl(var(--color-card))] transition-all group-hover:scale-125`} />
                      </div>

                      <div>
                        <div className="flex items-center justify-between gap-3 mb-2.5">
                          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wide truncate max-w-[140px]" title={m.obraName}>
                            {m.obraName}
                          </span>
                          <button
                            onClick={() => cycleMilestoneStatus(m.id)}
                            className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold border cursor-pointer select-none transition-colors duration-150 active:scale-95 ${statusStyle}`}
                            title="Clique para alternar o status do marco"
                          >
                            {statusLabel}
                          </button>
                        </div>

                        <h4 className="text-xs font-bold text-zinc-800 font-sans tracking-tight leading-snug group-hover:text-primary transition-colors flex items-center gap-1.5">
                          <Flag className="h-3 w-3 text-zinc-400 shrink-0" />
                          {m.title}
                        </h4>
                        
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-sans mt-2 line-clamp-2">
                          {m.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span className="flex items-center gap-1 font-semibold text-zinc-500">
                          <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          {new Date(m.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        
                        <span className="text-[9px] text-zinc-400 font-mono group-hover:translate-x-0.5 transition-transform duration-200">
                          M-{idx + 1} →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* General urgent Tasks Action Board */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-border rounded-lg p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <ClipboardList className="h-4.5 w-4.5 text-warning" /> Tarefas Urgentes
              </h3>
              <span className="bg-amber-50 text-amber-600 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">
                Eng. Berti
              </span>
            </div>

            <div className="space-y-3.5 mt-4">
              {urgentTasks.map((t) => (
                <div key={t.id} className="p-3 bg-zinc-50 hover:bg-zinc-100/60 rounded-md border border-zinc-150 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1 rounded uppercase">
                      PRIORIDADE ALTA
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono">Prazo: {t.dueDate}</span>
                  </div>
                  <p className="text-xs font-semibold text-zinc-800 font-sans mt-2">
                    {t.title}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-zinc-500">Logado: <span className="font-mono font-semibold text-zinc-800">{t.loggedHours || 0}h</span></span>
                    
                    <button
                      onClick={() => {
                        setSelectedTaskForHours(t);
                        setLogHoursOpen(true);
                      }}
                      className="px-2 py-1 bg-[hsl(var(--color-card))]/50 backdrop-blur border border-[hsl(var(--color-border))] hover:bg-secondary rounded text-[9.5px] font-semibold text-foreground cursor-pointer flex items-center gap-1"
                    >
                      <Play className="h-2.5 w-2.5 text-zinc-500" /> Lançar Horas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-100 pt-3 mt-4 text-center">
            <span className="text-[10px] text-zinc-400 leading-snug">
              Engenharia reportando com média de <span className="font-bold text-zinc-900">14.2h</span>/semana por canteiro.
            </span>
          </div>
        </div>
      </div>

      {/* Financial Ledger Log preview and Recent Activities block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recents Accounting Table */}
        <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4.5">
            <div className="flex-1">
              <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-foreground flex items-center gap-1.5 leading-none">
                Últimos Lançamentos Financeiros
              </h3>
              <p className="text-[10px] text-muted font-sans mt-1">
                Visão imediata de conciliação bancária e compras faturadas.
              </p>
            </div>
            <button
              onClick={() => {
                setIsFinanceLoading(true);
                setTimeout(() => setIsFinanceLoading(false), 1200);
              }}
              className="px-2 py-1 bg-[hsl(var(--color-card))] backdrop-blur border border-[hsl(var(--color-border))] hover:bg-secondary rounded-md text-[10px] font-semibold text-foreground cursor-pointer flex items-center gap-1 transition-colors shadow-sm"
              title="Simular Carregamento"
            >
              <RotateCcw className={`h-3 w-3 ${isFinanceLoading ? "animate-spin" : ""}`} />
              Sincronizar
            </button>
          </div>

          <div className="overflow-x-auto mt-4 rounded-lg border border-border">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th className="text-right">Valor</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {isFinanceLoading ? (
                  Array.from({ length: 4 }).map((_, n) => (
                    <tr key={n} className="animate-pulse">
                      <td className="py-3">
                        <div className="h-3.5 bg-border/60 rounded-full w-40 mb-1.5 animate-shimmer-bg"></div>
                        <div className="h-2 bg-border/40 rounded-full w-20 animate-shimmer-bg"></div>
                      </td>
                      <td className="py-3">
                        <div className="h-3 bg-border/50 rounded-full w-14 animate-shimmer-bg"></div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="h-3.5 bg-border/50 rounded-full w-16 ml-auto animate-shimmer-bg"></div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="h-4.5 bg-border/40 rounded-full w-14 mx-auto animate-shimmer-bg"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  recentTransactions.map((lt) => (
                    <tr key={lt.id} className="transition-all duration-200 hover:bg-secondary/40 hover:translate-x-1 hover:shadow-xs group">
                      <td className="py-2.5">
                        <span className="text-xs text-foreground font-sans font-medium block truncate max-w-[200px]">
                          {lt.description}
                        </span>
                        <span className="text-[9px] font-mono text-muted mt-0.5 block">{lt.date}</span>
                      </td>
                      <td className="py-2.5 text-[10px] text-muted font-mono">{lt.category}</td>
                      <td className={`py-2.5 text-xs font-bold text-right font-mono ${
                        lt.type === "receita" ? "text-emerald-500" : "text-rose-500"
                      }`}>
                        {lt.type === "receita" ? "+" : "-"} R$ {lt.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold font-mono rounded-full ${
                          lt.status === "Realizado" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-warning/10 text-warning border border-warning/20"
                        }`}>
                          <span className={`h-1 w-1 rounded-full mr-1 ${lt.status === "Realizado" ? "bg-emerald-500" : "bg-warning"}`}></span>
                          {lt.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Project operational summary table */}
        <div className="bg-white border border-border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4.5">
            <div>
              <h3 className="text-xs font-bold font-heading uppercase tracking-wider text-foreground">
                Resumo Operacional dos Portfólios
              </h3>
              <p className="text-[10px] text-muted font-sans mt-0.5">
                Métricas integradas de pessoal técnico e de campo.
              </p>
            </div>
            <span className="px-2 py-0.5 border border-zinc-200 rounded text-[9px] font-mono font-bold text-zinc-500 uppercase bg-zinc-55">
              Canteiragem Ativa
            </span>
          </div>

          <div className="space-y-4">
            {obras.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-4 p-3 bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-100 rounded-md transition-colors">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-850 font-sans">{o.name}</h4>
                  <span className="text-[10px] text-zinc-400 font-mono">{o.location}</span>
                </div>
                
                <div className="flex items-center gap-6 text-rightshrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase">Mão de Obra</span>
                    <span className="text-xs font-semibold text-zinc-800 font-sans">
                      {o.equipe.length * 15 + (o.id === "ob_1" ? 42 : 22)} colaboradores
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase">Aproveitamento</span>
                    <span className="text-xs font-mono font-bold text-[hsl(var(--color-primary))] block">
                      {o.progress}% Físico
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Logs Hours Drawer Widget */}
      {logHoursOpen && selectedTaskForHours && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-55 animate-fade-in border-none">
          <div className="bg-[hsl(var(--color-card))] backdrop-blur-2xl border border-[hsl(var(--color-border))] rounded-xl w-full max-w-sm overflow-hidden font-sans p-0 animate-fade-in-scale shadow-2xl">
            <div className="p-4 bg-secondary text-foreground flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase font-heading tracking-wider">Apropriar Horas de Engenharia</span>
              </div>
              <button 
                onClick={() => setLogHoursOpen(false)} 
                className="text-muted hover:text-foreground cursor-pointer select-none font-bold p-1 rounded-md hover:bg-secondary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-muted block uppercase leading-none">Tarefa Ativa</span>
                <p className="text-xs font-semibold text-foreground font-sans mt-2">{selectedTaskForHours.title}</p>
                <p className="text-[10px] text-muted font-sans mt-1">Obra associada: {obras.find(o => o.id === selectedTaskForHours.project)?.name}</p>
              </div>
 
              <div>
                <label className="text-[10px] font-mono font-bold text-muted block uppercase mb-1.5">Mão de Obra Alocada (Horas)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={loggedHours}
                    onChange={(e) => setLoggedHours(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-border bg-secondary rounded text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-hidden"
                    placeholder="2.5"
                    step="0.5"
                  />
                  <span className="px-3 bg-secondary border border-border text-foreground/80 rounded flex items-center text-xs font-sans font-medium">HS</span>
                </div>
                <p className="text-[9px] text-muted mt-1 font-mono leading-relaxed">
                  As horas inseridas serão adicionadas no registro de apropriação e somadas ao diário técnico (RDO) da obra.
                </p>
              </div>
 
              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setLogHoursOpen(false)}
                  className="flex-1 py-2 border border-border bg-secondary hover:bg-border/40 font-sans font-semibold text-xs text-foreground/80 rounded cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    showToast("Em desenvolvimento", "info");
                    setLogHoursOpen(false);
                  }}
                  className="flex-1 py-2 bg-primary text-primary-foreground hover:opacity-90 font-sans font-semibold text-xs rounded cursor-pointer transition-all"
                >
                  Apropriar Registro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
