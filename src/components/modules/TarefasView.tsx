import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Task } from "../../types";
import {
  Sparkles,
  Search,
  PlusSquare,
  HardHat,
  Briefcase,
  Play,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  LineChart,
  User,
  Activity,
  RefreshCw
} from "lucide-react";
import { getAccessToken, googleSignIn } from "../../lib/auth";
import { createGoogleTask } from "../../lib/googleApi";

export default function TarefasView() {
  const { tasks, obras, setTasks } = useApp();
  const [filterText, setFilterText] = useState("");
  const [activeTab, setActiveTab] = useState<"quadro" | "horas">("quadro");
  const [isSyncing, setIsSyncing] = useState(false);
  const { showToast } = useApp();

  const handleSyncWorkspaceTasks = async () => {
    try {
      setIsSyncing(true);
      let token = await getAccessToken();
      if (!token) {
        showToast("É necessário conectar com o Google para sincronizar as tarefas. Por favor, autentique.", "info");
        const res = await googleSignIn();
        if (res) {
          token = res.accessToken;
        } else {
          setIsSyncing(false);
          return;
        }
      }

      const pendingTasks = tasks.filter(t => t.status !== "Concluido");
      if (pendingTasks.length === 0) {
        showToast("Nenhuma tarefa pendente para sincronizar.", "info");
        setIsSyncing(false);
        return;
      }

      let syncCount = 0;
      for (const t of pendingTasks) {
         try {
            await createGoogleTask(
                token!, 
                t.title, 
                `Prioridade: ${t.priority}\nResponsável: ${t.assignedTo}\nProjeto: ${obras.find(o=>o.id===t.project)?.name || 'N/A'}`,
                t.dueDate
            );
            syncCount++;
         } catch (e) {
            console.error(e);
         }
      }

      showToast(`${syncCount} Tarefa(s) sincronizada(s) com sucesso na sua Google Agenda (Workspace)!`, "success");
    } catch (e: any) {
      showToast(`Erro na sincronização: ${e.message}`, "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter tasks based on search
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(filterText.toLowerCase()) ||
    t.assignedTo.toLowerCase().includes(filterText.toLowerCase())
  );

  const getTasksByStatus = (status: Task["status"]) => {
    return filteredTasks.filter((t) => t.status === status);
  };

  const handleToggleTaskStatus = async (id: string, current: Task["status"]) => {
    const sequence: Task["status"][] = ["Fazer", "Progresso", "Revisão", "Concluido"];
    const nextIdx = (sequence.indexOf(current) + 1) % sequence.length;
    const nextStatus = sequence[nextIdx];
    
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    if (nextStatus === "Concluido") {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        try {
          let token = await getAccessToken();
          if (!token) {
             const res = await googleSignIn();
             if (res) token = res.accessToken;
          }
          if (token) {
            // dynamically import from lib for this hook usage to keep clean if you want, but we import at top
            await import("../../lib/googleApi").then((m) => m.syncToCalendar(
              token,
              task.id,
              `[✔ Concluída] Tarefa: ${task.title}`,
              `Milestone concluída do projeto: ${obras.find(o => o.id === task.project)?.name || "N/A"}\nResponsável: ${task.assignedTo}`,
              task.dueDate || new Date().toISOString()
            ));
            showToast(`Milestone sincronizada no Google Agenda!`, "success");
          }
        } catch (e) {
          console.error("Erro ao sincronizar milestone no calendário:", e);
        }
      }
    }
  };

  const totalLoggedHours = tasks.reduce((acc, t) => acc + (t.loggedHours || 0), 0);

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Tab select controller */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-[hsl(var(--color-border))] rounded-lg">
        <div>
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-950 flex items-center gap-1">
            <HardHat className="h-4.5 w-4.5 text-zinc-650" /> Portal de Tarefas de Engenharia & Apropriação
          </h2>
          <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
            Sincronização de apontamentos diários e tempos de desenvolvimento estrutural.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleSyncWorkspaceTasks}
            disabled={isSyncing}
            className={`px-3 py-1.5 font-semibold font-mono uppercase text-[10px] rounded border transition-all cursor-pointer flex items-center gap-1.5 ${
              isSyncing ? "bg-blue-100 text-blue-500 border-blue-200" : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
            }`}
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Sincronizando..." : "Sincronizar Workspace"}
          </button>
          <button
            onClick={() => setActiveTab("quadro")}
            className={`px-3 py-1.5 font-semibold font-mono uppercase text-[10px] rounded border transition-all cursor-pointer ${
              activeTab === "quadro"
                ? "bg-[hsl(var(--color-primary))] text-white border-[hsl(var(--color-primary))]"
                : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Quadro Kanban
          </button>
          <button
            onClick={() => setActiveTab("horas")}
            className={`px-3 py-1.5 font-semibold font-mono uppercase text-[10px] rounded border transition-all cursor-pointer ${
              activeTab === "horas"
                ? "bg-[hsl(var(--color-primary))] text-white border-[hsl(var(--color-primary))]"
                : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Gestão de Horas Apontadas
          </button>
        </div>
      </div>

      {/* QUADRO TAB CONTENT */}
      {activeTab === "quadro" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Localizar tarefas ou responsáveis..."
              className="px-3 py-1.5 bg-white border border-zinc-200 rounded text-xs focus:ring-1 focus:ring-primary focus:outline-hidden w-full max-w-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {(["Fazer", "Progresso", "Revisão", "Concluido"] as Task["status"][]).map((stg) => {
              const tasksInStg = getTasksByStatus(stg);
              return (
                <div key={stg} className="bg-zinc-100/50 p-3 rounded-lg border border-zinc-250 shrink-0 min-w-[200px] flex flex-col justify-between">
                  <div>
                    <h3 className="text-[10px] font-mono font-bold text-zinc-550 border-b border-zinc-200 pb-2 mb-3 uppercase flex items-center justify-between">
                      <span>{stg}</span>
                      <span className="px-1.5 bg-zinc-200 rounded font-bold text-zinc-700 text-[9px]">{tasksInStg.length}</span>
                    </h3>

                    <div className="space-y-2.5">
                      {tasksInStg.map((t) => (
                        <div key={t.id} className="bg-white rounded p-3 border border-zinc-200 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between">
                            <span className={`px-1 py-0.5 text-[8px] font-bold font-mono rounded ${
                              t.priority === "Alta" ? "bg-rose-50 text-rose-600 border border-rose-100" : t.priority === "Média" ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-500"
                            }`}>
                              {t.priority}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-400">Prazo: {t.dueDate}</span>
                          </div>
                          
                          <p className="text-xs font-semibold text-zinc-800 mt-2 font-sans">{t.title}</p>
                          <p className="text-[9.5px] text-zinc-400 mt-1 font-mono uppercase tracking-tight">⚙️ {obras.find(o => o.id === t.project)?.name}</p>

                          <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-zinc-50 text-[10px]">
                            <span className="text-zinc-500 flex items-center gap-1">
                              <User className="h-3 w-3 text-zinc-400" /> {t.assignedTo.split(" ")[1] || t.assignedTo}
                            </span>
                            
                            <button
                              onClick={() => handleToggleTaskStatus(t.id, t.status)}
                              className="px-2 py-0.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-150 rounded text-[9.5px] font-mono cursor-pointer transition-colors"
                            >
                              Avançar →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 border-t border-zinc-200 pt-2 text-center text-[9px] font-mono text-zinc-400 leading-none">
                    Lajes em andamento
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GESTÃO DE HORAS TAB CONTENT */}
      {activeTab === "horas" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4.5 block">
              Histórico Contínuo de Apontamentos Técnicos (TimeSheet)
            </h3>

            <div className="space-y-3">
              {tasks.map((t) => (
                <div key={t.id} className="p-3 bg-zinc-50 border border-zinc-100 rounded-md flex items-center justify-between text-xs font-sans">
                  <div>
                    <h4 className="font-semibold text-zinc-850 leading-none">{t.title}</h4>
                    <span className="text-[9.5px] font-mono text-zinc-400 block mt-1.5">Trabalhador: {t.assignedTo} • {obras.find(o=>o.id===t.project)?.name}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9.5px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold">
                      {t.loggedHours || 0} horas
                    </span>
                    <span className="text-[8px] font-mono text-zinc-400 block mt-1">Aprovado pelo Eng. Berti</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick hour analytics overview */}
          <div className="space-y-4">
            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 block">
                Resumo Geral faturado de Horas
              </h3>
              
              <div className="p-6 text-center">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-2">Total de Horas Logadas (Mês)</span>
                <span className="text-4xl font-mono font-bold text-[hsl(var(--color-primary))]">{totalLoggedHours}h</span>
                <span className="text-[10.5px] text-zinc-500 block mt-2 font-sans">
                  Média de aproveitamento físico estimado em <span className="font-bold text-zinc-900">94.2%</span> por canteiro.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
