import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { 
  Bot, 
  BrainCircuit, 
  ShieldCheck, 
  ShieldAlert, 
  Wrench, 
  FileSearch, 
  LineChart, 
  Calculator, 
  Briefcase, 
  Building2, 
  Clock, 
  CalendarCheck, 
  MessageSquare, 
  ListTodo,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Info
} from "lucide-react";
import { motion } from "motion/react";

interface AgentDef {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  location: string;
  benefit: string;
  lastRecommendation?: string;
}

const agents: AgentDef[] = [
  {
    id: "ag-lia",
    name: "Lia Comercial",
    role: "CRM e Oportunidades",
    icon: Briefcase,
    location: "Módulo Oportunidades",
    benefit: "Transforma leads em oportunidades qualificadas.",
    lastRecommendation: "Este lead Residencial Kairo parece quente porque demonstrou urgência e pediu retorno rápido."
  },
  {
    id: "ag-otto",
    name: "Otto Orçamentista",
    role: "Orçamento e Escopo",
    icon: Calculator,
    location: "Módulo Obras (Orçamento)",
    benefit: "Ajuda a montar orçamentos com escopo, SINAPI, margem e lacunas.",
    lastRecommendation: "Encontrada divergência de 12% no insumo 'Aço CA-50' comparado ao padrão. Sugestão: revisar quantitativo de estacas."
  },
  {
    id: "ag-cronos",
    name: "Cronos Planejador",
    role: "Cronograma e Curva S",
    icon: Clock,
    location: "Visão Geral de Obras",
    benefit: "Prevê gargalos no cronograma e sugere replanejamento.",
    lastRecommendation: "Há desvio entre planejado e realizado. A superestrutura do 7º ao 15º pavimento está com 12 dias de atraso."
  },
  {
    id: "ag-rdo",
    name: "Diário de Obra IA",
    role: "Vistoria e Campo",
    icon: Wrench,
    location: "Módulo Obras (RDO)",
    benefit: "Transforma relatos de campo em RDOs estruturados.",
    lastRecommendation: "Transformei as ocorrências em pendências sugeridas: Faltas registradas (2)."
  },
  {
    id: "ag-nina",
    name: "Nina Compras",
    role: "Suprimentos e Cotações",
    icon: Building2,
    location: "Módulo Compras",
    benefit: "Compara fornecedores e evita compras fora do prazo ou orçamento.",
    lastRecommendation: "Fornecedor 'Votorantim' possui melhor margem. Há também uma Compra Crítica iminente (Aço Estrutural CA-50)."
  },
  {
    id: "ag-radar",
    name: "Radar de Insumos",
    role: "Estoque e Preços",
    icon: LineChart,
    location: "Módulo Compras (Radar)",
    benefit: "Detecta ruptura, sobreconsumo e variação de preço.",
    lastRecommendation: "O consumo de Aço Estrutural CA-50 12mm está acima do previsto. Há risco de ruptura."
  },
  {
    id: "ag-vera",
    name: "Vera Financeira",
    role: "Fluxo de Caixa e DRE",
    icon: LineChart,
    location: "Módulo Financeiro",
    benefit: "Monitora caixa, despesas, receitas e DRE da obra.",
    lastRecommendation: "O caixa projetado fica pressionado neste período. Esta despesa pode comprometer a margem."
  },
  {
    id: "ag-auditor",
    name: "Auditor de Margem",
    role: "Rentabilidade",
    icon: ShieldCheck,
    location: "Painel Financeiro",
    benefit: "Identifica perda de margem e causas prováveis.",
    lastRecommendation: "A margem caiu por aumento de custo nesta categoria. Há indícios de escopo extra sem aditivo."
  },
  {
    id: "ag-dora",
    name: "Dora Documentos",
    role: "Workspace e Acervo",
    icon: FileSearch,
    location: "Workspace (Drive AI)",
    benefit: "Classifica documentos e aponta pendências.",
    lastRecommendation: "Classificação sugerida (4 novos anexos da prefeitura). Revise antes de confirmar."
  },
  {
    id: "ag-agenda",
    name: "Agenda Inteligente",
    role: "Follow-ups",
    icon: CalendarCheck,
    location: "Workspace (Agenda AI)",
    benefit: "Organiza vistorias, reuniões e follow-ups.",
    lastRecommendation: "Este follow-up está vencido. Há conflito entre compromissos (Residencial Kairo)."
  },
  {
    id: "ag-eva",
    name: "EVA Executiva",
    role: "Painel Diretoria",
    icon: BrainCircuit,
    location: "Dashboard Principal",
    benefit: "Resume prioridades, riscos e decisões do dia.",
    lastRecommendation: "Estas são as três decisões mais importantes agora. Há risco financeiro concentrado (Residencial Kairo)."
  },
  {
    id: "ag-sentinela",
    name: "Sentinela de Riscos",
    role: "Alertas Transversais",
    icon: ShieldAlert,
    location: "Alertas Globais",
    benefit: "Cruza módulos e alerta riscos críticos antes do prejuízo.",
    lastRecommendation: "Risco crítico: impacto alto em prazo e margem. A evidência vem de múltiplos módulos."
  },
  {
    id: "ag-maestro",
    name: "Maestro Operacional",
    role: "Orquestração (Gatekeeper)",
    icon: MessageSquare,
    location: "Chat Global",
    benefit: "Roteia pedidos para o agente certo e preserva contexto.",
    lastRecommendation: "Delego a tarefa ao agente especializado correto garantindo o handoff de contexto."
  },
  {
    id: "ag-automador",
    name: "Automador EVIS",
    role: "Rotinas e Checklists",
    icon: ListTodo,
    location: "Módulo de Tarefas",
    benefit: "Cria lembretes, checklists e rotinas reversíveis.",
    lastRecommendation: "Encontrei atividades sistemáticas. Deseja que eu acione alertas automáticos via disparo de WhatsApp?"
  }
];

