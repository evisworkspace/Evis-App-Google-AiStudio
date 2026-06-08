import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, User, Send, X, MessageSquare, CornerDownLeft, Sparkles, Building2, 
  AlertTriangle, ShieldCheck, CheckCircle2, FileText, Info, ArrowLeft, 
  Briefcase, ShieldAlert, Users, Calculator, Clock, ClipboardList, 
  ShoppingCart, Boxes, DollarSign, PieChart, Calendar, Zap, Circle
} from "lucide-react";
import { useApp } from "../../context/AppContext";

import { getAgentProfile } from "../../utils/agentesConfig";

export type AgentMessageStatus = "nova" | "lida" | "pendente" | "resolvida" | "simulada";
export type ChatScope = "Global" | "Obra";

export interface AgentMessage {
  id: string;
  agentId: string;
  agentName: string;
  agentRole: string;
  obraId?: string;
  obraName?: string;
  scope: ChatScope;
  module: string;
  severity: "info" | "warning" | "critical" | "success";
  title: string;
  message: string;
  evidence?: string[];
  suggestedActions: { label: string; actionStr: string; type: "primary" | "secondary" }[];
  requiresHumanApproval: boolean;
  status: AgentMessageStatus;
  createdAt: string;
  isUser?: boolean;
}

export default function EvisChat() {
  const { getActiveProject, setCurrentRoute, setSelectedProjectId, activeRoute, showToast } = useApp();
  const activeProj = getActiveProject();

  const [isOpen, setIsOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  const [agentMessages, setAgentMessages] = useState<AgentMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);


  // Carrega mensagens simuladas apenas uma vez para a obra ativa
  useEffect(() => {
    const initialMessages: AgentMessage[] = [
      // MENSAGENS GLOBAIS / PORTFOLIO
      {
        id: `msg_global_eva`,
        agentId: "ag-eva",
        agentName: "EVA",
        agentRole: "EVA Executiva",
        scope: "Global",
        module: "Resumo",
        severity: "info",
        title: "Resumo do Portfólio",
        message: "O projeto Residencial Kairo concentra o maior nível de risco operacional hoje. Tenho 3 decisões aguardando sua chancela.",
        suggestedActions: [
          { label: "Ver decisões globais", actionStr: "ver_decisoes", type: "primary" }
        ],
        requiresHumanApproval: false,
        status: "nova",
        createdAt: "08:00"
      },
      {
        id: `msg_global_sentinela`,
        agentId: "ag-sentinela",
        agentName: "Sentinela",
        agentRole: "Sentinela de Riscos",
        scope: "Global",
        module: "Riscos",
        severity: "critical",
        title: "Risco Detalhado - Batel Tower",
        message: "Houve emissão atípica de SC para Aço CA-50 no Batel Tower, ultrapassando a curva S provável e os referenciais SINAPI.",
        evidence: ["SC #10294 para Aço CA-50 excedeu limite mensal", "Histórico de orçamento Batel Tower"],
        suggestedActions: [
          { label: "Acionar Nina Compras", actionStr: "acionar_nina", type: "primary" },
          { label: "Simular mitigação", actionStr: "plano_mitigacao", type: "secondary" }
        ],
        requiresHumanApproval: true,
        status: "nova",
        createdAt: "08:15"
      },
      {
        id: `msg_global_vera`,
        agentId: "ag-vera",
        agentName: "Vera",
        agentRole: "Vera Financeira",
        scope: "Global",
        module: "Financeiro",
        severity: "warning",
        title: "Alerta de Vencimento Cruzado",
        message: "O fluxo de caixa consolidado aponta saídas críticas amanhã (R$ 84.000). A maior fatia é fornecedor Votorantim.",
        suggestedActions: [
          { label: "Ver fluxo consolidado", actionStr: "ver_resumo_financeiro", type: "primary" }
        ],
        requiresHumanApproval: false,
        status: "nova",
        createdAt: "09:00"
      }
    ];

    if (activeProj) {
      initialMessages.push(
        {
          id: `msg_obra_nina_${activeProj.id}`,
          agentId: "ag-nina",
          agentName: "Nina",
          agentRole: "Nina Compras",
          scope: "Obra",
          obraId: activeProj.id,
          obraName: activeProj.name,
          module: "Compras",
          severity: "warning",
          title: "Insumo Crítico da Obra",
          message: "Precisamos fechar a cotação do Cimento CP-II hoje para esta obra, caso contrário a concretagem atrasará.",
          suggestedActions: [
            { label: "Preparar cotação", actionStr: "preparar_cotacao", type: "primary" },
            { label: "Comparar fornecedores", actionStr: "comparar_fornecedores", type: "secondary" }
          ],
          requiresHumanApproval: true,
          status: "nova",
          createdAt: "10:30"
        },
        {
          id: `msg_obra_dora_${activeProj.id}`,
          agentId: "ag-dora",
          agentName: "Dora",
          agentRole: "Dora Documentos",
          scope: "Obra",
          obraId: activeProj.id,
          obraName: activeProj.name,
          module: "Documentos",
          severity: "warning",
          title: "Documentos Sensíveis Aguardando",
          message: "Recebi 4 anexos de fiscais da prefeitura nesta obra. Classificação sugerida exige sua confirmação por sigilo.",
          suggestedActions: [
            { label: "Classificar documentos", actionStr: "classificar_docs", type: "primary" },
            { label: "Ver anexos da obra", actionStr: "ver_anexos", type: "secondary" }
          ],
          requiresHumanApproval: true,
          status: "nova",
          createdAt: "11:00"
        },
        {
          id: `msg_obra_diario_${activeProj.id}`,
          agentId: "ag-diario",
          agentName: "Diário",
          agentRole: "Diário de Obra IA",
          scope: "Obra",
          obraId: activeProj.id,
          obraName: activeProj.name,
          module: "RDO",
          severity: "warning",
          title: "RDO Pendente - Mestre de Obras",
          message: "A apropriação de horas e o clima de ontem ainda não foram formalizados no RDO. Posso gerar o rascunho com os dados passados pelo mestre no áudio?",
          suggestedActions: [
            { label: "Gerar rascunho do RDO", actionStr: "gerar_rdo", type: "primary" }
          ],
          requiresHumanApproval: true,
          status: "nova",
          createdAt: "11:45"
        },
        {
          id: `msg_obra_agenda_${activeProj.id}`,
          agentId: "ag-agenda",
          agentName: "Agenda",
          agentRole: "Agenda Inteligente",
          scope: "Obra",
          obraId: activeProj.id,
          obraName: activeProj.name,
          module: "Agenda",
          severity: "warning",
          title: "Conflito de Cronograma",
          message: "Há um conflito de vistoria (12h-14h) com a entrega de concreto nesta frente de serviço.",
          suggestedActions: [
            { label: "Sugerir novo horário", actionStr: "sugerir_horario", type: "primary" },
            { label: "Confirmar reagendamento simulado", actionStr: "reagendar", type: "secondary" }
          ],
          requiresHumanApproval: true,
          status: "nova",
          createdAt: "13:00"
        }
      );
    }
    setAgentMessages(initialMessages);
  }, [activeProj?.id]);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setIsOpen(true);
      if (e.detail?.agentRole) {
         const role = e.detail.agentRole as string;
         // Find matching agentId based on role to open directly
         if (role.includes("Sentinela")) setActiveChatId("ag-sentinela");
         else if (role.includes("Financeira")) setActiveChatId("ag-vera");
         else if (role.includes("Compras")) setActiveChatId("ag-nina");
         else if (role.includes("Dora")) setActiveChatId("ag-dora");
         else if (role.includes("Agenda")) setActiveChatId("ag-agenda");
         else if (role.includes("Diário") || role.includes("RDO")) setActiveChatId("ag-diario");
         else if (role.includes("EVA")) setActiveChatId("ag-eva");
         else setActiveChatId(null);
      } else {
         setActiveChatId(null);
      }
    };
    window.addEventListener("open-maestro", handler as EventListener);
    return () => window.removeEventListener("open-maestro", handler as EventListener);
  }, []);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [agentMessages, isOpen, activeChatId]);

  const handleAction = (actionStr: string, msgId: string) => {
    showToast(`Ambiente simulado: Ação confirmada via Hub. Nenhuma rotina real acionada.`, "success");
    setAgentMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: "simulada" } : m));
  };

  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatId) return;

    const activeAgent = agentMessages.find(m => m.agentId === activeChatId);
    if (!activeAgent) return;

    const newMessage: AgentMessage = {
      id: `usr_msg_${Date.now()}`,
      agentId: activeChatId,
      agentName: activeAgent.agentName,
      agentRole: activeAgent.agentRole,
      scope: activeAgent.scope,
      module: activeAgent.module,
      severity: "info",
      title: "",
      message: messageInput,
      suggestedActions: [],
      requiresHumanApproval: false,
      status: "lida",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isUser: true
    };

    setAgentMessages(prev => [...prev, newMessage]);
    setMessageInput("");
    setIsTyping(true);

    // Simulated Gemini AI Response Framework
    setTimeout(() => {
      const simulatedResponse: AgentMessage = {
        id: `ai_msg_${Date.now()}`,
        agentId: activeChatId,
        agentName: activeAgent.agentName,
        agentRole: activeAgent.agentRole,
        scope: activeAgent.scope,
        module: activeAgent.module,
        severity: "success",
        title: "Raciocínio IA Concluído",
        message: `(Simulação Gemini) Analisei a sua solicitação. Como estamos em ambiente simulado, eu processaria este cenário verificando o contexto atual de "${activeAgent.module}". Confirma a intenção de seguir com esta operação?`,
        suggestedActions: [
          { label: "Confirmar Simulação", actionStr: "confirmar_simulacao_gemini", type: "primary" }
        ],
        requiresHumanApproval: true,
        status: "nova",
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isUser: false
      };
      
      setAgentMessages(prev => [...prev, simulatedResponse]);
      setIsTyping(false);
    }, 2000);
  };


  // Prepare threads for List View
  const agentsWithMessages = useMemo(() => {
    const map = new Map<string, AgentMessage[]>();
    // Filter messages by current active route context
    // If we are on a global dashboard, show everything or specific global ones.
    // Let's simplify: show global messages + messages for active project.
    
    agentMessages.forEach(m => {
       if (m.scope === "Obra" && m.obraId !== activeProj?.id) return; // Skip if it's for another project
       
       if (!map.has(m.agentId)) {
         map.set(m.agentId, []);
       }
       map.get(m.agentId)!.push(m);
    });
    return Array.from(map.values()).map(msgs => {
       // Sort by date (mock sorted for now)
       return {
         agentId: msgs[0].agentId,
         agentName: msgs[0].agentName,
         agentRole: msgs[0].agentRole,
         messages: msgs,
         lastMessage: msgs[msgs.length - 1]
       };
    });
  }, [agentMessages, activeProj?.id]);

  useEffect(() => {
    if (activeChatId) {
      setAgentMessages(prev => prev.map(m => {
        if (m.agentId === activeChatId && m.status === "nova") {
          return { ...m, status: "lida" };
        }
        return m;
      }));
    }
  }, [activeChatId]);

  const activeThread = useMemo(() => {
     if (!activeChatId) return null;
     return agentMessages.filter(m => m.agentId === activeChatId && (m.scope === "Global" || m.obraId === activeProj?.id));
  }, [activeChatId, agentMessages, activeProj?.id]);

  const activeAgentMeta = useMemo(() => {
     if (!activeThread || activeThread.length === 0) return null;
     const first = activeThread[0];
     return { name: first.agentName, role: first.agentRole, id: first.agentId };
  }, [activeThread]);

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "critical": return "text-rose-500 bg-rose-500/10 border-rose-500/20";
      case "warning": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "success": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      default: return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          id="btn_evis_chat_trigger"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer relative group border border-slate-800"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-slate-105" />
          ) : (
            <MessageSquare className="h-6 w-6 text-slate-105" />
          )}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 border-2 border-white"></span>
          </span>
          <span className="absolute right-16 bg-slate-900 border border-slate-750 text-white font-mono text-[10px] tracking-wide px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-xl">
            Maestro Operacional
          </span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="evis_chat_panel"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-sm md:max-w-md h-[600px] bg-slate-50 backdrop-blur-xl rounded-2xl shadow-3xl border border-slate-200/80 overflow-hidden flex flex-col"
          >
            {/* Assistant Header - Dynamic */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-4 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                {activeChatId ? (
                   <button onClick={() => setActiveChatId(null)} className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors cursor-pointer mr-1">
                      <ArrowLeft className="h-5 w-5" />
                   </button>
                ) : (
                  <div className="h-9 w-9 bg-indigo-650 border border-indigo-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/10 shrink-0">
                    <Bot className="h-5 w-5 text-indigo-400" />
                  </div>
                )}
                
                {activeChatId && activeAgentMeta ? (
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-indigo-400 shadow-md">
                      {React.createElement(getAgentProfile(activeAgentMeta.id).icon, { className: "h-4.5 w-4.5" })}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-xs leading-none tracking-tight">
                          {activeAgentMeta.name}
                        </span>
                        <span className="inline-flex items-center h-4 px-1.5 rounded-full bg-emerald-950/80 text-[8px] font-mono font-black tracking-widest text-emerald-400 border border-emerald-500/20">
                           <Circle className="h-1.5 w-1.5 mr-1 fill-emerald-400 text-emerald-400" /> Online
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center gap-1">
                        {activeAgentMeta.role}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-xs leading-none tracking-tight">
                        Mensagens dos Agentes
                      </span>
                      <span className="inline-flex items-center h-4 px-1.5 rounded-full bg-indigo-950/80 text-[8px] font-mono font-black tracking-widest text-indigo-400 border border-indigo-500/20">
                        {agentsWithMessages.length} NOVAS
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-amber-500" /> Hub Central • EVIS
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-800/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Area */}
            {!activeChatId ? (
              // --- LIST VIEW ---
              <div className="flex-1 overflow-y-auto bg-slate-50 relative">
                 <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shadow-sm z-10 sticky top-0">
                    <div className="flex items-center gap-2 max-w-[80%]">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                        {activeRoute === "dashboard" || activeRoute === "oportunidades" ? <Sparkles className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                      </div>
                      <div className="truncate">
                        <p className="text-[8px] font-mono font-bold tracking-wider text-slate-500 uppercase">Filtro de Contexto Ativo</p>
                        <p className="text-[11px] font-bold text-slate-800 truncate">
                          {activeRoute === "dashboard" || activeRoute === "oportunidades" ? "Visão Global / Portfólio" : activeProj?.name}
                        </p>
                      </div>
                    </div>
                 </div>
                 
                 <div className="p-2 space-y-1">
                   {agentsWithMessages.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                        <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-2">
                          <CheckCircle2 className="h-5 w-5 text-slate-400" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nenhuma mensagem</span>
                     </div>
                   ) : (
                     agentsWithMessages.map(thread => (
                        <button
                          key={thread.agentId}
                          onClick={() => setActiveChatId(thread.agentId)}
                          className="w-full border-b border-slate-100 last:border-0 p-3 hover:bg-indigo-50/50 transition-colors cursor-pointer flex items-start gap-3 rounded-xl hover:shadow-xs group text-left"
                        >
                           <div className="relative shrink-0">
                              <div className="h-11 w-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 group-hover:text-indigo-600 group-hover:border-indigo-200 shadow-sm transition-colors">
                                 {React.createElement(getAgentProfile(thread.agentId).icon, { className: "h-4.5 w-4.5" })}
                              </div>
                              {thread.messages.some(m => m.status === "nova") && (
                                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-indigo-500 border border-white rounded-full flex items-center justify-center"></span>
                              )}
                           </div>
                           <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center justify-between mb-1">
                                 <span className="text-xs font-bold text-slate-800 tracking-tight block truncate">{thread.agentRole}</span>
                                 <span className="text-[9px] font-mono text-slate-400">{thread.lastMessage.createdAt}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                                {thread.lastMessage.message}
                              </p>
                           </div>
                        </button>
                     ))
                   )}
                 </div>
              </div>
            ) : (
              // --- CHAT VIEW ---
              <>
                 <div className="flex-1 overflow-y-auto p-4 space-y-5 font-sans relative bg-slate-50/50">
                    {activeThread?.map((m) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className={`flex w-full ${m.isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2.5 max-w-[90%] md:max-w-[85%] ${m.isUser ? 'flex-row-reverse' : ''}`}>
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${m.isUser ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-indigo-600 border-slate-200'}`}>
                            {m.isUser ? <User className="h-4.5 w-4.5" /> : React.createElement(getAgentProfile(m.agentId).icon, { className: "h-4.5 w-4.5" })}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {!m.isUser && (
                              <div className="flex items-center justify-between mb-1 px-1">
                                <span className="text-[10px] font-bold text-slate-700">{m.agentName}</span>
                                <span className="text-[9px] font-mono text-slate-400">{m.createdAt}</span>
                              </div>
                            )}
                            
                            <div className={`${m.isUser ? 'bg-indigo-600 text-white border border-indigo-700 rounded-xl rounded-tr-none' : 'bg-white border text-left border-slate-200 rounded-xl rounded-tl-none'} p-3.5 shadow-sm space-y-2.5`}>
                               {!m.isUser && m.title && (
                                 <div className="flex items-center gap-2 mb-1">
                                   <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${getSeverityColor(m.severity)}`}>
                                     {m.severity === "critical" ? "CRÍTICO" : m.severity === "warning" ? "ALERTA" : "INFO"}
                                   </span>
                                   <h4 className="text-[11px] font-bold text-slate-800 truncate">{m.title}</h4>
                                 </div>
                               )}
                               
                               <p className={`text-[11px] leading-relaxed ${m.isUser ? "text-indigo-50" : "text-slate-600"}`}>
                                 {m.message}
                               </p>

                               {!m.isUser && m.evidence && m.evidence.length > 0 && (
                                 <div className="bg-amber-50/50 border border-amber-200/50 rounded p-2.5 space-y-1">
                                    <p className="text-[9px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                                       <AlertTriangle className="h-3.5 w-3.5" /> Evidências:
                                    </p>
                                    <ul className="list-disc pl-4 text-[10px] text-amber-900/90 leading-relaxed">
                                      {m.evidence.map((ev, i) => <li key={i}>{ev}</li>)}
                                    </ul>
                                 </div>
                               )}

                               {!m.isUser && m.status === "simulada" && (
                                 <div className="bg-emerald-50 border border-emerald-200/60 p-2 rounded-lg flex items-center gap-2 mt-2">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                    <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest">Confirmação Humana Concluída</span>
                                 </div>
                               )}
                               
                               {!m.isUser && m.status !== "simulada" && m.suggestedActions && m.suggestedActions.length > 0 && (
                                 <div className="pt-2 flex flex-wrap gap-2">
                                    {m.suggestedActions.map((act, i) => (
                                      <button
                                        key={i}
                                        onClick={() => handleAction(act.actionStr, m.id)}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer border shadow-sm ${
                                          act.type === "primary" ? "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700" : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                                        }`}
                                      >
                                        {act.label}
                                      </button>
                                    ))}
                                 </div>
                               )}
                            </div>
                            
                            {m.isUser && (
                              <div className="flex items-center justify-end mt-1 px-1">
                                <span className="text-[9px] font-mono text-slate-400">{m.createdAt}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="flex w-full justify-start"
                      >
                        <div className="flex gap-2.5 max-w-[90%] md:max-w-[85%]">
                          <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border shadow-xs bg-white text-indigo-600 border-slate-200">
                             {activeThread && activeThread.length > 0 && React.createElement(getAgentProfile(activeThread[0].agentId).icon, { className: "h-4.5 w-4.5" })}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="bg-white border text-left border-slate-200 rounded-xl rounded-tl-none p-3.5 shadow-sm inline-flex items-center gap-1.5 h-[42px]">
                               <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                               <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                               <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                 </div>

                 {/* Chat Input Box */}
                 <div className="p-3 bg-white border-t border-slate-200">
                    <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                       <input
                         type="text"
                         value={messageInput}
                         onChange={(e) => setMessageInput(e.target.value)}
                         placeholder="Escreva para o agente..."
                         className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-[11px] rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-sans"
                       />
                       <button
                         type="submit"
                         disabled={!messageInput.trim()}
                         className="absolute right-2 h-7 w-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-colors cursor-pointer"
                       >
                         <Send className="h-3 w-3" />
                       </button>
                    </form>
                    <div className="bg-amber-50 border border-amber-200/60 p-2 mt-2 rounded-lg flex items-start gap-2">
                       <ShieldCheck className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                       <span className="text-[8px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.</span>
                    </div>
                 </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
