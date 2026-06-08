import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Send, CheckCircle2, Sparkles, FolderKanban, 
  CheckSquare, MessageSquare, Phone, CircleDashed, 
  Users, Settings, Search, MoreVertical, Paperclip, 
  Mic, Smile, ChevronRight, Briefcase, QrCode, MonitorSmartphone
} from "lucide-react";
import { useApp } from "../../context/AppContext";

interface WhatsAppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppWebBridge() {
  const [status, setStatus] = useState("DISCONNECTED");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp/status");
      const data = await res.json();
      setStatus(data.status);
      setQrCode(data.qrCode || "");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setStatus("INITIALIZING");
    try {
      await fetch("/api/whatsapp/start", { method: "POST" });
    } catch(err) {
      console.log(err);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 w-full h-full bg-[#111b21] relative flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center text-center p-8 bg-[#202c33] rounded-2xl max-w-lg border border-[#2a3942]">
        <div className="w-16 h-16 rounded-full bg-[#00a884]/10 flex items-center justify-center mb-6">
          <MonitorSmartphone className="h-8 w-8 text-[#00a884]" />
        </div>
        <h2 className="text-[#e9edef] text-xl font-bold mb-3">Conexão WhatsApp Servidor</h2>
        
        {status === "DISCONNECTED" && (
          <>
            <p className="text-[#aebac1] mb-6 leading-relaxed text-sm">
              Conecte o celular corporativo da obra para que a IA (Lia) possa escutar, extrair tarefas, materiais e registrar diários automaticamente.
            </p>
            <button 
              onClick={handleConnect}
              disabled={loading}
              className="bg-[#00a884] hover:bg-[#029072] disabled:opacity-50 text-[#111b21] px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
            >
              🚀 Conectar Celular da Obra
            </button>
          </>
        )}

        {status === "INITIALIZING" && (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#aebac1] text-sm">Iniciando motor Chrome local. Aguarde o QR Code...</p>
          </div>
        )}

        {status === "QR_READY" && (
          <div className="flex flex-col items-center">
            <p className="text-[#e9edef] bg-emerald-900/40 border border-emerald-500/50 px-4 py-2 rounded-lg font-mono text-sm mb-4">
              Escaneie o QR Code abaixo com seu WhatsApp
            </p>
            {qrCode && (
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <img src={qrCode} alt="QR Code WhatsApp" className="w-64 h-64 mx-auto" />
              </div>
            )}
            <p className="text-[#aebac1] mt-4 text-xs">O QR code recarrega automaticamente.</p>
          </div>
        )}

        {status === "CONNECTED" && (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-[#00a884]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aparelho Escutando...</h3>
            <p className="text-[#aebac1] text-sm max-w-sm">
              A inteligência EVIS LIA agora está monitorando as conversas, escutando áudios e gerando insights em background (Cron Ativo).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface AiCategorization {
  intent: string;
  actionRequired: string;
  project?: string;
  confidence: number;
}

interface Message {
  id: string;
  text: string;
  sender: "me" | "client";
  timestamp: string;
  status: "sent" | "delivered" | "read";
  aiAnalysis?: AiCategorization;
}

interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  isGroup?: boolean;
  project?: string;
}

const mockChats: Chat[] = [
  { id: "whatsapp-real", name: "WhatsApp Servidor (DB)", lastMessage: "Mensagens reais do cliente rodando no server...", time: "Agora", unread: 0, project: "Geral" },
  { id: "1", name: "Evandro - Berti Construtora", lastMessage: "Olá! Tenho interesse nos seguin...", time: "01:50", unread: 2, project: "Residencial Berti" },
  { id: "2", name: "Sérgio (Mestre de Obras)", lastMessage: "▶ Áudio (0:15) - Concretagem...", time: "11:27", unread: 1, project: "Residencial Berti" },
  { id: "3", name: "Reginaldo - Cliente Alphaville", lastMessage: "Fala Evandro de boa assinatura", time: "12:37", unread: 0, project: "Obra Alphaville" },
  { id: "4", name: "Fornecedor Elétrica", lastMessage: "Material chegou na obra.", time: "Ontem", unread: 0, project: "Obra Centro" },
];

export default function WhatsAppDrawer({ isOpen, onClose }: WhatsAppDrawerProps) {
  const [activeChatId, setActiveChatId] = useState<string>("3");
  const [aiSidebarOpen, setAiSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<"api_custom" | "web_bridge">("api_custom");
  const { setTasks, showToast, obras } = useApp();
  
  const allMessages: Record<string, Message[]> = {
    "3": [
      {
        id: "1",
        text: "Já faz agora de manhã",
        sender: "client",
        timestamp: "06:51",
        status: "read",
      },
      {
        id: "2",
        text: "Evandro conseguiu fazer",
        sender: "client",
        timestamp: "12:07",
        status: "read",
      },
      {
        id: "3",
        text: "Fala Evandro de boa assinatura do contrato aditivo? Consegue agilizar as correções do material elétrico para a obra do Alphaville?",
        sender: "client",
        timestamp: "12:37",
        status: "read",
        aiAnalysis: {
          intent: "Cobrança de Contrato e Suprimentos",
          actionRequired: "Gerar Aditivo e Revisar Lista Elétrica",
          project: "Obra Alphaville",
          confidence: 0.94
        }
      },
      {
        id: "4",
        text: "Boa tarde Reginaldo! Sim, já estou com o aditivo na mesa. Sobre o material elétrico, a equipe de compras já fez a troca com o fornecedor.",
        sender: "me",
        timestamp: "13:35",
        status: "read",
      }
    ],
    "2": [
      {
        id: "10",
        text: "▶ Mensagem de Áudio (0:15)",
        sender: "client",
        timestamp: "11:27",
        status: "read",
        aiAnalysis: {
          intent: "Atualização de Diário de Obra",
          actionRequired: "Avançar Etapa: Concretagem Bloco B concluída",
          project: "Residencial Berti",
          confidence: 0.98
        }
      }
    ]
  };

  const [messages, setMessages] = useState<Message[]>([]);
  const [realMessages, setRealMessages] = useState<any[]>([]);

  // Fetch real messages from backend
  useEffect(() => {
    const fetchRealMessages = async () => {
      try {
        const res = await fetch("/api/whatsapp/messages");
        const data = await res.json();
        setRealMessages(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRealMessages();
    const interval = setInterval(fetchRealMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // If we have real DB messages, format them and prepend simulated
    if (activeChatId === "whatsapp-real") {
       const formattedReal: Message[] = realMessages.map((m: any, i) => ({
         id: `real_${i}`,
         text: m.body,
         sender: m.sender === "me" ? "me" : "client",
         timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
         status: "read"
       }));
       setMessages(formattedReal);
    } else {
      if (allMessages[activeChatId]) {
        setMessages(allMessages[activeChatId]);
      } else {
        setMessages([]);
      }
    }
  }, [activeChatId, realMessages]);
  const [inputValue, setInputValue] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const activeChat = mockChats.find(c => c.id === activeChatId) || mockChats[0];

  useEffect(() => {
    if (isOpen) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, activeChatId]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const newMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate flow
    setTimeout(() => {
      setMessages((prev) => prev.map(m => m.id === newMessage.id ? { ...m, status: "delivered" } : m));
    }, 1000);

    setTimeout(() => {
      setMessages((prev) => prev.map(m => m.id === newMessage.id ? { ...m, status: "read" } : m));
    }, 2000);

    try {
      const response = await fetch("/api/ai/whatsapp/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: activeChat.id,
          name: activeChat.name,
          text: userText,
          contextObras: "Residencial Berti, Obra Alphaville, Obra Centro"
        })
      });

      const data = await response.json();
      
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.suggestedReply || "Entendido.",
        sender: "client",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: "read",
        aiAnalysis: {
          intent: data.intent || "DUVIDA_GERAL",
          actionRequired: data.extractedData?.task_title || data.systemAction || "",
          project: data.extractedData?.project_name || activeChat.project || "Geral",
          confidence: data.confidence || 0.90
        }
      };
      
      setTimeout(() => {
        setMessages((prev) => [...prev, replyMessage]);
      }, 3500);

    } catch (err) {
      console.error("Erro ao analisar mensagem com IA", err);
    }
  };

  const executeAction = (aiAnalysis: AiCategorization) => {
    let project = obras.find(o => o.name.toLowerCase().includes(aiAnalysis.project?.toLowerCase() || "")) || obras[0];

    if (aiAnalysis.actionRequired.toLowerCase().includes("tarefa") || aiAnalysis.actionRequired.toLowerCase().includes("gerar aditivo") || aiAnalysis.actionRequired.toLowerCase().includes("revisar")) {
      const newTask = {
        id: `tsk_ai_${Date.now()}`,
        title: aiAnalysis.actionRequired,
        category: "Progresso" as const,
        priority: "Alta" as const,
        dueDate: new Date().toISOString().split("T")[0],
        assignee: "Equipe EVIS",
        status: "Pendente" as const,
        project: project.id
      };
      setTasks(prev => [newTask, ...prev]);
      showToast(`Ambiente simulado: Nenhuma ação real. Tarefa '${newTask.title}' simulada!`, "success");
    } else {
      showToast(`Ação registrada: ${aiAnalysis.actionRequired}`, "info");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 md:p-8">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full h-full max-w-[1600px] bg-[#111b21] rounded-2xl shadow-2xl overflow-hidden flex border border-[#2a3942]"
          >
            {/* Nav Rail (Far Left) */}
            <div className="w-16 bg-[#202c33] flex flex-col items-center py-4 border-r border-[#2a3942] shrink-0 justify-between relative z-20">
              <div className="flex flex-col gap-6 w-full items-center">
                <button 
                  onClick={() => setViewMode("api_custom")}
                  className={`p-3 rounded-full cursor-pointer transition-colors ${viewMode === "api_custom" ? "bg-[#374248] text-[#e9edef]" : "text-[#aebac1] hover:bg-[#374248]"}`}
                  title="Interface Customizada (API)"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setViewMode("web_bridge")}
                  className={`p-3 rounded-full cursor-pointer transition-colors ${viewMode === "web_bridge" ? "bg-[#374248] text-[#e9edef]" : "text-[#aebac1] hover:bg-[#374248]"}`}
                  title="WhatsApp Web Embutido (WebBridge)"
                >
                  <MonitorSmartphone className="h-5 w-5" />
                </button>
                <button className="p-3 rounded-full text-[#aebac1] hover:bg-[#374248]"><CircleDashed className="h-5 w-5" /></button>
                <button className="p-3 rounded-full text-[#aebac1] hover:bg-[#374248]"><Users className="h-5 w-5" /></button>
              </div>
              <div className="flex flex-col gap-6 w-full items-center">
                <button className="p-3 rounded-full text-[#aebac1] hover:bg-[#374248]"><Settings className="h-5 w-5" /></button>
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#202c33] cursor-pointer">
                  EV
                </div>
              </div>
            </div>

            {viewMode === "web_bridge" ? (
              <WhatsAppWebBridge />
            ) : (
              <>
                {/* Chats List */}
            <div className="w-80 md:w-96 bg-[#111b21] flex flex-col border-r border-[#2a3942] shrink-0">
              <div className="h-16 px-4 flex items-center justify-between text-[#e9edef]">
                <h2 className="font-bold text-xl">Conversas</h2>
                <div className="flex gap-4 text-[#aebac1]">
                  <MessageSquare className="h-5 w-5 cursor-pointer" />
                  <MoreVertical className="h-5 w-5 cursor-pointer" />
                </div>
              </div>
              <div className="px-3 pb-2">
                <div className="bg-[#202c33] rounded-lg h-9 flex items-center px-3 gap-3">
                  <Search className="h-4 w-4 text-[#aebac1]" />
                  <input 
                    type="text" 
                    placeholder="Pesquisar ou começar uma nova conversa" 
                    className="bg-transparent border-none outline-none text-sm text-[#e9edef] w-full placeholder:text-[#aebac1]"
                  />
                </div>
              </div>
              <div className="flex gap-2 px-3 py-2 overflow-x-auto no-scrollbar">
                <span className="px-3 py-1.5 bg-[#202c33] text-[#aebac1] rounded-full text-xs cursor-pointer hover:bg-[#2a3942]">Tudo</span>
                <span className="px-3 py-1.5 bg-[#202c33] text-[#aebac1] rounded-full text-xs cursor-pointer hover:bg-[#2a3942]">Não lidas</span>
                <span className="px-3 py-1.5 bg-[#202c33] text-[#aebac1] rounded-full text-xs cursor-pointer hover:bg-[#2a3942]">Obras</span>
              </div>
              <div className="flex-1 overflow-y-auto mt-2">
                {mockChats.map(chat => (
                  <div 
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`flex items-center px-3 py-3 cursor-pointer hover:bg-[#202c33] transition-colors ${activeChatId === chat.id ? 'bg-[#2a3942]' : ''}`}
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-900 flex items-center justify-center text-emerald-100 font-bold text-lg shrink-0 overflow-hidden">
                      {chat.name.charAt(0)}
                    </div>
                    <div className="ml-4 flex-1 border-b border-[#2a3942] pb-3 pt-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[#e9edef] text-base truncate pr-2">{chat.name}</span>
                        <span className={`text-xs ${chat.unread > 0 ? 'text-[#00a884]' : 'text-[#8696a0]'}`}>{chat.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#8696a0] text-sm truncate max-w-[200px]">{chat.lastMessage}</span>
                        {chat.unread > 0 && (
                          <span className="bg-[#00a884] text-[#111b21] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Chat Area */}
            <div className="flex-1 flex flex-col relative bg-[#111b21]">
              {/* Chat Header */}
              <div className="h-16 px-4 bg-[#202c33] flex items-center justify-between shrink-0 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-white font-bold">
                    {activeChat.name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#e9edef] font-medium">{activeChat.name}</span>
                    <span className="text-[#8696a0] text-xs">Visto por último hoje às 14:00</span>
                  </div>
                </div>
                <div className="flex gap-5 text-[#aebac1]">
                  <button 
                    onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
                    className={`transition-colors ${aiSidebarOpen ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'hover:text-[#e9edef]'}`}
                    title="Análise IA (Lia)"
                  >
                    <Sparkles className="h-5 w-5" />
                  </button>
                  <Search className="h-5 w-5 cursor-pointer hover:text-[#e9edef]" />
                  <MoreVertical className="h-5 w-5 cursor-pointer hover:text-[#e9edef]" />
                  <button onClick={onClose} className="hover:text-red-400 ml-2" title="Fechar WhatsApp">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Chat Background & Messages Area */}
              <div 
                className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 flex flex-col relative"
                style={{
                  backgroundImage: "url('https://i.pinimg.com/originals/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundBlendMode: "overlay",
                  backgroundColor: "rgba(11, 20, 26, 0.92)"
                }}
              >
                <div className="flex justify-center mb-4">
                  <span className="bg-[#182229] text-[#8696a0] text-xs px-3 py-1 rounded-lg uppercase tracking-wide">
                    Hoje
                  </span>
                </div>

                {messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col gap-1 w-full relative">
                    <div className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] px-3 py-1.5 rounded-lg relative ${
                          msg.sender === "me"
                            ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none"
                            : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                        }`}
                      >
                        {msg.text.includes("▶") ? (
                          <div className="pt-1 pb-4 pr-8">
                            <div className="flex items-center gap-3 bg-[#111b21] rounded-full px-3 py-1.5 mb-2">
                              <Mic className="h-4 w-4 text-emerald-500" />
                              <div className="flex-1 h-1 bg-zinc-700 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-1/3"></div>
                              </div>
                              <span className="text-[10px] text-zinc-400 font-mono">0:15</span>
                            </div>
                            <div className="border-l-2 border-emerald-500 pl-2">
                              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide block mb-0.5">Transcrição Lia</span>
                              <p className="text-[13px] text-zinc-300 italic mb-1">
                                "Opa, chefe. Terminamos a concretagem do bloco B. Tá tudo liberado, pode mandar atualizar o avanço."
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap pb-3 pr-8">{msg.text}</p>
                        )}
                        <div className="absolute right-2 bottom-1 flex items-center gap-1">
                          <span className="text-[10px] text-[#aebac1]">{msg.timestamp}</span>
                          {msg.sender === "me" && (
                            <CheckCircle2 
                              className={`h-3.5 w-3.5 ${msg.status === "read" ? "text-[#53bdeb]" : "text-[#aebac1]"}`} 
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={endOfMessagesRef} className="h-4" />
              </div>

              {/* Chat Input Array */}
              <div className="min-h-[62px] bg-[#202c33] px-4 py-2.5 flex items-center gap-3 shrink-0">
                <Smile className="h-6 w-6 text-[#aebac1] cursor-pointer hover:text-[#e9edef]" />
                <Paperclip className="h-6 w-6 text-[#aebac1] cursor-pointer hover:text-[#e9edef]" />
                <div className="flex-1 bg-[#2a3942] rounded-lg flex items-center px-4 py-2 min-h-[40px]">
                  <input
                    type="text"
                    placeholder="Digite uma mensagem"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    className="bg-transparent border-none outline-none w-full text-[15px] text-[#e9edef] placeholder:text-[#8696a0]"
                  />
                </div>
                {inputValue.trim() ? (
                  <button onClick={handleSend} className="p-2 text-[#aebac1] hover:text-[#e9edef]">
                    <Send className="h-6 w-6" />
                  </button>
                ) : (
                  <Mic className="h-6 w-6 text-[#aebac1] cursor-pointer hover:text-[#e9edef]" />
                )}
              </div>
            </div>

            {/* EVIS LIA - AI Analysis Sidebar */}
            <AnimatePresence>
              {aiSidebarOpen && (
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 340, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="bg-[#111b21] border-l border-[#2a3942] shrink-0 flex flex-col overflow-hidden"
                >
                  <div className="h-16 px-4 bg-[#202c33] flex items-center gap-3 shrink-0">
                    <button onClick={() => setAiSidebarOpen(false)} className="text-[#aebac1] hover:text-[#e9edef]">
                      <X className="h-5 w-5" />
                    </button>
                    <span className="text-[#e9edef] font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-400" /> Lia (IA CRM)
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {/* Status Badge */}
                    <div className="bg-blue-900/20 border border-blue-900/40 rounded-xl p-3 flex items-start gap-3">
                      <div className="mt-0.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">Escuta Ativa Habilitada</p>
                        <p className="text-xs text-[#aebac1]">A Inteligência Artificial está categorizando este chat em tempo real e associando aos dados do EVIS.</p>
                      </div>
                    </div>

                    <h3 className="text-[#8696a0] text-xs font-bold uppercase tracking-wider mb-2 mt-4 px-1">Contexto Identificado</h3>
                    
                    {/* Insights Extracted */}
                    <div className="space-y-3">
                      {messages.filter(m => m.aiAnalysis).map((msg, idx) => (
                        <div key={idx} className="bg-[#202c33] rounded-xl p-3.5 border border-[#2a3942] shadow-sm transform transition hover:border-[#374248]">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-[11px] font-bold text-emerald-400 uppercase">Intenção Detectada</span>
                          </div>
                          <p className="text-sm text-[#e9edef] font-medium mb-3">{msg.aiAnalysis!.intent}</p>
                          
                          <div className="bg-[#111b21] rounded-lg p-2.5 space-y-2 mb-3">
                            <div className="flex items-start gap-2 text-xs text-[#aebac1]">
                              <Briefcase className="h-3.5 w-3.5 mt-0.5 text-blue-400 shrink-0" />
                              <span>{msg.aiAnalysis!.project}</span>
                            </div>
                            <div className="flex items-start gap-2 text-xs text-[#e9edef]">
                              <FolderKanban className="h-3.5 w-3.5 mt-0.5 text-orange-400 shrink-0" />
                              <span className="font-semibold">{msg.aiAnalysis!.actionRequired}</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => executeAction(msg.aiAnalysis!)}
                            className="w-full bg-[#00a884] hover:bg-[#029072] text-[#111b21] font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Executar no EVIS
                          </button>
                        </div>
                      ))}

                      {messages.filter(m => m.aiAnalysis).length === 0 && (
                        <div className="text-center py-8 text-[#8696a0] text-xs border border-dashed border-[#2a3942] rounded-xl">
                          Nenhuma ação pendente identificada nesta conversa no momento.
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            </>
          )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