type PlanType = "Essencial" | "Profissional" | "Premium";

export default function MapaAgentesView() {
  const { isWhatsAppOpen } = useApp();
  const [currentPlan, setCurrentPlan] = useState<PlanType>("Profissional");
  const [filter, setFilter] = useState<"Todos" | "Ativos" | "Disponíveis" | "Bloqueados">("Todos");

  const getAgentStatus = (agentId: string, plan: PlanType): "Ativo" | "Incluído no Premium" | "Add-on disponível" | "Bloqueado no plano atual" => {
    if (plan === "Premium") return "Incluído no Premium";
    const essencialLiberados = ["ag-lia", "ag-eva", "ag-maestro"];
    const profissionalLiberados = ["ag-lia", "ag-otto", "ag-rdo", "ag-eva", "ag-maestro", "ag-agenda", "ag-dora"];
    
    if (plan === "Essencial") {
      return essencialLiberados.includes(agentId) ? "Ativo" : "Bloqueado no plano atual";
    }
    
    if (plan === "Profissional") {
      return profissionalLiberados.includes(agentId) ? "Ativo" : "Add-on disponível";
    }
    
    return "Ativo";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
      case "Incluído no Premium": return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800/50";
      case "Add-on disponível": return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
      case "Bloqueado no plano atual": return "bg-slate-100 text-slate-500 border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
      default: return "bg-slate-100 text-slate-500 border-slate-200";
    }
  };

  const getStatusIconColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400";
      case "Incluído no Premium": return "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400";
      case "Add-on disponível": return "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400";
      case "Bloqueado no plano atual": return "bg-slate-100 text-slate-500 dark:bg-zinc-800";
      default: return "";
    }
  };

  const filteredAgents = filter === "Todos" 
    ? agents 
    : agents.filter(a => {
        const s = getAgentStatus(a.id, currentPlan);
        if (filter === "Ativos") return s === "Ativo" || s === "Incluído no Premium";
        if (filter === "Disponíveis") return s === "Add-on disponível";
        if (filter === "Bloqueados") return s === "Bloqueado no plano atual";
        return true;
      });

  const activeCount = agents.filter(a => {
    const s = getAgentStatus(a.id, currentPlan);
    return s === "Ativo" || s === "Incluído no Premium";
  }).length;

  return (
    <div className={`p-6 ${isWhatsAppOpen ? 'md:pr-[400px]' : ''} transition-all duration-300 relative min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans`}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Bot className="h-6 w-6 text-purple-600" /> Central de Agentes EVIS
          </h1>
          <p className="text-zinc-500 font-medium text-sm mt-1">
            Status do ecossistema de Inteligência Artificial e módulos autônomos.
          </p>
        </div>

        {/* Commercial Banner & Plan Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-200 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Monte sua equipe de IA para gestão de obras.</h2>
              <p className="text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
                Cada agente atua em uma área da operação. No Premium, todos trabalham integrados para antecipar riscos, organizar rotinas e apoiar decisões.
              </p>
            </div>
            
            <div className="bg-slate-800 p-1.5 rounded-lg flex items-center shrink-0 border border-slate-700 shadow-sm">
               {["Essencial", "Profissional", "Premium"].map(p => (
                 <button
                   key={p}
                   onClick={() => setCurrentPlan(p as PlanType)}
                   className={`px-4 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all cursor-pointer ${currentPlan === p ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                 >
                   {p}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-700/80 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2 bg-blue-900/20 text-blue-300 border border-blue-800/30 px-3 py-1.5 rounded text-[11px]">
              <Info className="h-3.5 w-3.5 shrink-0" />
              <span>
                Ambiente simulado: a IA recomenda, o humano confirma e <strong className="text-blue-100">nenhuma ação real é executada</strong> nesta fase.
              </span>
            </div>
            <div className="text-[11px] font-mono font-bold text-indigo-200 bg-indigo-900/30 px-3 py-1.5 rounded border border-indigo-800/50">
              Plano {currentPlan} — {activeCount} agentes ativos de {agents.length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1 shadow-sm w-fit">
          {["Todos", "Ativos", "Disponíveis", "Bloqueados"].map(opt => (
            <button
              key={opt}
              onClick={() => setFilter(opt as any)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                filter === opt 
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAgents.map((agent, i) => {
            const status = getAgentStatus(agent.id, currentPlan);
            const isBlocked = status === "Bloqueado no plano atual";
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                key={agent.id}
                className={`bg-white dark:bg-zinc-900 border ${isBlocked ? 'border-zinc-200 dark:border-zinc-800/40 opacity-75' : 'border-zinc-200 dark:border-zinc-800/80'} rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col`}
              >
                {/* Card Header */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex justify-between items-start">
                  <div className={`p-2 rounded-lg ${getStatusIconColor(status)}`}>
                    <agent.icon className="h-5 w-5" />
                  </div>
                  <div className={`flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${getStatusColor(status)}`}>
                    {status === "Ativo" && <CheckCircle2 className="h-3 w-3" />}
                    {(status === "Add-on disponível" || status === "Incluído no Premium") && <Sparkles className="h-3 w-3" />}
                    {status === "Bloqueado no plano atual" && <AlertTriangle className="h-3 w-3" />}
                    {status}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {agent.name}
                  </h3>
                  <p className="text-[11px] font-mono font-medium text-zinc-500 dark:text-zinc-400 mt-1 mb-3">{agent.role}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Visão / Benefício</p>
                      <p className="text-[11.5px] font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
                        {agent.benefit}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Onde atua</p>
                      <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-900/10 px-2 py-1 rounded inline-block">
                        {agent.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Last Recommendation & Buttons */}
                <div className="mt-auto">
                  {agent.lastRecommendation && !isBlocked && (
                    <div className="p-3 bg-slate-50 dark:bg-zinc-800/30 border-t border-slate-100 dark:border-zinc-800/80">
                      <p className="text-[9px] text-zinc-500 font-bold tracking-wider uppercase mb-1 flex items-center gap-1">
                         <Sparkles className="h-2.5 w-2.5" /> Exemplo de Resposta
                      </p>
                      <p className="text-[10px] leading-relaxed font-medium text-zinc-600 dark:text-zinc-400 italic">
                        "{agent.lastRecommendation}"
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-white dark:bg-zinc-900 flex gap-2 border-t border-slate-100 dark:border-zinc-800">
                     {status === "Ativo" || status === "Incluído no Premium" ? (
                       <>
                         <button onClick={() => alert("Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.")} className="flex-1 bg-white hover:bg-zinc-50 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] font-bold py-1.5 rounded transition-colors shadow-sm cursor-pointer">
                           Ver contexto
                         </button>
                         <button onClick={() => alert('Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 rounded transition-colors shadow-sm cursor-pointer">
                           Simular ação
                         </button>
                       </>
                     ) : status === "Add-on disponível" ? (
                       <button onClick={() => alert("Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.")} className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800/40 text-amber-800 dark:text-amber-400 text-[10px] uppercase tracking-wider font-bold py-1.5 rounded transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1">
                         <Sparkles className="h-3 w-3" /> Ativar Add-on
                       </button>
                     ) : (
                       <button onClick={() => alert("Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.")} className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-zinc-800 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-[10px] uppercase tracking-wider font-bold py-1.5 rounded transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1">
                         Fazer Upgrade
                       </button>
                     )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </div>
  );
}
