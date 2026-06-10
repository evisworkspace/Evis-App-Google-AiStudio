import React, { useState, useEffect } from "react";
import { getAccessToken, googleSignIn } from "../../lib/auth";
import { useApp } from "../../context/AppContext";
import { Calendar, FileText, HardDrive, RefreshCcw, MapPin, MessageCircle, Bot, ClipboardList, ArrowRight, Copy, Map, Navigation, Image as ImageIcon, User, Sparkles, ShieldAlert, Zap, AlertTriangle, FileSearch, Building2, Wrench, Clock, Pickaxe, Info, LineChart, X, Check, Volume2, Play, Send, CheckCircle2, CornerDownLeft } from "lucide-react";
import { motion } from "motion/react";
import { getAgentProfileByRole } from "../../utils/agentesConfig";

const AgentIcon = ({ role, className }: { role: string, className?: string }) => {
  const profile = getAgentProfileByRole(role);
  return React.createElement(profile.icon, { className: className || "h-4 w-4" });
};

export default function WorkspaceView() {
  const { showToast, getActiveProject, setIsWhatsAppOpen, tasks, setCurrentRoute, setActiveSubTab } = useApp();
  
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [coverImage, setCoverImage] = useState("https://images.unsplash.com/photo-1541888086225-ee1ea39e4a31?q=80&w=2670&auto=format&fit=crop");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const project = getActiveProject();
  const projectTasks = tasks.filter(t => t.project === project.id);
  const [isExtracting, setIsExtracting] = useState(false);
  const [lastExtractionTime, setLastExtractionTime] = useState<string | null>(null);
  const { setTasks } = useApp();

  // Simulated Workspaces Active States (Dialogs & Drawers)
  const [activeDrawer, setActiveDrawer] = useState<"rdo" | "decisoes" | "evidencias" | "financeiro" | "cotacao" | "classificacao" | "reagendar" | "ficha" | "whatsapp" | null>(null);
  
  // Specific Drawer states
  const [rdoTextoRelato, setRdoTextoRelato] = useState("");
  const [rdoSimulandoAudio, setRdoSimulandoAudio] = useState(false);
  const [rdoProgressoRascunho, setRdoProgressoRascunho] = useState(0);
  const [rdoRascunhoGerado, setRdoRascunhoGerado] = useState(false);
  const [wappSelectedContact, setWappSelectedContact] = useState<string>("Sérgio Almeida (Mestre)");
  const [wappMessageText, setWappMessageText] = useState("");
  const [decisoesAprovadas, setDecisoesAprovadas] = useState<string[]>([]);
  const [riscoMitigado, setRiscoMitigado] = useState(false);
  const [financeiroOtimizado, setFinanceiroOtimizado] = useState(false);
  const [documentosClassificados, setDocumentosClassificados] = useState<string[]>([]);
  const [vistoriaReagendada, setVistoriaReagendada] = useState(false);
  const [cotacaoFinalizada, setCotacaoFinalizada] = useState(false);

  // New supplementary simulated states for robust contextual dialogue & interactions
  const [rdoClima, setRdoClima] = useState<"Sol" | "Nublado" | "Chuva Fraca" | "Chuva Forte">("Sol");
  const [rdoEquipeEfetivo, setRdoEquipeEfetivo] = useState("1 Mestre de Obras Sérgio, 6 Pedreiros, 4 Serventes, 2 Eletricistas");
  const [rdoOcorrencias, setRdoOcorrencias] = useState("Nenhuma ocorrência registrada sob as diretrizes de SST. Uso de EPI com 100% de conformidade.");
  const [rdoAnexos, setRdoAnexos] = useState<string[]>(["concretagem_fundaçoes_lote1.png", "inspecao_ferragens_estrutura.jpg"]);
  const [rdoAnexoInput, setRdoAnexoInput] = useState("");
  const [rdoTarefasCheckadas, setRdoTarefasCheckadas] = useState<string[]>([]);
  
  const [financeiroTab, setFinanceiroTab] = useState<"fluxo" | "dre">("fluxo");
  const [financeiroLembretes, setFinanceiroLembretes] = useState<string[]>([]);
  const [financeiroNovoLembrete, setFinanceiroNovoLembrete] = useState("");
  
  const [mitigacaoChecklist, setMitigacaoChecklist] = useState([
    { id: "mit-1", label: "Contatar metalúrgica secundária (Metalúrgica Sul para frete expresso)", checked: false },
    { id: "mit-2", label: "Reavaliar orçamento de contingência da obra (+R$ 420 dentro do planejado)", checked: false },
    { id: "mit-3", label: "Programar frete prioritário FOB para entrega em até 48 horas", checked: false }
  ]);
  
  const [doraDocumentosSensitivas, setDoraDocumentosSensitivas] = useState<string[]>(["doc-2"]);
  const [doraManualReviewDoc, setDoraManualReviewDoc] = useState<any | null>(null);

  const [cotacaoSelectedFornecedor, setCotacaoSelectedFornecedor] = useState<string | null>(null);
  const [cotacaoComparativoAberto, setCotacaoComparativoAberto] = useState(false);
  const [cotacaoSolicitacaoSimulada, setCotacaoSolicitacaoSimulada] = useState(false);

  const [agendaVisualSlotsAberta, setAgendaVisualSlotsAberta] = useState(false);

  useEffect(() => {
    getAccessToken().then(setToken);
  }, []);

  const runWhatsappCron = async () => {
    setIsExtracting(true);
    try {
      const res = await fetch("/api/whatsapp/cron-analyze", { method: "POST" });
      const data = await res.json();
      
      if (data.lembretes && data.lembretes.length > 0) {
        data.lembretes.forEach((l: string) => {
           setTasks(prev => [{
             id: `wapp_lemb_${Date.now()}_${Math.random()}`,
             title: `WAPP: ${l}`,
             project: project.id,
             assignedTo: "Eng. Berti",
             dueDate: new Date().toISOString().split("T")[0],
             priority: "Média",
             status: "Fazer"
           }, ...prev]);
        });
      }

      if (data.materiais && data.materiais.length > 0) {
        data.materiais.forEach((m: string) => {
           setTasks(prev => [{
             id: `wapp_mat_${Date.now()}_${Math.random()}`,
             title: `SOLICITACAO MATERIAL: ${m}`,
             project: project.id,
             assignedTo: "Compras",
             dueDate: new Date().toISOString().split("T")[0],
             priority: "Alta",
             status: "Fazer"
           }, ...prev]);
        });
      }

      setLastExtractionTime(new Date().toLocaleTimeString());
      showToast("Mensagens do grupo lidas com sucesso! Novas tarefas geradas.", "success");
    } catch (err) {
       console.error(err);
       showToast("Erro ao contatar API de análise do WhatsApp", "error");
    } finally {
      setIsExtracting(false);
    }
  };

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Load Calendar Events
      const calRes = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5&orderBy=startTime&singleEvents=true&timeMin=" + new Date().toISOString(), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const calData = await calRes.json();
      if (calData.items) setEvents(calData.items);

      // Load Drive Files
      const driveRes = await fetch("https://www.googleapis.com/drive/v3/files?pageSize=5&orderBy=modifiedByMeTime desc", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const driveData = await driveRes.json();
      if (driveData.files) setFiles(driveData.files);
      
    } catch (err) {
      console.error(err);
      showToast("Erro ao carregar dados do Workspace", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token, project.id]);

  const openGoogleMaps = () => {
    if (!project) return;
    showToast("Redirecionamento para navegação externa acionado.", "info");
    // Em um ambiente real, faríamos window.open
  };

  const openMaestro = (agentRole: string) => {
    window.dispatchEvent(new CustomEvent("open-maestro", { detail: { agentRole } }));
  };

  if (!token) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-zinc-200 mt-8"
      >
        <HardDrive className="h-12 w-12 text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold text-zinc-900 font-sans">Workspace Desconectado</h2>
        <p className="text-sm text-zinc-500 mb-6 max-w-md text-center">Para utilizar as integrações avançadas de Agenda, Arquivos e Email, faça login com sua conta do Google.</p>
        <button onClick={async () => {
          try {
            const res = await googleSignIn();
            if (res) setToken(res.accessToken);
          } catch (err) {
            console.error(err);
          }
        }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold font-sans rounded-lg transition-colors cursor-pointer">
          Conectar Workspace
        </button>
      </motion.div>
    );
  }

  if (!project.id) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 mt-8"
      >
        <Building2 className="h-12 w-12 text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">Nenhuma obra selecionada</h2>
        <p className="text-sm text-zinc-500 mb-6 max-w-md text-center">
          Selecione uma obra no menu lateral para acessar o Workspace operacional com ficha, equipe e tarefas da obra.
        </p>
        <button
          onClick={() => setCurrentRoute("obras")}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-sans rounded-lg transition-colors cursor-pointer"
        >
          Ver Obras
        </button>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      key={project.id}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      
      {/* Compact Header (Painel da Obra) */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1541888086225-ee1ea39e4a31?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center pointer-events-none" />
        <div className="relative z-10 p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                PRÓX. ENTREGA: {project.endDate ? new Date(project.endDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase() : '—'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white border ${project.status === "Em Andamento" ? 'bg-indigo-600 border-indigo-700' : 'bg-emerald-600 border-emerald-700'}`}>
                {project.status}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> Risco Principal: Atraso Concretagem
              </span>
            </div>
            <h2 className="text-2xl font-bold font-sans text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-zinc-400" /> Workspace: {project.name}
            </h2>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-2">
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {project.location.split(',')[0]}</span>
              <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Resp: {project.manager || "—"}</span>
              <span className="flex items-center gap-1"><Pickaxe className="h-3.5 w-3.5" /> Etapa: {project.status}</span>
            </div>
          </div>
          <div className="md:w-64 shrink-0 flex flex-col items-end justify-between">
             <div className="w-full mb-3 text-right">
                <div className="flex items-end justify-between mb-1">
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Progresso Físico</span>
                   <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 leading-none">{project.progress}%</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${project.progress}%` }}></div>
                </div>
             </div>
             <button 
              onClick={loadData} 
              className="px-3 py-1.5 flex items-center gap-1.5 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded border border-zinc-200 dark:border-zinc-600 transition-all font-bold text-[10px] uppercase cursor-pointer shadow-sm disabled:opacity-50"
              title="Sincronizar APIs do Google"
              disabled={loading}
             >
              <RefreshCcw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Sincronizar Dados
             </button>
          </div>
        </div>
      </motion.div>

      {/* First Row: 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Localização da Obra */}
        <motion.div 
          variants={itemVariants}
          className="h-[300px] bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 transition-all flex flex-col group relative"
        >
          <div className="flex-1 w-full relative">
            <iframe 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(project.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'contrast(1.1) grayscale(0.2)' }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            />
          </div>
          <div className="bg-white p-4 flex flex-col z-10 border-t border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-[11px] font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 cursor-pointer hover:text-blue-600 transition-colors" onClick={openGoogleMaps}>
                 <MapPin className="h-3.5 w-3.5 mr-1 text-blue-500" /> Abrir no Maps <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(project.location);
                  showToast("Endereço copiado", "success");
                }}
                className="flex items-center text-[10px] uppercase font-bold tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <Copy className="h-3 w-3 mr-1" /> Copiar
              </button>
            </div>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed truncate">
              {project.location}
            </p>
            <div className="mt-2 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold px-2 py-1 rounded w-fit uppercase flex justify-center items-center gap-1">
               <Info className="h-3 w-3" /> Região Sul (Simulado)
            </div>
          </div>
        </motion.div>

        {/* Equipe e Comunicação */}
        <motion.div 
          variants={itemVariants}
          className="h-[300px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all flex flex-col group"
        >
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setWappSelectedContact("Todos os integrantes");
                setActiveDrawer("whatsapp");
                showToast("Mensagem para equipe iniciada.", "info");
              }} 
              className="flex-1 bg-[#25D366] hover:bg-[#1DA851] text-white flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold font-sans text-xs shadow-sm transition-all cursor-pointer mb-4 shrink-0 hover:-translate-y-0.5"
            >
              <MessageCircle className="h-4 w-4 fill-current" />
              WhatsApp Equipe
            </button>
            <button
              onClick={runWhatsappCron}
              disabled={isExtracting}
              className="w-10 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 border border-zinc-200 dark:border-zinc-700 disabled:opacity-50 text-emerald-600 flex items-center justify-center py-2.5 rounded-xl transition-all cursor-pointer mb-4 shrink-0 shadow-sm"
              title="Ler mensagens recentes e extrair tarefas automático"
            >
              <RefreshCcw className={`h-4 w-4 ${isExtracting ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <h4 className="flex items-center justify-between text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider mb-2.5 shrink-0 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <span>Contatos Principais</span>
            {lastExtractionTime && <span className="text-[9px] text-emerald-500 normal-case tracking-normal"><Bot className="w-3 h-3 inline mr-1" />{lastExtractionTime}</span>}
          </h4>
          
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {(project.equipe.length > 0 ? project.equipe : [{ name: project.manager || "—", role: "Responsável Técnico" }]).map((contact, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-zinc-100 dark:border-zinc-800/80 shrink-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    {contact.name}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5 text-zinc-500">{contact.role}</span>
                </div>
                <button
                  onClick={() => {
                    setWappSelectedContact(`${contact.name} (${contact.role})`);
                    setActiveDrawer("whatsapp");
                    showToast(`Conversa iniciada com ${contact.name}.`, "info");
                  }}
                  className="h-7 w-7 rounded-full bg-white border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 hover:bg-[#25D366] hover:border-[#25D366] dark:hover:bg-[#25D366] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm group-hover:scale-105"
                  title="Abrir Chat"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Ficha da Obra */}
        <motion.div 
          variants={itemVariants}
          className="h-[300px] bg-white border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden flex flex-col group relative"
        >
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50">
             <h4 className="text-[10px] font-bold font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center">
               <FileText className="w-3.5 h-3.5 mr-1" /> Ficha da Obra
             </h4>
             <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
               ID: {project.id.slice(0, 6)}
             </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-3 scrollbar-thin">
             <div>
               <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Nome da Obra</p>
               <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{project.name}</p>
             </div>
             <div>
               <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Responsável Técnico</p>
               <p className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">{project.manager || "—"}</p>
             </div>
             <div>
               <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Status</p>
               <p className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">{project.status}</p>
             </div>
             <div>
               <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Início / Previsão</p>
               <p className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100">
                 {project.startDate ? new Date(project.startDate + 'T00:00:00').toLocaleDateString('pt-BR') : '—'} — {project.endDate ? new Date(project.endDate + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
               </p>
             </div>
             <div>
               <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Descrição</p>
               <p className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">{project.description || "—"}</p>
             </div>
          </div>
          <div className="bg-zinc-50 p-3 flex gap-2 z-10 border-t border-zinc-100 dark:bg-zinc-800/80 dark:border-zinc-800">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(`Obra: ${project.name}\nCliente: João Pedro Silva\nEntrega: 15/Ago/2026`);
                showToast("Ficha resumida copiada", "success");
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-zinc-300 dark:bg-zinc-700 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-100 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
              title="Copiar dados"
            >
              <Copy className="h-3 w-3" /> Copiar
            </button>
            <button 
              onClick={() => {
                setActiveDrawer("ficha");
                showToast("Carregando ficha completa da obra.", "info");
              }}
              className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
            >
              Ver Detalhes
            </button>
          </div>
        </motion.div>

        {/* Diário de Obra AI Card */}
        <motion.div 
          variants={itemVariants}
          className="h-[300px] bg-white border border-zinc-200 dark:border-zinc-800/50 dark:bg-zinc-900 rounded-xl flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-all group relative"
        >
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2 bg-purple-50 dark:bg-purple-900/10">
            <AgentIcon role="Diário de Obra IA" className="h-5 w-5 text-purple-600" />
            <h3 className="font-bold text-xs text-purple-900 dark:text-purple-300 uppercase tracking-wider">Diário de Obra IA</h3>
          </div>
          
          <div className="p-5 flex-1 flex flex-col items-center justify-center text-center">
            <Wrench className="h-10 w-10 text-purple-200 dark:text-purple-900 mb-3" />
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed mb-4 max-w-[200px]">
              Registre áudio, texto ou foto da vistoria. A IA organiza o RDO, identifica ocorrências e sugere tarefas.
            </p>
          </div>
          
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
            <button 
              onClick={() => openMaestro("Diário")}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              <Bot className="h-4 w-4" /> Registrar RDO (Via Maestro)
            </button>
            <button 
              onClick={() => showToast("Em desenvolvimento", "info")}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              Ver últimos RDOs
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Second Row: Contextual AI Agents */}
      <motion.div variants={itemVariants} className="mt-6 mb-2">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-purple-600" /> Agentes Atentos nesta Obra
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {/* EVA Executiva - Resumo */}
          <div className="bg-white border-l-4 border-l-indigo-500 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-3">
                <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  <AgentIcon role="EVA Executiva" className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> EVA Executiva
                </h4>
                <span className="text-[9px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-1.5 py-0.5 rounded font-bold uppercase">Resumo Diário</span>
              </div>
              <p className="text-[12px] text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed mb-4">
                Prioridades e decisões pendentes da obra.
              </p>
            </div>
            <button onClick={() => openMaestro("EVA")} className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] uppercase font-bold py-2 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2">
               Abrir no Maestro <CornerDownLeft className="h-3 w-3" />
            </button>
          </div>

          {/* Sentinela de Riscos */}
          <div className="bg-white border-l-4 border-l-rose-500 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-3">
                <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  <AgentIcon role="Sentinela de Riscos" className="h-4 w-4 text-rose-600 dark:text-rose-400" /> Sentinela de Riscos
                </h4>
                <span className="text-[9px] bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 px-1.5 py-0.5 rounded font-bold uppercase">Crítico</span>
              </div>
              <p className="text-[12px] text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed mb-4">
                Risco crítico com evidências cruzadas.
              </p>
            </div>
            <button onClick={() => openMaestro("Sentinela")} className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] uppercase font-bold py-2 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2">
               Abrir Alerta no Maestro <CornerDownLeft className="h-3 w-3" />
            </button>
          </div>

          {/* Vera Financeira */}
          <div className="bg-white border-l-4 border-l-emerald-500 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-3">
                <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  <AgentIcon role="Vera Financeira" className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Vera Financeira
                </h4>
                <span className="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase">Alerta de Caixa</span>
              </div>
              <p className="text-[12px] text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed mb-4">
                Alerta de caixa ou vencimento próximo.
              </p>
            </div>
            <button onClick={() => openMaestro("Vera Financeira")} className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] uppercase font-bold py-2 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2">
               Abrir no Maestro <CornerDownLeft className="h-3 w-3" />
            </button>
          </div>

          {/* Nina Compras */}
          <div className="bg-white border-l-4 border-l-amber-500 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-start mb-3">
                <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  <AgentIcon role="Nina Compras" className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Nina Compras
                </h4>
                <span className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold uppercase">Tarefa Pendente</span>
              </div>
              <p className="text-[12px] text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed mb-4">
                Cotação ou insumo crítico pendente.
              </p>
            </div>
            <button onClick={() => openMaestro("Nina Compras")} className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-[10px] uppercase font-bold py-2 rounded-lg transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2">
               Abrir no Maestro <CornerDownLeft className="h-3 w-3" />
            </button>
          </div>

        </div>
      </motion.div>

      {/* Deep Work Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tasks Widget */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-5 items-stretch rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-[380px]">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-emerald-500" /> Tarefas Abertas
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
            {projectTasks.length === 0 ? (
              <p className="text-[11px] text-zinc-500 italic">Nenhuma tarefa pendente para esta obra.</p>
            ) : (
              projectTasks.map(task => (
                <div key={task.id} className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-800/50 hover:border-emerald-400 transition-colors flex flex-col justify-between mb-2 shadow-sm">
                  <div className="mb-2">
                    <span className="text-[11.5px] font-bold text-zinc-900 dark:text-zinc-100 block">{task.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-mono">{task.assignedTo} • {task.status}</span>
                    <div className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      task.priority === "Alta" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                      task.priority === "Média" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}>
                      {task.priority}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Calendar Widget */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-[380px]">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-500" /> Próximas Reuniões
          </h3>
          
          {/* Agenda Inteligente Insights */}
          <div className="bg-white dark:bg-zinc-800 border-l-4 border-l-blue-500 border border-zinc-200 dark:border-zinc-700 p-3 rounded-lg mb-3 shrink-0 shadow-sm">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <AgentIcon role="Agenda Inteligente IA" className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Agenda Inteligente IA</span>
                </div>
                <span className="text-[9px] bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 font-bold px-1.5 py-0.5 rounded uppercase uppercase">Conflito Detectado</span>
             </div>
             <p className="text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium mb-3">
                Conflito ou compromisso relevante aguardando resolução.
             </p>
             <button onClick={() => openMaestro("Agenda")} className="text-[10px] uppercase font-bold bg-white border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors w-full py-2 flex items-center justify-center gap-2 rounded-lg shadow-sm cursor-pointer">
                Abrir no Maestro <CornerDownLeft className="h-3 w-3" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
            {events.length === 0 ? (
              <p className="text-[11px] text-zinc-500 italic">Nenhum evento futuro na sua agenda.</p>
            ) : (
              events.map(ev => {
                const start = ev.start.dateTime || ev.start.date;
                const dat = new Date(start);
                return (
                  <div key={ev.id} className="p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50 rounded-lg flex flex-col relative overflow-hidden mb-2 shadow-sm">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    <span className="text-[11.5px] font-bold text-zinc-900 dark:text-zinc-100 mb-1 ml-1 truncate">{ev.summary || "Evento sem título"}</span>
                    <span className="text-[10px] font-mono text-zinc-500 ml-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {dat.toLocaleString("pt-BR", { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Drive Widget */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-[380px]">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-emerald-500" /> Arquivos da Obra
          </h3>

          {/* Dora Documentos Insights */}
          <div className="bg-white dark:bg-zinc-800 border-l-4 border-l-emerald-500 border border-zinc-200 dark:border-zinc-700 p-3 rounded-lg mb-3 shrink-0 shadow-sm">
             <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <AgentIcon role="Dora Documentos" className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">Dora Documentos</span>
                </div>
                <span className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded uppercase uppercase">Atenção</span>
             </div>
             <p className="text-[11px] leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium mb-3">
                Documentos aguardando classificação por OCR.
             </p>
             <button onClick={() => openMaestro("Dora")} className="text-[10px] uppercase font-bold bg-white border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors w-full py-2 flex items-center justify-center gap-2 rounded-lg shadow-sm cursor-pointer">
                Abrir no Maestro <CornerDownLeft className="h-3 w-3" />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                 <FileSearch className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mb-3" />
                 <p className="text-[11px] text-zinc-500 font-medium italic">
                   Nenhum arquivo encontrado para esta obra. Quando houver anexos, Dora classificará automaticamente em contratos, RDOs, medições, notas e projetos.
                 </p>
              </div>
            ) : (
              files.map(file => (
                <div key={file.id} className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-800/50 hover:border-emerald-400 dark:hover:border-emerald-800 transition-colors cursor-pointer mb-2 flex items-center group shadow-sm">
                  <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mr-3 shrink-0">
                    <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <span className="text-[11.5px] font-bold text-zinc-900 dark:text-zinc-100 truncate block w-full">{file.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500">Google Drive</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>

      {/* Governance Banner */}
      <motion.div variants={itemVariants} className="mt-6 p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/10 flex items-start gap-3">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
          <strong>Ambiente Simulado (Governança EVIS):</strong> Este é o nível máximo de assistência de IA da Curitiba Construtora. A IA lê documentações, detecta riscos, sugere diários e classifica arquivos proativamente. 
          <span className="underline ml-1">O humano revisa e aprova. Nenhuma ação mutável real (pagamentos, e-mails finais a clientes, aditivos no ERP) é executada sem confirmação explícita.</span>
        </p>
      </motion.div>

      {/* Interactive Simulated Drawers / Modals panel */}
      {activeDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop screen */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveDrawer(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer container (slides from right) */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg md:max-w-xl h-full bg-slate-950 border-l border-zinc-800 text-zinc-100 flex flex-col shadow-2xl z-10 font-sans"
          >
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm tracking-widest uppercase text-indigo-300 font-mono">
                    {activeDrawer === "rdo" && "Novo RDO com IA Assistida"}
                    {activeDrawer === "decisoes" && "Decisões Operacionais - EVA"}
                    {activeDrawer === "evidencias" && "Sentinela de Riscos - Evidências"}
                    {activeDrawer === "financeiro" && "Vera Financeira - Otimização de Caixa"}
                    {activeDrawer === "cotacao" && "Nina Compras - Cotação de Materiais"}
                    {activeDrawer === "classificacao" && "Dora Documentos - Classificação por OCR"}
                    {activeDrawer === "reagendar" && "Agenda Inteligente - Resolução de Conflitos"}
                    {activeDrawer === "ficha" && "Ficha Cadastral Completa"}
                    {activeDrawer === "whatsapp" && "Central de Mensagens EVIS"}
                  </h3>
                  <p className="text-[10px] font-medium text-zinc-500 mt-0.5">
                    {activeDrawer === "ficha" ? `Consolidado de Cadastro da Obra` : `Sugestões da IA estruturada para sua segurança`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveDrawer(null)}
                className="h-8 w-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
              {/* Core Governance Indicator */}
              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/40 flex gap-3 shadow-inner">
                <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                  <strong>Controle de Governança EVIS:</strong> Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.
                </p>
              </div>

              {/* RDO Drawer UI */}
              {activeDrawer === "rdo" && (
                <div className="space-y-6">
                  {/* Context Block */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[9px] bg-purple-950 text-purple-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                      Obra Selecionada • Diário de Obra IA
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100 mt-2 font-sans">{project.name}</h4>
                    <p className="text-xs text-zinc-400 mt-1">
                      Responsável Técnico: <strong>Eng. {project.manager || "Evandro"}</strong> | Bairro: Curitiba - {project.location.split(',')[1] || "Centro"}
                    </p>
                    <div className="mt-3 text-xs text-zinc-400 font-medium">
                      Data do Relato: <span className="text-purple-400 font-mono font-bold">{new Date().toLocaleDateString("pt-BR", { dateStyle: "long" })}</span>
                    </div>
                  </div>

                  {/* Parametros Simulados */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-500">Parâmetros Ativos da Vistoria</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Clima Simulado */}
                      <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5Packed flex flex-col">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Clima Simulado</label>
                        <select 
                          value={rdoClima}
                          onChange={(e) => setRdoClima(e.target.value as any)}
                          className="bg-zinc-950 border border-zinc-700 rounded p-1.5 text-xs text-zinc-200 mt-1 focus:outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value="Sol">Sol (Estável)</option>
                          <option value="Nublado">Nublado</option>
                          <option value="Chuva Fraca">Chuva Fraca</option>
                          <option value="Chuva Forte">Chuva Forte</option>
                        </select>
                      </div>

                      {/* SST */}
                      <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">Segurança (SST)</span>
                        <input
                          type="text"
                          value={rdoOcorrencias}
                          onChange={(e) => setRdoOcorrencias(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Equipe Presente */}
                    <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">Efetivo de Equipe Presente</label>
                      <input 
                        type="text"
                        value={rdoEquipeEfetivo}
                        onChange={(e) => setRdoEquipeEfetivo(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                        placeholder="Mestre de obras, pedreiros, etc..."
                      />
                    </div>

                    {/* Campo de relato */}
                    <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">Campo de Relato Operacional</label>
                      <textarea 
                        rows={3}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-zinc-200 focus:outline-none focus:border-purple-500"
                        placeholder="Insira as atividades realizadas hoje..."
                        value={rdoTextoRelato}
                        onChange={(e) => setRdoTextoRelato(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setRdoSimulandoAudio(true);
                            showToast("Simulando captação de áudio do mestre no canteiro...", "info");
                            setTimeout(() => {
                              setRdoTextoRelato("Concretagem finalizada com sucesso. Clima bom, concretadora faturou no prazo e espalhamento ocorreu de acordo com as especificações técnicas da laje. Nenhuma infração de SST registrada.");
                              setRdoClima("Sol");
                              setRdoOcorrencias("Atividades executadas sob o padrão de EPI completo.");
                              setRdoSimulandoAudio(false);
                              showToast("Áudio de vistoria transcrito com sucesso!", "success");
                            }, 2000);
                          }}
                          disabled={rdoSimulandoAudio}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-200 text-[10px] uppercase font-bold py-2 rounded transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {rdoSimulandoAudio ? (
                            <>
                              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" /> Transcrevendo Vistoria...
                            </>
                          ) : (
                            <>
                              <Volume2 className="h-3.5 w-3.5" /> Simular Áudio de Vistoria
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Anexos simulados */}
                    <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">Evidências e Fotos Simuladas</span>
                      <div className="grid grid-cols-2 gap-2">
                        {rdoAnexos.map((anexo, idx) => (
                          <div key={idx} className="p-2 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-300">
                            <span className="truncate max-w-[120px]">{anexo}</span>
                            <button 
                              onClick={() => {
                                setRdoAnexos(prev => prev.filter((_, i) => i !== idx));
                                showToast("Foto removida.", "info");
                              }}
                              className="text-rose-500 hover:text-rose-400 font-bold ml-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Adiconar foto_laje_viga.jpg..."
                          className="flex-1 bg-zinc-950 border border-zinc-850 rounded p-1.5 text-xs text-zinc-300 focus:outline-none"
                          value={rdoAnexoInput}
                          onChange={(e) => setRdoAnexoInput(e.target.value)}
                        />
                        <button 
                          onClick={() => {
                            if (!rdoAnexoInput) return;
                            setRdoAnexos(prev => [...prev, rdoAnexoInput]);
                            setRdoAnexoInput("");
                            showToast("Simulação de arquivo anexado com sucesso!", "success");
                          }}
                          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs rounded border border-zinc-700 text-zinc-300 font-bold"
                        >
                          + Anexar
                        </button>
                      </div>
                      {rdoAnexos.length > 0 && (
                        <button
                          onClick={() => {
                            showToast("Analisando evidências fotográficas com Gemini Vision...", "info");
                            setTimeout(() => {
                              showToast("O Gemini identificou os elementos da concretagem e validou o padrão de qualidade (EPIs/Limpeza) das fotos.", "success");
                            }, 3000);
                          }}
                          className="w-full mt-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[10px] uppercase font-bold py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                           <Bot className="h-3.5 w-3.5" /> Analisar Imagens (Gemini Vision)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Generate Button */}
                  {!rdoRascunhoGerado && (
                    <button 
                      onClick={() => {
                        let count = 0;
                        const interval = setInterval(() => {
                          count += 20;
                          setRdoProgressoRascunho(count);
                          if (count >= 100) {
                            clearInterval(interval);
                            setRdoRascunhoGerado(true);
                            showToast("Processamento da Dora IA Concluído!", "success");
                          }
                        }, 150);
                      }}
                      disabled={rdoProgressoRascunho > 0}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold uppercase tracking-wider py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Bot className="h-4 w-4" /> 
                      {rdoProgressoRascunho > 0 ? `Dora IA processando fotos e relatos (${rdoProgressoRascunho}%)` : 'Gerar Rascunho de RDO com IA'}
                    </button>
                  )}

                  {/* Rich Draft output preview */}
                  {rdoRascunhoGerado && (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 p-4 border border-blue-500/30 bg-blue-50/50 dark:bg-zinc-950 rounded-xl"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-blue-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                           <div className="h-6 w-5 bg-blue-600 rounded-sm flex items-center justify-center relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-2 h-2 bg-blue-400"></div>
                              <FileText className="h-3 w-3 text-white" />
                           </div>
                           <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider font-mono">Google Docs • RDO Gerado</span>
                        </div>
                        <span className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded font-bold uppercase">Simulação Arquivo</span>
                      </div>
                      
                      <div className="space-y-3.5 text-xs text-zinc-700 dark:text-zinc-300">
                        <div>
                          <strong className="text-zinc-400 font-bold block uppercase text-[9.5px]">1. Atividades Identificadas:</strong>
                          <ul className="list-disc pl-4 mt-1 space-y-1 text-zinc-300">
                            <li>Cura úmida do concreto estrutural.</li>
                            <li>Limpeza das fôrmas metálicas da sapata de sustentação.</li>
                            <li>Lançamento com auxílio de bomba pneumática.</li>
                          </ul>
                        </div>

                        <div>
                          <strong className="text-zinc-400 font-bold block uppercase text-[9.5px]">2. Equipe Presente catalogada:</strong>
                          <p className="mt-1 font-mono text-zinc-300 bg-zinc-950 p-2 rounded border border-zinc-850">
                            {rdoEquipeEfetivo || "1 Mestre, 6 Pedreiros, 4 Serventes, 2 Eletricistas (Inalterados)"}
                          </p>
                        </div>

                        <div>
                          <strong className="text-zinc-400 font-bold block uppercase text-[9.5px]">3. Materiais Consumidos no Dia:</strong>
                          <ul className="list-disc pl-4 mt-1 space-y-1 text-emerald-400">
                            <li>150 Sacos de cimento CP-II (usados do estoque Votorantim).</li>
                            <li>4 m³ Areia Fina.</li>
                            <li>120 kg Ferragens de montagem de estribo.</li>
                          </ul>
                        </div>

                        <div>
                          <strong className="text-zinc-400 font-bold block uppercase text-[9.5px]">4. Ocorrências anotadas:</strong>
                          <p className="mt-1 italic text-zinc-300">{rdoOcorrencias || "Nenhuma ocorrência sob SST."}</p>
                        </div>

                        <div>
                          <strong className="text-zinc-400 font-bold block uppercase text-[9.5px]">5. Tarefas Sugeridas pela IA (Marque para consentir):</strong>
                          <div className="mt-2 space-y-2">
                            {[
                              "Realizar cura úmida 3 vezes ao dia preventivamente",
                              "Solicitar reestocagem de cimento CP-II junto à Nina",
                              "Agendar retirada do entulho acumulado das caixas"
                            ].map((task, isKey) => (
                              <label key={isKey} className="flex items-start gap-2.5 cursor-pointer text-zinc-300 select-none">
                                <input 
                                  type="checkbox"
                                  className="mt-0.5"
                                  checked={rdoTarefasCheckadas.includes(task)}
                                  onChange={() => {
                                    setRdoTarefasCheckadas(prev => 
                                      prev.includes(task) ? prev.filter(t => t !== task) : [...prev, task]
                                    );
                                  }}
                                />
                                <span>{task}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <strong className="text-zinc-400 font-bold block uppercase text-[9.5px] text-rose-400">6. Riscos Detectados pela Sentinela:</strong>
                          <p className="mt-1 text-rose-300 font-semibold">
                            ⚠️ Risco térmico ativo: Evaporação d'água veloz devido ao Clima de {rdoClima} {"(>28°C)"}. Recomendado aspersão estrutural constante.
                          </p>
                        </div>
                      </div>

                      {/* Human-approved validation layer */}
                      <div className="p-3 bg-zinc-950/80 rounded border border-zinc-850 space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-200 cursor-pointer">
                          <input type="checkbox" id="human-confirm-checkbox" className="h-4 w-4 rounded bg-zinc-900 border-zinc-700 accent-emerald-500" />
                          <span>Confirmo como engenheiro responsável o teor simulado.</span>
                        </label>
                        <p className="text-[10px] text-zinc-500">A publicação de RDO simulado exige essa confirmação prévia no EVIS.</p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => {
                            setRdoRascunhoGerado(false);
                            setRdoProgressoRascunho(0);
                            showToast("Rascunho descartado.", "info");
                          }}
                          className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 py-2.5 rounded font-bold font-mono text-[10px] uppercase border border-zinc-800"
                        >
                          Limpar
                        </button>
                        <button 
                          onClick={() => {
                            const ck = document.getElementById("human-confirm-checkbox") as HTMLInputElement;
                            if (ck && !ck.checked) {
                              showToast("Atenção: Você precisa marcar a declaração de validação técnica!", "error");
                              return;
                            }
                            showToast("Em desenvolvimento", "info");
                            setActiveDrawer(null);
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded font-bold text-[10px] uppercase font-sans tracking-wide"
                        >
                          Publicar RDO Simulado
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* General mandatory microcopy */}
                  <div className="text-center bg-zinc-950 p-2.5 rounded border border-zinc-900 mt-4">
                    <p className="text-[9.5px] text-zinc-500">
                      “Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.”
                    </p>
                  </div>
                </div>
              )}

              {/* EVA Executiva - Decisões Drawer */}
              {activeDrawer === "decisoes" && (
                <div className="space-y-6">
                  {/* Priority indicator */}
                  <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/35 space-y-1.5">
                    <span className="text-[9px] bg-indigo-900 text-indigo-200 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                      EVA Executiva • Visão de Margens
                    </span>
                    <h4 className="text-xs font-bold text-zinc-200 uppercase mt-1 tracking-wider">Prioridade Estratégica do Dia:</h4>
                    <p className="text-xs text-zinc-300 font-medium italic leading-relaxed">
                      "Acelerar cotações pendentes da superestrutura na obra {project.name}, sanar conflito de vistorias da prefeitura ambiental e auditar notas fiscais do cimento."
                    </p>
                  </div>

                  {/* List of decisions */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-500">Decisões Aguardando Homologação</h4>

                    {/* Decisao 1 */}
                    <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] bg-rose-950 text-rose-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-widest">URGÊNCIA: CRÍTICA</span>
                          <h4 className="text-[12.5px] font-bold text-zinc-100 mt-1.5">1. Confirmar Cotação Cimento CP-II</h4>
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold">Aguardando</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Insumo essencial prestes a vencer SLA de estocagem. Impacto em economia de mais de <strong>R$ 800</strong> em comparação de preço.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-zinc-950 p-2 rounded border border-zinc-850">
                        <div>
                          <span className="text-zinc-500 block">Agente Responsável</span>
                          <span className="font-bold text-zinc-300">Nina Compras</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Estudo de Impacto</span>
                          <span className="font-bold text-emerald-400">Evita Multas e Paradas</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveDrawer("cotacao");
                          showToast("Handoff: EVA → Nina Compras. Motivo: Urgência na cotação de Cimento. Status: Em transferência.", "info");
                        }}
                        className="w-full text-[10.5px] font-bold uppercase bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 py-2 rounded transition-colors shadow-sm"
                      >
                        Abrir Nina Compras
                      </button>
                    </div>

                    {/* Decisao 2 */}
                    <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] bg-zinc-950 text-amber-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-widest">URGÊNCIA: ALTA</span>
                          <h4 className="text-[12.5px] font-bold text-zinc-100 mt-1.5">2. Registrar RDO Diário do Mestre</h4>
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold">Pendente</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Atividades técnicas de concretagem finalizadas sem consolidação legal. Impacto securitário de aditivos governamentais.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-zinc-950 p-2 rounded border border-zinc-850">
                        <div>
                          <span className="text-zinc-500 block">Agente Responsável</span>
                          <span className="font-bold text-indigo-400">Diário de Obra IA</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Estudo de Impacto</span>
                          <span className="font-bold text-indigo-300">Preenchimento Securitário</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveDrawer("rdo");
                          showToast("Handoff: EVA → Diário de Obra IA. Motivo: Registro RDO pendente. Status: Em transferência.", "info");
                        }}
                        className="w-full text-[10.5px] font-bold uppercase bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 py-2 rounded transition-colors shadow-sm"
                      >
                        Registrar Diário RDO
                      </button>
                    </div>

                    {/* Decisao 3 */}
                    <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] bg-zinc-950 text-zinc-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-widest">URGÊNCIA: MÉDIA</span>
                          <h4 className="text-[12.5px] font-bold text-zinc-100 mt-1.5">3. Revisar Documentos de Confidencialidade</h4>
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold">Triado</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Dora identificou alvarás contendo CPFs do cliente João Pedro Silva expostos no diretório público.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-zinc-950 p-2 rounded border border-zinc-850">
                        <div>
                          <span className="text-zinc-500 block">Agente Responsável</span>
                          <span className="font-bold text-emerald-400">Dora Documentos</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Estudo de Impacto</span>
                          <span className="font-bold text-rose-400">Segurança de CPFs (LGPD)</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveDrawer("classificacao");
                          showToast("Handoff: EVA → Dora Documentos. Motivo: Revisão de documentos sensíveis (LGPD). Status: Em transferência.", "info");
                        }}
                        className="w-full text-[10.5px] font-bold uppercase bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 py-2 rounded transition-colors shadow-sm"
                      >
                        Abrir Dora Documentos
                      </button>
                    </div>

                    {/* Decisao 4 */}
                    <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] bg-rose-950 text-rose-400 font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-widest">URGÊNCIA: CRÍTICA</span>
                          <h4 className="text-[12.5px] font-bold text-zinc-100 mt-1.5">4. Resolver Conflito de Vistoria da Prefeitura</h4>
                        </div>
                        <span className="text-[10px] text-red-400 font-bold">Bloqueante</span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Choque de calendário no Residencial Kairós impede que o engenheiro sênior valide a medição física.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[10px] bg-zinc-950 p-2 rounded border border-zinc-850">
                        <div>
                          <span className="text-zinc-500 block">Agente Responsável</span>
                          <span className="font-bold text-blue-400">Agenda Inteligente</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block">Estudo de Impacto</span>
                          <span className="font-bold text-emerald-400">Garante Liberação Legal</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveDrawer("reagendar");
                          showToast("Handoff: EVA → Agenda Inteligente. Motivo: Resolver conflito de vistoria. Status: Em transferência.", "info");
                        }}
                        className="w-full text-[10.5px] font-bold uppercase bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 py-2 rounded transition-colors shadow-sm"
                      >
                        Reagendar Vistoria
                      </button>
                    </div>
                  </div>

                  {/* General mandatory microcopy */}
                  <div className="text-center bg-zinc-950 p-2.5 rounded border border-zinc-900 mt-4">
                    <p className="text-[9.5px] text-zinc-500">
                      “Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.”
                    </p>
                  </div>
                </div>
              )}

              {/* Sentinela de Riscos Drawer */}
              {activeDrawer === "evidencias" && (
                <div className="space-y-6">
                  {/* Risk Profile */}
                  <div className="p-4 rounded-xl bg-rose-950/25 border border-rose-800/40 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-rose-500" />
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-mono">Sentinela de Riscos</span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-100">Risco Principal: Atraso no Fornecimento de Aço CA-50</h3>
                    
                    <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] font-mono">
                      <div className="p-2 bg-zinc-900 rounded border border-rose-900/30">
                        <span className="text-zinc-500 block text-[9px]">SEVERIDADE</span>
                        <span className="text-rose-400 font-bold uppercase">Extrema</span>
                      </div>
                      <div className="p-2 bg-zinc-900 rounded border border-rose-900/30">
                        <span className="text-zinc-500 block text-[9px]">PRAZO GERAL</span>
                        <span className="text-rose-400 font-bold">+5 Dias Úteis</span>
                      </div>
                      <div className="p-2 bg-zinc-900 rounded border border-rose-900/30">
                        <span className="text-zinc-500 block text-[9px]">VALOR DESVIO</span>
                        <span className="text-rose-400 font-bold">R$ 1.250 FOB</span>
                      </div>
                    </div>
                  </div>

                  {/* Chain of evidences */}
                  <div className="space-y-3 font-sans">
                    <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-500">Cadeia de Evidências por Módulo</h4>
                    
                    <div className="rounded-lg bg-zinc-900 border border-zinc-800 divide-y divide-zinc-850">
                      <div className="p-3">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase font-mono block">Módulo WhatsApp (Suprimentos)</span>
                        <blockquote className="text-[11px] text-zinc-400 italic mt-1 leading-relaxed bg-zinc-950 p-2 rounded">
                          "Mestre de Obras Sérgio: 'Evandro, as barras de aço de 10mm acabaram ontem na pilha. Se a carga não descarregar até terça o pessoal dos estribos vai ficar parado no piquete...'"
                        </blockquote>
                      </div>
                      <div className="p-3">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase font-mono block">Módulo Nina Compras (Contratos)</span>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                          A cotação oficial Gerdau para 2.4 toneladas está aguardando retorno da mesa de faturamento há 72h.
                        </p>
                      </div>
                      <div className="p-3">
                        <span className="text-[10px] font-bold text-blue-400 uppercase font-mono block">Módulo Cronos Agenda (Físico)</span>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                          O cronograma indica vazamento de concreto agendado para o dia 12/Jun. Sem ferragens, a montagem sofrerá desvio crítico linear.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
                    <h4 className="text-xs font-bold text-zinc-300">Recomendação Sentinela:</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      "Acionar fornecedores locais rápidos com foco em lotes reduzidos (ex: Metalúrgica Sul) para prover batedor emergencial de aço no canteiro em 48 horas. Realocar a equipe de carpintaria para serviços de dutos pluviais provisórios."
                    </p>
                  </div>

                  {/* Interactive simulated plan checklist */}
                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
                    <h4 className="text-xs font-bold text-zinc-300">Plano de Mitigação Consolidado:</h4>
                    <div className="space-y-2.5">
                      {mitigacaoChecklist.map((item) => (
                        <label key={item.id} className="flex items-start gap-2.5 text-xs text-zinc-300 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            className="mt-0.5 focus:ring-0" 
                            checked={item.checked}
                            onChange={() => {
                              setMitigacaoChecklist(prev => 
                                prev.map(m => m.id === item.id ? { ...m, checked: !m.checked } : m)
                              );
                            }}
                          />
                          <span className={item.checked ? "line-through text-zinc-500" : ""}>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Mitigated outcome box */}
                  {riscoMitigado && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-xs"
                    >
                      <p className="font-bold text-emerald-400">✓ Plano Emergencial Iniciado</p>
                      <p className="text-zinc-400 mt-1">Dispare acionamentos dos agentes para sincronizar o canteiro!</p>
                    </motion.div>
                  )}

                  {/* Human validation controls */}
                  <div className="space-y-2.5 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => {
                          setActiveDrawer("cotacao");
                          showToast("Handoff: Sentinela → Nina Compras. Motivo: Acionamento de fornecedor rápido urgente.", "info");
                        }}
                        className="px-3 py-2 bg-transparent hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] uppercase font-bold text-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Acionar Nina
                      </button>
                      <button 
                        onClick={() => {
                          setActiveDrawer("reagendar");
                          showToast("Handoff: Sentinela → Agenda Inteligente. Motivo: Realocação de cronograma para contingência.", "info");
                        }}
                        className="px-3 py-2 bg-transparent hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] uppercase font-bold text-zinc-300 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Acionar Agenda
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        const todosMarcados = mitigacaoChecklist.every(t => t.checked);
                        if (!todosMarcados) {
                          showToast("Para mitigar o risco, marque as etapas do plano de mitigação primeiro!", "error");
                          return;
                        }
                        setRiscoMitigado(true);
                        showToast("Em desenvolvimento", "info");
                      }}
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] uppercase tracking-wider py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Criar Checklist de Mitigação Simulado
                    </button>
                  </div>

                  {/* General mandatory microcopy */}
                  <div className="text-center bg-zinc-950 p-2.5 rounded border border-zinc-900 mt-4">
                    <p className="text-[9.5px] text-zinc-500">
                      “Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.”
                    </p>
                  </div>
                </div>
              )}

              {/* Vera Financeira Drawer */}
              {activeDrawer === "financeiro" && (
                <div className="space-y-6">
                  {/* Financial Balance visual banner */}
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/35 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9.5px] bg-emerald-900 text-emerald-200 font-bold px-2 py-0.5 rounded font-mono tracking-wider">Vera Financeira</span>
                        <h4 className="text-sm font-bold text-zinc-100 mt-2">Caixa Projetada da Obra: R$ 15.200,00</h4>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold">Saldo Dinâmico</span>
                    </div>
                    {/* Visual Meter bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-zinc-500">
                        <span>Minimo Técnico: R$ 10K</span>
                        <span>Previsão de Receita: R$ 40K</span>
                      </div>
                      <div className="h-2 w-full bg-zinc-900 rounded-full border border-zinc-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "65%" }}></div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400">
                      Risco de Margem Estimada: <strong className="text-emerald-400 font-bold">-0.4% de Desvio Técnico (Margem Saudável)</strong>
                    </p>
                  </div>

                  {/* Tabs layout inside drawer */}
                  <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    <button 
                      onClick={() => setFinanceiroTab("fluxo")}
                      className={`flex-1 text-center py-1.5 rounded text-xs font-mono font-bold uppercase transition-all ${financeiroTab === "fluxo" ? "bg-zinc-800 text-emerald-400 border border-zinc-750" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                      Fluxo de Caixa
                    </button>
                    <button 
                      onClick={() => setFinanceiroTab("dre")}
                      className={`flex-1 text-center py-1.5 rounded text-xs font-mono font-bold uppercase transition-all ${financeiroTab === "dre" ? "bg-zinc-800 text-emerald-400 border border-zinc-750" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                      DRE Projetado
                    </button>
                  </div>

                  {/* Flow Tab content */}
                  {financeiroTab === "fluxo" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      {/* Vencimentos table */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">Próximos Vencimentos críticos</span>
                        <div className="rounded-lg bg-zinc-900 border border-zinc-800 divide-y divide-zinc-850">
                          <div className="p-3 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-zinc-200">Duplicata Votorantim CP-II</p>
                              <p className="text-[10px] text-zinc-500">Vence em 2 Dias • NF Suprimentos</p>
                            </div>
                            <span className="font-mono text-rose-400 font-bold">R$ 18.400,00</span>
                          </div>
                          <div className="p-3 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-zinc-200">Frete Emergencial Sul Logística</p>
                              <p className="text-[10px] text-zinc-500">Vence em 5 Dias • Transportadora</p>
                            </div>
                            <span className="font-mono text-zinc-300">R$ 1.250,00</span>
                          </div>
                        </div>
                      </div>

                      {/* Payables vs Receivables lists */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Contas a Pagar */}
                        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider font-mono block">Contas a Pagar (30 d)</span>
                          <div className="text-[11px] space-y-1 text-zinc-400">
                            <div className="flex justify-between">
                              <span>Empreiteiro Cimbramento</span>
                              <span className="font-mono">R$ 12.000</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Locação Equipamentos</span>
                              <span className="font-mono">R$ 4.500</span>
                            </div>
                          </div>
                        </div>
                        {/* Contas a Receber */}
                        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono block">Contas a Receber (30 d)</span>
                          <div className="text-[11px] space-y-1 text-zinc-400">
                            <div className="flex justify-between">
                              <span>Medição Liberada Pref.</span>
                              <span className="font-mono text-emerald-400">R$ 25.000</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Aditivo João Pedro</span>
                              <span className="font-mono text-emerald-400">R$ 12.000</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pending purchase requests impact block */}
                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">Impacto de Compras Pendentes (Nina):</span>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          A aprovação da cotação de vergalhão CA-50 em andamento consumirá <strong>R$ 3.200</strong> da reserva técnica.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* DRE Tab content */}
                  {financeiroTab === "dre" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 font-mono text-[11px] bg-zinc-950 p-4 border border-zinc-850 rounded-lg">
                      <div className="flex justify-between pb-1.5 border-b border-zinc-800">
                        <span className="text-zinc-500 uppercase font-bold text-[9px]">Rubrica Comercial</span>
                        <span className="text-zinc-500 uppercase font-bold text-[9px]">Valor Consolidado</span>
                      </div>
                      <div className="flex justify-between py-1 text-zinc-300">
                        <span>(+) Receita Bruta Homologada</span>
                        <span>R$ 648.000,00</span>
                      </div>
                      <div className="flex justify-between py-1 text-rose-400">
                        <span>(-) Custos de Insumos / Materiais</span>
                        <span>R$ 382.400,00</span>
                      </div>
                      <div className="flex justify-between py-1 text-rose-400">
                        <span>(-) Custos de Mão de Obra direta</span>
                        <span>R$ 145.000,00</span>
                      </div>
                      <div className="flex justify-between py-1 text-rose-400">
                        <span>(-) Impostos / Licenças Ambientais</span>
                        <span>R$ 18.200,00</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-t border-zinc-800 text-emerald-400 font-bold">
                        <span>(=) Lucratividade Lançada (EBITDA)</span>
                        <span>R$ 102.400,00 (15.8%)</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Interactive simulated reminders adding block */}
                  <div className="space-y-3 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">Lembretes Simulados de Pagamento</span>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Ex: Ligar cobrança prefeitura..."
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                        value={financeiroNovoLembrete}
                        onChange={(e) => setFinanceiroNovoLembrete(e.target.value)}
                      />
                      <button 
                        onClick={() => {
                          if (!financeiroNovoLembrete) return;
                          setFinanceiroLembretes(prev => [...prev, financeiroNovoLembrete]);
                          setFinanceiroNovoLembrete("");
                          showToast("Lembrete financeiro salvo com sucesso!", "success");
                        }}
                        className="px-3.5 bg-emerald-600 hover:bg-emerald-700 text-xs rounded border border-emerald-600 text-white font-bold cursor-pointer"
                      >
                        + Criar Lembrete
                      </button>
                    </div>

                    {financeiroLembretes.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {financeiroLembretes.map((lemb, idx) => (
                          <div key={idx} className="p-2 rounded bg-zinc-950 border border-zinc-850 flex items-center justify-between text-xs text-zinc-300">
                            <span>🔔 {lemb}</span>
                            <button 
                              onClick={() => {
                                setFinanceiroLembretes(prev => prev.filter((_, i) => i !== idx));
                                showToast("Lembrete removido.", "info");
                              }}
                              className="text-zinc-500 hover:text-zinc-300"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Optimization human consent */}
                  <div className="pt-3">
                    {financeiroOtimizado ? (
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-center text-xs text-emerald-400">
                        Compensação de aditivo com recebimento urgente agendado eletronicamente!
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setFinanceiroOtimizado(true);
                          showToast("Em desenvolvimento", "info");
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-wider py-2.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Consentir Compensação de Aditivos
                      </button>
                    )}
                  </div>

                  {/* General mandatory microcopy */}
                  <div className="text-center bg-zinc-950 p-2.5 rounded border border-zinc-900 mt-4">
                    <p className="text-[9.5px] text-zinc-500">
                      “Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.”
                    </p>
                  </div>
                </div>
              )}

              {/* Nina Compras Drawer */}
              {activeDrawer === "cotacao" && (
                <div className="space-y-6">
                  {/* Context Block */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <span className="text-[9px] bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                      Insumo Crítico • Nina Compras
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100">Cimento CP-II (150 sacos - 50kg)</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-zinc-400">
                      <div>Etapa da Obra: <strong>Superestrutura</strong></div>
                      <div>Prazo Limite: <strong>11/Jun/2026</strong></div>
                    </div>
                  </div>

                  {/* Fornecedores simulados e comparativo */}
                  <div className="space-y-3 font-sans">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-5 bg-emerald-600 rounded-sm flex items-center justify-center relative overflow-hidden shrink-0">
                           <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-400"></div>
                           <FileText className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider font-mono">Google Sheets Matrix</span>
                      </div>
                      <button 
                        onClick={() => setCotacaoComparativoAberto(!cotacaoComparativoAberto)}
                        className="text-[10px] text-amber-400 font-bold uppercase tracking-wider underline cursor-pointer hover:text-amber-300"
                      >
                        {cotacaoComparativoAberto ? "Ocultar Comparação" : "Ver Comparação"}
                      </button>
                    </div>

                    {/* Suppliers list */}
                    <div className="space-y-2.5">
                      {[
                        { id: "forn-1", name: "A. Votorantim Distribuidora", price: "R$ 5.700,00", time: "2 dias", confia: "Altíssima", risk: "Insipido", color: "text-emerald-400" },
                        { id: "forn-2", name: "B. Curitiba Atacado Comercial", price: "R$ 6.500,00", time: "Imediato", confia: "Média", risk: "Baixo", color: "text-amber-400" },
                        { id: "forn-3", name: "C. Lafarge Materiais Integrados", price: "R$ 5.850,00", time: "5 dias", confia: "Alta", risk: "Atraso no Tráfego", color: "text-rose-450" }
                      ].map(forn => {
                        const isSelected = cotacaoSelectedFornecedor === forn.id;
                        return (
                          <div 
                            key={forn.id} 
                            onClick={() => setCotacaoSelectedFornecedor(forn.id)}
                            className={`p-3.5 rounded-lg border transition-all cursor-pointer select-none space-y-2 ${isSelected ? "bg-zinc-900 border-amber-500 shadow-lg" : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"}`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-zinc-150 flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? "bg-amber-500 animate-pulse" : "bg-zinc-700"}`}></span>
                                {forn.name}
                              </span>
                              <span className={`text-xs font-mono font-bold ${forn.color}`}>{forn.price}</span>
                            </div>

                            {/* Metrics show on open comparativo */}
                            {cotacaoComparativoAberto && (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-2 text-[10px] bg-zinc-950 p-2 rounded border border-zinc-850 text-zinc-400 font-mono">
                                <div>
                                  <span className="text-zinc-600 block">Tempo de Entrega</span>
                                  <span className="font-bold text-zinc-300">{forn.time}</span>
                                </div>
                                <div>
                                  <span className="text-zinc-600 block">Índice Confiabilidade</span>
                                  <span className="font-bold text-zinc-300">{forn.confia}</span>
                                </div>
                                <div>
                                  <span className="text-zinc-600 block">Fator de Risco IA</span>
                                  <span className="font-bold text-rose-400">{forn.risk}</span>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                    {/* Premium Blocked Agent Section */}
                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2">
                       <span className="text-[8px] bg-emerald-900/50 text-emerald-400 font-bold px-1.5 py-0.5 rounded font-mono uppercase border border-emerald-500/30">
                         Add-on Disponível (Premium)
                       </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider font-mono">Agent de Negociação Automática</h4>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-relaxed max-w-[85%]">
                      Deixe a Nina Compras negociar ativamente com os fornecedores por e-mail e WhatsApp buscando descontos de volume, reduzindo em média 8% dos custos.
                    </p>
                    {/* Preview disabled */}
                    <div className="bg-zinc-950 p-2 text-[9px] text-zinc-500 border border-zinc-800 rounded flex flex-col gap-1 opacity-70">
                       <div className="flex justify-between items-center"><span className="text-zinc-400 font-bold">Nina (IA):</span> "Consegue cobrir R$ 5.700 no CP-II para fecharmos hoje?"</div>
                       <div className="flex justify-between items-center"><span className="text-zinc-600">Votorantim (Simulado):</span> "Fechamos em R$ 5.600 no pix."</div>
                    </div>
                    <button 
                      onClick={() => showToast("Ação bloqueada: Requer integração real e plano de Agentes Premium.", "error")}
                      className="w-full mt-2 bg-gradient-to-r from-emerald-900/40 to-emerald-800/40 hover:from-emerald-800/60 hover:to-emerald-700/60 border border-emerald-700/50 text-emerald-300 font-bold text-[10px] uppercase tracking-wider py-2 rounded transition-colors cursor-pointer"
                    >
                      Fazer Upgrade / Ativar Agente de Negociação
                    </button>
                  </div>

                  {/* Solicitacao detail info */}
                  {cotacaoSolicitacaoSimulada && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400">
                      <p className="font-bold text-zinc-200 uppercase text-[9px] font-mono">Solicitação Gerada Coletivamente:</p>
                      <p className="mt-1">
                        Código: <strong className="text-amber-400">NIN-REQ-7320</strong> faturado para simulação de fluxo. Integração com ERP realizada com sucesso.
                      </p>
                    </motion.div>
                  )}

                  {/* Action buttons */}
                  <div className="space-y-2.5 pt-2">
                    <button 
                      onClick={() => {
                        if (!cotacaoSelectedFornecedor) {
                          showToast("Por favor, selecione um fornecedor para simular a solicitação!", "error");
                          return;
                        }
                        setCotacaoSolicitacaoSimulada(true);
                        showToast("Solicitação de cotação simulada gerada no painel de compras!", "success");
                      }}
                      className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-mono text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg border border-zinc-800 cursor-pointer"
                    >
                      Gerar Solicitação Simulada
                    </button>

                    {cotacaoFinalizada ? (
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-center text-xs text-emerald-400">
                        Aprovado: Ordem de fornecimento simulada repassada ao comercial com sucesso!
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-200 cursor-pointer">
                          <input type="checkbox" id="human-confirm-cotacao" className="h-4 w-4 rounded bg-zinc-900 border-zinc-700 accent-amber-500" />
                          <span>Atesto a escolha do fornecedor e permito prosseguimento.</span>
                        </label>
                        <button 
                          onClick={() => {
                            if (!cotacaoSelectedFornecedor) {
                              showToast("Atenção: Selecione a proposta do fornecedor recomendada!", "error");
                              return;
                            }
                            const ck = document.getElementById("human-confirm-cotacao") as HTMLInputElement;
                            if (ck && !ck.checked) {
                              showToast("Atenção: Você precisa atestar a escolha do fornecedor comercialmente!", "error");
                              return;
                            }
                            setCotacaoFinalizada(true);
                            showToast("Em desenvolvimento", "info");
                          }}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] uppercase tracking-wider py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Enviar Para Aprovação Comercial
                        </button>
                      </div>
                    )}
                  </div>

                  {/* General mandatory microcopy */}
                  <div className="text-center bg-zinc-950 p-2.5 rounded border border-zinc-900 mt-4">
                    <p className="text-[9.5px] text-zinc-500">
                      “Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.”
                    </p>
                  </div>
                </div>
              )}

              {/* Dora Documentos Drawer */}
              {activeDrawer === "classificacao" && (
                <div className="space-y-6">
                  <div className="p-1 px-3 rounded bg-zinc-900 border border-zinc-800">
                    <p className="text-xs text-zinc-400 py-2 font-sans">
                      Dora Documentos realizou a leitura OCR do Google Drive corporativo da Curitiba Construtora. Clique nas fichas para revisar as classificações ou aplicar sigilos.
                    </p>
                  </div>

                  {/* Simulated Google Drive Context Header */}
                  <div className="bg-slate-50 dark:bg-zinc-800 rounded-lg p-3 border border-slate-200 dark:border-zinc-700 flex items-center justify-between mb-4 shadow-sm">
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded bg-white flex items-center justify-center relative overflow-hidden shadow-sm shrink-0">
                          {/* Triangle Google Drive Logo Mock */}
                          <div className="absolute right-1 bottom-1 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-blue-600"></div>
                          <div className="absolute left-1 bottom-1 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-green-600 rotate-[60deg]"></div>
                          <div className="absolute top-1 left-[10px] w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-yellow-500 rotate-[-60deg]"></div>
                       </div>
                       <div>
                         <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 block font-mono">INTEGRAÇÃO SIMULADA</span>
                         <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">Google Drive Corporativo</span>
                       </div>
                    </div>
                    <span className="text-[9px] bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-zinc-400 px-2 py-0.5 rounded font-bold uppercase">Sincronizado</span>
                  </div>

                  {/* Simulated Files Grid List */}
                  <div className="space-y-3 font-sans">
                    <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-500">Documentação Triada</h4>

                    {[
                      { id: "doc-1", name: "nota_fiscal_votorantim_curit_73.pdf", type: "Nota Fiscal / Suprimentos", confidence: "98%", bounds: "Cimento CP-II" },
                      { id: "doc-2", name: "alvara_construcao_kairo_rev.pdf", type: "Alvarás e Licenças Fiscais", confidence: "92%", bounds: "Residencial Kairós" },
                      { id: "doc-3", name: "contrato_parceria_eng_bert.pdf", type: "Contratos de Parcerias", confidence: "94%", bounds: "Parcerias Engenheiros" }
                    ].map(doc => {
                      const isApproved = documentosClassificados.includes(doc.id);
                      const isSensitive = doraDocumentosSensitivas.includes(doc.id);
                      return (
                        <div 
                          key={doc.id}
                          className={`p-3.5 rounded-lg border transition-all ${isSensitive ? "border-amber-500/60 bg-amber-950/10" : "bg-zinc-900 border-zinc-800"} space-y-2`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="overflow-hidden mr-4">
                              <span className="text-xs font-bold text-zinc-200 block truncate">{doc.name}</span>
                              <span className="text-[10px] text-zinc-500 block mt-0.5">
                                Confiança OCR: <strong className="text-emerald-400 font-mono">{doc.confidence}</strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {isSensitive && <span className="text-[8px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">🔒 Sensível</span>}
                              {isApproved && <span className="text-[8px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">✓ Pronto</span>}
                            </div>
                          </div>

                          <div className="text-[11px] text-zinc-400 flex flex-wrap gap-2 pt-1 font-mono">
                            <span className="bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-850">Classificação sugerida: <strong>{doc.type}</strong></span>
                            <span className="bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-850">Vinculado a: <strong>{doc.bounds}</strong></span>
                          </div>

                          {/* Quick Interactive Actions */}
                          <div className="flex gap-2 pt-2 border-t border-zinc-800/40">
                            <button 
                              onClick={() => {
                                setDoraManualReviewDoc(doc);
                                showToast(`Carregando editor manual para ${doc.name}`, "info");
                              }}
                              className="px-2 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded text-[10px] font-bold text-zinc-400 cursor-pointer"
                            >
                              Revisar Manualmente
                            </button>
                            <button 
                              onClick={() => {
                                setDoraDocumentosSensitivas(prev => 
                                  prev.includes(doc.id) ? prev.filter(id => id !== doc.id) : [...prev, doc.id]
                                );
                                showToast(isSensitive ? "Documento marcado como Geral" : "Documento marcado como Sensível!", "warning");
                              }}
                              className="px-2 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-700 rounded text-[10px] font-bold text-amber-500 cursor-pointer ml-auto"
                            >
                              {isSensitive ? "Remover Sensibilidade" : "Marcar como Sensível"}
                            </button>
                            {!isApproved && (
                              <button 
                                onClick={() => {
                                  setDocumentosClassificados(prev => [...prev, doc.id]);
                                  showToast("Aprovado metadado OCR!", "success");
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Confirmar Classificação
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Manual Review Panel Details */}
                  {doraManualReviewDoc && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3.5"
                    >
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                        <span className="text-xs font-mono font-bold text-zinc-200 uppercase">Ajuste de Metadados Dora</span>
                        <button onClick={() => setDoraManualReviewDoc(null)} className="text-zinc-500 hover:text-zinc-300">✕</button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 block uppercase font-mono">Nome do Arquivo</label>
                          <input type="text" readOnly value={doraManualReviewDoc.name} className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-zinc-300 focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-500 block uppercase font-mono">Tipo Documental Classificado</label>
                          <input 
                            type="text" 
                            defaultValue={doraManualReviewDoc.type} 
                            id="edit-manual-doc-type"
                            className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500" 
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          const val = (document.getElementById("edit-manual-doc-type") as HTMLInputElement)?.value;
                          setDocumentosClassificados(prev => [...prev, doraManualReviewDoc.id]);
                          showToast(`Metadado manual para ${doraManualReviewDoc.name} ajustado para: ${val}!`, "success");
                          setDoraManualReviewDoc(null);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] uppercase font-bold py-2 rounded-lg cursor-pointer"
                      >
                        Salvar e Classificar Metadado
                      </button>
                    </motion.div>
                  )}

                  <div className="text-center font-mono text-[10px] text-zinc-500">
                    Triagem Total: {documentosClassificados.length} de 3 arquivos confirmados pelo humano.
                  </div>

                  {/* General mandatory microcopy */}
                  <div className="text-center bg-zinc-950 p-2.5 rounded border border-zinc-900 mt-4">
                    <p className="text-[9.5px] text-zinc-500">
                      “Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.”
                    </p>
                  </div>
                </div>
              )}

              {/* Agenda Inteligente / Reagendar Drawer or Modal */}
              {activeDrawer === "reagendar" && (
                <div className="space-y-6">
                  {/* Active conflict illustration */}
                  <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/35 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <AgentIcon role="Agenda Inteligente IA" className="h-4 w-4 text-red-400" />
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider font-mono">Agenda Inteligente IA</span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100">Alerta de Conflito Crítico Detectado</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      "A <strong>Medição de Alvenaria Estrutural</strong> ocorre no mesmo horário da <strong>Vistoria Pública Ambiental</strong> da Prefeitura no Residencial Kairós."
                    </p>
                    <div className="p-2.5 bg-zinc-950 rounded border border-zinc-850 text-xs space-y-1 text-zinc-400">
                      <div>Conflito Atual: <strong>Segunda-feira, 08/Jun às 10:00</strong></div>
                      <div>Responsáveis em conflito: <strong>Sérgio Almeida (Mestre), Eng. Evandro</strong></div>
                    </div>
                  </div>

                  {/* Suggested rescheduling option detail */}
                  <div className="space-y-3 font-sans">
                    <h4 className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-500">Opções Inteligentes Sugeridas (Evita Perdas)</h4>
                    
                    <div className="rounded-lg bg-zinc-900 border border-zinc-800 p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                        <span className="text-xs font-bold text-zinc-200">Terça-Feira, 09 de Junho ás 14:00</span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-400 font-bold px-1.5 py-0.5 rounded">RECOMENDADO</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Análise de meteorologistas aponta tempo estável de Sol. O Engenheiro Evandro estará livre e o mestre Sérgio poderá liderar a vistoria municipal.
                      </p>
                      
                      {vistoriaReagendada ? (
                        <div className="p-2 text-center bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded">
                          ✓ Reagendamento Simulador Aprovado sob o Google Calendar corporativo da Obra.
                        </div>
                      ) : (
                        <div className="space-y-3 pt-2 border-t border-zinc-800">
                          <label className="flex items-center gap-2 text-xs font-bold text-zinc-200 cursor-pointer">
                            <input type="checkbox" id="human-confirm-reagendar" className="h-4 w-4 rounded bg-zinc-900 border-zinc-700 accent-blue-500" />
                            <span>Confirmo o reagendamento simulado do calendário.</span>
                          </label>
                          <button 
                            onClick={() => {
                              const ck = document.getElementById("human-confirm-reagendar") as HTMLInputElement;
                              if (ck && !ck.checked) {
                                showToast("Para reagendar, confirme a alteração primeiro!", "error");
                                return;
                              }
                              setVistoriaReagendada(true);
                              showToast("Agenda simulada reagendada com sucesso!", "success");
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10.5px] uppercase tracking-wider py-2 rounded-lg cursor-pointer"
                          >
                            Confirmar Reagendamento Simulado
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactive Agenda Blocks */}
                  <div className="space-y-2 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">Visualizar Calendário Semanal slots</span>
                      <button 
                        onClick={() => setAgendaVisualSlotsAberta(!agendaVisualSlotsAberta)}
                        className="text-[10px] text-blue-400 underline uppercase"
                      >
                        {agendaVisualSlotsAberta ? "Ocultar Agenda" : "Exibir Slots Livres"}
                      </button>
                    </div>

                    {agendaVisualSlotsAberta && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 space-y-2">
                        {/* Google Calendar Visual Header */}
                        <div className="bg-white dark:bg-zinc-950 rounded-lg p-2.5 border border-slate-200 dark:border-zinc-800 flex items-center gap-2">
                           <div className="h-6 w-6 bg-white rounded shadow-sm flex flex-col items-center justify-center border border-slate-100 overflow-hidden shrink-0">
                               <div className="h-2 w-full bg-blue-500"></div>
                               <span className="text-[10px] font-bold text-slate-700 leading-none mt-0.5">09</span>
                           </div>
                           <div className="flex-1">
                             <span className="text-[9px] font-bold text-blue-500 dark:text-blue-400 block uppercase tracking-wider font-mono">Google Calendar Simul.</span>
                             <span className="text-[10px] text-slate-600 dark:text-zinc-400">Verificando conflitos...</span>
                           </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[10px] text-center font-mono">
                          <div className="p-2 border border-rose-900 rounded bg-rose-950/25 text-rose-300">Seg 10h: Ocupado</div>
                          <div className="p-2 border border-zinc-800 rounded bg-zinc-950 text-zinc-500">Ter 09h: Ocupado</div>
                          <div className="p-2 border border-blue-900 rounded bg-blue-950/40 text-blue-300 font-bold shadow-lg shadow-blue-500/10">Ter 14h: Disponível</div>
                          <div className="p-2 border border-blue-900 rounded bg-blue-950/25 text-blue-300 hover:bg-blue-900/40 cursor-pointer transition-colors">Qua 10h: Disponível</div>
                          <div className="p-2 border border-zinc-800 rounded bg-zinc-950 text-zinc-500">Qua 15h: Ocupado</div>
                          <div className="p-2 border border-blue-900 rounded bg-blue-950/25 text-blue-300 hover:bg-blue-900/40 cursor-pointer transition-colors">Qui 11h: Disponível</div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Warning label */}
                  <div className="p-3 bg-zinc-950 border border-zinc-900 rounded text-center">
                    <p className="text-[10px] text-zinc-500 italic">
                      "Aviso importante: Este é um ambiente puramente simulado para testes corporativos. Não enviaremos convites reais."
                    </p>
                  </div>

                  {/* General mandatory microcopy */}
                  <div className="text-center bg-zinc-950 p-2.5 rounded border border-zinc-900 mt-4">
                    <p className="text-[9.5px] text-zinc-500">
                      “Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.”
                    </p>
                  </div>
                </div>
              )}

              {/* Ficha Completa da Obra Drawer */}
              {activeDrawer === "ficha" && (
                <div className="space-y-4 font-sans">
                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
                    <span className="text-[9px] bg-zinc-950 text-zinc-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono block w-fit">Consolidado Técnico de Engenharia</span>
                    <h4 className="text-xs font-bold text-zinc-200 pb-1.5 border-b border-zinc-855 uppercase tracking-wider font-mono">Cadastro de Obra EVIS</h4>
                    
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-zinc-850/40">
                        <span className="text-zinc-500 font-medium">Nome Executivo</span>
                        <span className="font-bold text-zinc-300">{project.name}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-850/40">
                        <span className="text-zinc-500 font-medium">Localização Climatológica</span>
                        <span className="font-bold text-zinc-300">{project.location}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-850/40">
                        <span className="text-zinc-500 font-medium">Engenheiro Geral</span>
                        <span className="font-bold text-zinc-300">{project.manager || "Evandro (CREA-PR)"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-850/40">
                        <span className="text-zinc-500 font-medium">Cliente Autorizado</span>
                        <span className="font-bold text-zinc-300">{project.type === "Refurbish" ? "Curitiba Corporate" : "João Pedro Silva"}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-850/40">
                        <span className="text-zinc-500 font-medium">Orçamento Global Estimado</span>
                        <span className="font-bold text-emerald-400">{project.type === "Refurbish" ? "R$ 4.850.000" : "R$ 648.000"}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-500 font-medium">Prazo Contratual Término</span>
                        <span className="font-bold text-zinc-300">15 de Agosto de 2026</span>
                      </div>
                    </div>
                  </div>

                  {/* Integração Google Maps - Localização da Obra */}
                  <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-400" />
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider font-mono block">Google Maps • Localização Operacional</span>
                    </div>
                    {/* Simulated Map Viewport */}
                    <div className="w-full h-32 bg-zinc-950 rounded-lg border border-zinc-800 relative overflow-hidden flex items-center justify-center">
                       {/* Abstract Map UI background (grid pattern) */}
                       <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#3f3f46 1px, transparent 1px)", backgroundSize: "12px 12px", opacity: 0.2 }}></div>
                       
                       <div className="relative z-10 flex flex-col items-center gap-1.5">
                         <div className="h-8 w-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center shadow-lg shadow-blue-500/20 relative">
                            <span className="absolute h-full w-full rounded-full bg-blue-400 animate-ping opacity-30"></span>
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                         </div>
                         <span className="text-[10px] bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded shadow-xl font-mono text-zinc-300">
                           {project.location} (Lat: -25.42, Lng: -49.27)
                         </span>
                       </div>
                    </div>
                    <p className="text-[9.5px] text-zinc-500 text-center">
                       Visualização dinâmica do terreno e rotas de suprimentos ativada para frota.
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      const dataStr = `Obra: ${project.name}\nEndereço: Curitiba - PR ${project.location}\nEng: ${project.manager || "Evandro"}\nOrcamento: R$ 648.000`;
                      navigator.clipboard.writeText(dataStr);
                      showToast("Dados completos em texto copiado para o clipboard!", "success");
                    }}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-[10.5px] uppercase font-bold tracking-wider py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-zinc-700"
                  >
                    <Copy className="h-3.5 w-3.5" /> Copiar Ficha Cadastral em Linhas
                  </button>
                </div>
              )}

              {/* WhatsApp Assistant / Maestro Operacional Drawer or Modal */}
              {activeDrawer === "whatsapp" && (
                <div className="space-y-6">
                  {/* Select Recipient */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3.5 font-sans">
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono block w-fit">
                      Maestro Operacional • Mensagem para Equipe
                    </span>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 font-mono">Selecione o Destinatário da Ouvidoria</label>
                      <select 
                        value={wappSelectedContact}
                        onChange={(e) => {
                          setWappSelectedContact(e.target.value);
                          setWappMessageText(""); // Reset text to load appropriate template
                        }}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Sérgio Almeida (Mestre)">Sérgio Almeida (Mestre de Obras)</option>
                        <option value="João Pedro Silva (Cliente)">João Pedro Silva (Cliente Contratante)</option>
                        <option value="Engenheiro Evandro (Coordenador)">Engenheiro Evandro (Coordenador Técnico)</option>
                        <option value="Gustavo Faturista (Setor Compras)">Gustavo Faturista (Setor Compras)</option>
                      </select>
                    </div>
                  </div>

                  {/* Pre-filled Message based on selection */}
                  <div className="space-y-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono block mb-1">
                          Canal Recomendado IA
                       </label>
                       {/* Gmail Badge Mock */}
                       {wappSelectedContact.includes("Cliente") || wappSelectedContact.includes("Coordenador") ? (
                         <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded border border-rose-200 dark:border-rose-900 absolute right-6">
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 capitalize">Gmail</span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-900 absolute right-6">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 capitalize">WhatsApp</span>
                         </div>
                       )}
                    </div>
                    <textarea 
                      rows={5}
                      className="w-full bg-zinc-950 border border-zinc-750 rounded p-2.5 text-xs text-zinc-250 focus:outline-none focus:border-emerald-500"
                      placeholder="Redija uma mensagem..."
                      value={wappMessageText || (
                        wappSelectedContact.includes("Sérgio") ? 
                        `Mestre Sérgio, referente ao lote de Cimento CP-II em cotação na Votorantim para amanhã: você confirma se o canteiro de insumos da obra ${project.name} já foi limpo e desobstruído para a descarga do lote do fornecedor de cimento hoje?` :
                        wappSelectedContact.includes("João Pedro") || wappSelectedContact.includes("Cliente") ? 
                        `Prezado João Pedro, aqui é o setor técnico do EVIS. Elaboramos o rascunho triado do seu Diário Informativo de Obra RDO de hoje. Identificamos conformidade nas fôrmas estruturais do pavimento.` :
                        wappSelectedContact.includes("Evandro") ? 
                        `Engenheiro Evandro, compilamos uma indisponibilidade no Google Calendar entre a medição e a vistoria de licenciamento. Conseguimos reagendar a vistoria para amanhã às 14:00?` :
                        `Gustavo, favor realizar a auditoria financeira da fatura de cimento CP-II no valor de R$ 5.700. Boleto correspondente vence em 2 dias.`
                      )}
                      onChange={(e) => setWappMessageText(e.target.value)}
                    />
                  </div>

                  {/* Warning advisory */}
                  <div className="p-3 bg-zinc-950 border border-zinc-900 rounded text-center">
                    <p className="text-[10px] text-amber-500 font-bold italic">
                      "Aviso importante: Este canal simula e prepara o esboço de comunicação com a equipe para a mesa de governança. Nenhuma mensagem externa WhatsApp real é enviada nesta fase."
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="space-y-2.5">
                    <button 
                      onClick={() => {
                        const defaultText = wappSelectedContact.includes("Sérgio") ? 
                          `Mestre Sérgio, referente ao lote de Cimento CP-II em cotação na Votorantim para amanhã: você confirma se o canteiro de insumos da obra ${project.name} já foi limpo e desobstruído para a descarga do lote do fornecedor de cimento hoje?` :
                          wappSelectedContact.includes("João") ? 
                          `Prezado João Pedro, aqui é o setor técnico do EVIS. Elaboramos o rascunho triado do seu Diário Informativo de Obra RDO de hoje. Identificamos conformidade nas fôrmas estruturais do pavimento.` :
                          wappSelectedContact.includes("Evandro") ? 
                          `Engenheiro Evandro, compilamos uma indisponibilidade no Google Calendar entre a medição e a vistoria de licenciamento. Conseguimos reagendar a vistoria para amanhã às 14:00?` :
                          `Gustavo, favor realizar a auditoria financeira da fatura de cimento CP-II no valor de R$ 5.700. Boleto correspondente vence em 2 dias.`;
                        const textToWrite = wappMessageText || defaultText;
                        navigator.clipboard.writeText(textToWrite);
                        showToast("Mensagem copiada para transferência com sucesso!", "success");
                      }}
                      className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-mono text-[10.5px] font-bold uppercase tracking-wider py-2 rounded-lg border border-zinc-800 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5 text-zinc-400" /> Copiar Esboço para Clipboard
                    </button>

                    <button 
                      onClick={() => {
                        showToast("Em desenvolvimento", "info");
                        setTimeout(() => {
                          showToast("Em desenvolvimento", "info");
                          setActiveDrawer(null);
                        }, 1200);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-wider py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" /> Preparar Envio Simulado via WhatsApp
                    </button>
                  </div>

                  {/* General mandatory microcopy */}
                  <div className="text-center bg-zinc-950 p-2.5 rounded border border-zinc-900 mt-4">
                    <p className="text-[9.5px] text-zinc-500">
                      “Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.”
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer containing specific prompt banner and copyright */}
            <div className="p-4 border-t border-zinc-800 bg-zinc-900 text-center shrink-0">
              <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-widest">
                EVIS • Curitiba Construtora ERP/CRM • Gestão Comercial
              </span>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
}


