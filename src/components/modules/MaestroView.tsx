import React, { useCallback, useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { AgentMessage, MaestroSeverity, MenuRoute } from "../../types";
import {
  getMaestroMessages,
  seedMockMaestroMessages,
} from "../../services/maestroService";
import { getAgentProfile } from "../../utils/agentesConfig";
import { Bot, Globe, HardHat, RefreshCw, Sparkles } from "lucide-react";

const AVATAR_COLORS: Record<string, string> = {
  indigo: "bg-indigo-500",
  rose: "bg-rose-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  slate: "bg-slate-500",
};

const SEVERITY_BADGES: Record<MaestroSeverity, { label: string; classes: string; dot: string }> = {
  info: { label: "Info", classes: "bg-green-500/10 text-green-400 border-green-500/30", dot: "bg-green-400" },
  alerta: { label: "Alerta", classes: "bg-amber-500/10 text-amber-400 border-amber-500/30", dot: "bg-amber-400" },
  critico: { label: "Crítico", classes: "bg-red-500/10 text-red-400 border-red-500/30", dot: "bg-red-400" },
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MaestroView() {
  const { companyId, navigate, obras, showToast } = useApp();
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!companyId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getMaestroMessages(companyId);
      setMessages(data);
    } catch (error) {
      console.error("Erro ao carregar mensagens do Maestro:", error);
      showToast("Erro ao carregar mensagens do Maestro", "error");
    } finally {
      setLoading(false);
    }
  }, [companyId, showToast]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSeed = async () => {
    if (!companyId) {
      showToast("Selecione uma empresa antes de gerar mensagens", "error");
      return;
    }
    setSeeding(true);
    try {
      await seedMockMaestroMessages(companyId);
      showToast("Mensagens de demonstração criadas", "success");
      await loadMessages();
    } catch (error) {
      console.error("Erro ao criar mensagens de demonstração:", error);
      showToast("Erro ao criar mensagens de demonstração", "error");
    } finally {
      setSeeding(false);
    }
  };

  const handleAction = (route?: MenuRoute) => {
    if (route) {
      navigate(route);
    } else {
      showToast("Ação registrada", "info");
    }
  };

  const obraName = (obraId?: string) =>
    obras.find((o) => o.id === obraId)?.name || "Obra";

  // Feed em ordem cronológica (mais antiga no topo, como um chat)
  const feed = [...messages].reverse();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
            <Bot className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Maestro Operacional</h1>
            <p className="text-xs text-muted-foreground">
              Messenger interno dos agentes de IA da sua construtora
            </p>
          </div>
        </div>
        <button
          onClick={loadMessages}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md border border-white/10 bg-white/5 text-foreground hover:bg-white/8 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Feed */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-5 min-h-[420px]">
        {loading ? (
          <div className="h-[380px] flex items-center justify-center">
            <span className="animate-spin h-7 w-7 border-2 border-purple-500/30 border-t-purple-500 rounded-full"></span>
          </div>
        ) : feed.length === 0 ? (
          <div className="h-[380px] flex flex-col items-center justify-center text-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <p className="text-sm font-semibold text-foreground">Nenhuma mensagem dos agentes ainda</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              Quando os agentes de IA detectarem algo relevante nas suas obras, as mensagens aparecem aqui.
            </p>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="mt-2 flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-md bg-purple-600 text-white hover:bg-purple-500 transition-colors cursor-pointer disabled:opacity-50"
            >
              {seeding ? (
                <span className="animate-spin h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full"></span>
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Gerar mensagens de demonstração
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {feed.map((message) => {
              const profile = getAgentProfile(message.agentId);
              const badge = SEVERITY_BADGES[message.severity] || SEVERITY_BADGES.info;
              const avatarColor = AVATAR_COLORS[message.avatar] || AVATAR_COLORS[profile.themeColor] || AVATAR_COLORS.slate;
              const initial = (message.agentName || profile.name || "A").charAt(0).toUpperCase();

              return (
                <div key={message.id} className="flex gap-3">
                  {/* Avatar: círculo colorido com inicial */}
                  <div
                    className={`h-9 w-9 shrink-0 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                    title={profile.role}
                  >
                    {initial}
                  </div>

                  {/* Bolha da mensagem */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-foreground">{message.agentName}</span>
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${badge.classes}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}></span>
                        {badge.label}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                        {message.scope === "obra" ? (
                          <>
                            <HardHat className="h-3 w-3" />
                            {obraName(message.obraId)}
                          </>
                        ) : (
                          <>
                            <Globe className="h-3 w-3" />
                            Global
                          </>
                        )}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>

                    <div className="rounded-lg rounded-tl-none border border-white/10 bg-white/5 px-3.5 py-2.5">
                      <p className="text-sm text-foreground leading-relaxed">{message.text}</p>
                    </div>

                    {/* Ações rápidas */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.actions.map((action) => (
                          <button
                            key={action.id}
                            onClick={() => handleAction(action.route)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors cursor-pointer"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
