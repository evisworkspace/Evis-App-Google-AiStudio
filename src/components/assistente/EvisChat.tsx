import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bot, User, Send, X, MessageSquare, CornerDownLeft, Sparkles, Building2, AlertTriangle, ShieldCheck } from "lucide-react";
import { useApp } from "../../context/AppContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

export default function EvisChat() {
  const { getActiveProject, setCurrentRoute, setSelectedProjectId, setActiveSubTab, showToast } = useApp();
  const activeProj = getActiveProject();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Olá, Engenheiro Berti! Sou o EVIS (Sua Inteligência de Obras).

Como especialista em controle físico-financeiro da Curitiba Construtora, estou munido com os dados do projeto ${activeProj.name} (${activeProj.location}).

Posso ajudar com:
- Análise de margem e orçamentos SINAPI.
- Elaboração rápida do texto do RDO de acordo com as condições meteorológicas em Curitiba.
- Identificação de potenciais desvios financeiros ou atrasos na concretagem.

O que deseja analisar hoje?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      content: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/assistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          siteContext: `${activeProj.name} - Status Atual: ${activeProj.status}, Orçamento Total: R$ ${activeProj.budgetTotal.toLocaleString()}, Gasto Real: R$ ${activeProj.budgetSpent.toLocaleString()}, Progresso: ${activeProj.progress}%`,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const replyText = data.reply || data.content || "Como assistente, não possuo respostas para este comando.";
        
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: replyText,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);

        // Automatically trigger programmatical page and tab redirection
        if (data.type === "redirect_diario" && data.idRefurbish) {
          setSelectedProjectId(data.idRefurbish);
          setCurrentRoute("obras");
          setActiveSubTab("rdo");
          showToast(`Redirecionando para o Diário de Obra (RDO) da obra selecionada.`, "info");
        } else if (data.type === "redirect_orcamentista" && data.idRefurbish) {
          setSelectedProjectId(data.idRefurbish);
          setCurrentRoute("obras");
          setActiveSubTab("orcamento");
          showToast(`Redirecionando para o painel Orçamentista IA da obra selecionada.`, "info");
        }
      } else {
        throw new Error(data.error || "Desconhecido");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ OPS, HOUVE UM ERRO AO CONECTAR AO SERVIDOR DO ASSISTENTE LIA.
Detalhes do erro: ${err.message}.

Por favor, tente novamente de forma offline ou verifique se a sua chave de API está ativa.`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionChips = [
    { label: "Análise Orçamento", prompt: `Analise as margens do orçamento de ${activeProj.name}. Onde temos maiores riscos de estourar?` },
    { label: "Texto RDO Chuva", prompt: `Escreva um registro de RDO profissional para ${activeProj.name} considerando clima chuvoso em Curitiba e trabalho concentrado em alvenaria interna.` },
    { label: "Substitutos de Aço", prompt: `Estamos com cotações pendentes de aço CA-50 em barras de 10mm. Quais as melhores práticas em Curitiba para fechar compras urgentes com boa margem frente à tabela SINAPI?` },
  ];

  // Simple and highly robust inline helper to format bolding, code blocks and lists in markdown
  const formatMarkdown = (text: string) => {
    return text.split("\n").map((line, idx) => {
      let content = line;
      
      // Headers
      if (content.startsWith("### ")) {
        return <h4 key={idx} className="text-zinc-900 font-semibold text-sm mt-3 mb-1">{content.replace("### ", "")}</h4>;
      }
      if (content.startsWith("## ")) {
        return <h3 key={idx} className="text-zinc-900 font-bold text-base mt-4 mb-2 border-b border-zinc-100 pb-1">{content.replace("## ", "")}</h3>;
      }
      if (content.startsWith("# ")) {
        return <h2 key={idx} className="text-zinc-900 font-bold text-lg mt-4 mb-2">{content.replace("# ", "")}</h2>;
      }

      // Bullet points
      if (content.trim().startsWith("- ")) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-zinc-700 leading-relaxed mb-1">
            {parseInlineMarkdown(content.trim().substring(2))}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs text-zinc-700 leading-relaxed mb-2 font-sans">
          {parseInlineMarkdown(content)}
        </p>
      );
    });
  };

  const parseInlineMarkdown = (line: string) => {
    // Basic Markdown helper for bold **text** and code `codes`
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const parts = line.split(regex);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-zinc-950">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="bg-zinc-100 text-amber-700 font-mono text-[10px] px-1 py-0.5 rounded-sm">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
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
          {/* Animated dot glow */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 border-2 border-white"></span>
          </span>
          <span className="absolute right-16 bg-slate-900 border border-slate-750 text-white font-mono text-[10px] tracking-wide px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-xl">
            Falar com EVIS AI
          </span>
        </button>
      </div>

      {/* Expandable Sidebar Assistant Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="evis_chat_panel"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-full max-w-sm md:max-w-md h-[580px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-3xl border border-slate-200/80 overflow-hidden flex flex-col"
          >
            {/* Assistant Header */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-4 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-indigo-650 border border-indigo-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
                  <Bot className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-xs leading-none tracking-tight">
                      EVIS AI Manager
                    </span>
                    <span className="inline-flex items-center h-4 px-1.5 rounded-full bg-emerald-950/80 text-[8px] font-mono font-black tracking-widest text-emerald-400 border border-emerald-500/20">
                      <span className="h-1 w-1 bg-emerald-400 rounded-full mr-1 animate-pulse"></span>
                      ONLINE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-amber-500" /> Inteligência Curitiba Construtora
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-slate-800/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Active Context Banner - Inline representative Card */}
            <div className="px-4 py-3 bg-secondary/60 border-b border-border flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2 max-w-[70%]">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Building2 className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <div className="truncate">
                  <p className="text-[8px] font-mono font-bold tracking-wider text-muted uppercase">Análise em tempo real</p>
                  <p className="text-[11px] font-bold text-foreground truncate">{activeProj.name}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                  {activeProj.progress}% Executado
                </span>
              </div>
            </div>

            {/* Messages Feed Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-secondary/20 space-y-4 font-sans">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2.5 w-full max-w-[88%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border shadow-xs ${
                        m.role === "user"
                          ? "bg-gradient-to-tr from-primary to-accent border-primary/30 text-white shadow-md shadow-primary/10"
                          : "bg-card border-border text-primary"
                      }`}
                    >
                      {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div>
                      <div
                        className={`px-3 py-2.5 rounded-xl border leading-relaxed text-xs shadow-xs ${
                          m.role === "user"
                            ? "bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-indigo-700 shadow-md shadow-indigo-600/10"
                            : "bg-card border-border text-foreground"
                        }`}
                      >
                        {m.role === "user" ? (
                          <p className="text-xs leading-relaxed font-sans">{m.content}</p>
                        ) : (
                          formatMarkdown(m.content)
                        )}
                      </div>
                      <span className="text-[8px] font-mono text-muted mt-1 block px-1 text-right">
                        {m.time}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[80%]">
                    <div className="h-7 w-7 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary animate-pulse" />
                    </div>
                    <div className="bg-card px-3 py-2.5 rounded-xl border border-border/80 shadow-xs flex items-center gap-2 animate-pulse">
                      <span className="text-[10.5px] font-mono text-muted">Analisando Curva S...</span>
                      <div className="flex gap-0.5 items-center">
                        <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions list */}
            {messages.length === 1 && (
              <div className="px-4 py-3 bg-secondary/35 border-t border-border">
                <span className="text-[9px] font-mono font-bold text-muted uppercase tracking-wider block mb-2">
                  Ações Rápidas sugeridas:
                </span>
                <div className="flex flex-col gap-1.5">
                  {suggestionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip.prompt)}
                      className="text-left text-[10.5px] px-3 py-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-all font-sans text-foreground/90 cursor-pointer flex items-center gap-2 shadow-xs group transform hover:scale-[1.02] hover:-translate-y-0.5"
                    >
                      <Sparkles className="h-3 w-3 text-warning shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                      <span className="truncate group-hover:text-primary font-semibold transition-colors">{chip.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Box Panel */}
            <div className="p-3 bg-white border-t border-slate-150">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Pergunte ao EVIS sobre ${activeProj.name}...`}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="h-8 w-8 rounded-xl bg-slate-900 text-white hover:bg-indigo-650 flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 transition-all shadow-md shadow-slate-900/10 active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <div className="mt-2 flex items-center justify-between text-[8px] font-mono text-slate-400 px-1">
                <span className="flex items-center gap-0.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Criptografia de Dados ponta-a-ponta
                </span>
                <span className="flex items-center gap-1">
                  Pressione <CornerDownLeft className="h-2 w-2" /> para enviar
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
