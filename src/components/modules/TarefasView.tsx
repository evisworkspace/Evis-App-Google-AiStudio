import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Task } from "../../types";
import {
  Search,
  HardHat,
  RefreshCw,
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCircle2,
  BarChart3,
  ListTodo,
  Sparkles
} from "lucide-react";
import { getAccessToken, googleSignIn } from "../../lib/auth";
import { createGoogleTask } from "../../lib/googleApi";

export default function TarefasView() {
  const { tasks, obras, setTasks } = useApp();
  const [filterText, setFilterText] = useState("");
  const [activeTab, setActiveTab] = useState<"visao-geral" | "lista">("visao-geral");
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

  // Analytics Math
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "Concluido").length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriorityTasks = tasks.filter(t => t.priority === "Alta" && t.status !== "Concluido").length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Demand by Project
  const tasksByProject = obras.map(obra => {
    const projectTasks = tasks.filter(t => t.project === obra.id);
    const completed = projectTasks.filter(t => t.status === "Concluido").length;
    return {
      ...obra,
      totalTasks: projectTasks.length,
      completedTasks: completed,
      pendingTasks: projectTasks.length - completed,
      progressRate: projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0
    };
  }).sort((a, b) => b.totalTasks - a.totalTasks);

  // Filter tasks based on search
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(filterText.toLowerCase()) ||
    t.assignedTo.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h2 className="text-xl font-bold font-sans text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" /> Análise Global de Demandas
          </h2>
          <p className="text-sm text-muted mt-1">
            Visão macro de todas as tarefas de engenharia e apropriação por obra.
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleSyncWorkspaceTasks}
            disabled={isSyncing}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-2 ${
              isSyncing ? "bg-primary/20 text-primary border-primary/30" : "bg-card border-border hover:border-primary/50 text-foreground"
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Sincronizando..." : "Sincronizar Tarefas (Google)"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("visao-geral")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "visao-geral"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Visão Geral & Indicadores
        </button>
        <button
          onClick={() => setActiveTab("lista")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === "lista"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <ListTodo className="h-4 w-4" />
          Quadro Kanban
        </button>
      </div>

      {/* VISÃO GERAL TAB */}
      {activeTab === "visao-geral" && (
        <div className="space-y-6">
          {/* Automador EVIS */}
          <div className="bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-900/40 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-sky-800 dark:text-sky-400 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Automador EVIS (Assistente de Rotinas)
            </h3>
            <p className="text-sm font-semibold text-sky-950 dark:text-sky-100 mb-3">
              Automação segura: sugere ação e pede confirmação. Encontrei atividades sistemáticas. Deseja que eu acione alertas automáticos via disparo de WhatsApp?<br/>
              Esta rotina é reversível. Ação automática sensível bloqueada por governança.
            </p>
            <div className="flex gap-3">
               <button className="text-[10px] font-bold px-3 py-1.5 bg-sky-600 text-white rounded hover:bg-sky-700 cursor-pointer shadow-sm transition-all"
                  onClick={() => alert("Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.")}
               >
                 Aprovar e Auto-disparar Checklists
               </button>
               <button className="text-[10px] font-bold px-3 py-1.5 bg-white border border-sky-200 text-sky-700 rounded hover:bg-sky-50 cursor-pointer shadow-sm transition-all"
                  onClick={() => alert("Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.")}
               >
                 Ver prévia dos lembretes simulados
               </button>
            </div>
          </div>

          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-center">
              <span className="text-muted font-bold text-[10px] uppercase tracking-wider mb-2">Total de Demandas</span>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold font-sans text-foreground">{totalTasks}</span>
                <span className="text-sm font-medium text-muted pb-1">tarefas mapeadas</span>
              </div>
            </div>
            <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-center">
              <span className="text-muted font-bold text-[10px] uppercase tracking-wider mb-2">Demandas Pendentes</span>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold font-sans text-amber-500">{pendingTasks}</span>
                <span className="text-sm font-medium text-muted pb-1">aguardando execução</span>
              </div>
            </div>
            <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-center">
              <span className="text-muted font-bold text-[10px] uppercase tracking-wider mb-2">Prioridade Crítica</span>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold font-sans text-rose-500 flex items-center gap-2">
                  {highPriorityTasks} <AlertCircle className="h-5 w-5" />
                </span>
              </div>
            </div>
            <div className="bg-card border border-border p-5 rounded-xl shadow-sm flex flex-col justify-center">
              <span className="text-muted font-bold text-[10px] uppercase tracking-wider mb-2">Taxa de Resolução</span>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold font-sans text-emerald-500">{completionRate}%</span>
                <span className="text-sm font-medium text-muted pb-1">concluído global</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Obras Workload Distribution */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-6 flex items-center gap-2">
                <HardHat className="h-4 w-4 text-primary" /> Distribuição de Carga de Trabalho por Obra
              </h3>
              
              <div className="space-y-6">
                {tasksByProject.map(obra => (
                  <div key={obra.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-foreground">{obra.name}</span>
                      <span className="text-muted text-xs font-mono">{obra.pendingTasks} pendentes / {obra.totalTasks} total</span>
                    </div>
                    <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-emerald-500 relative"
                        style={{ width: `${obra.progressRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Highlights */}
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-h-[300px]">
                <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Tarefas Recentes (Concluídas)
                </h3>
                <div className="space-y-3">
                  {tasks.filter(t => t.status === "Concluido").slice(0,4).map(task => (
                    <div key={task.id} className="text-xs p-3 bg-secondary/30 rounded-lg border border-border">
                      <p className="font-semibold text-foreground line-clamp-1">{task.title}</p>
                      <p className="text-[10px] text-muted font-mono mt-1">{task.assignedTo}</p>
                    </div>
                  ))}
                  {tasks.filter(t => t.status === "Concluido").length === 0 && (
                    <p className="text-xs text-muted italic text-center py-4">Nenhuma tarefa concluída recentemente.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LISTA COMPLETA TAB */}
      {activeTab === "lista" && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border bg-secondary/20 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="h-4 w-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Pesquisar todas as tarefas..."
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          
          <div className="p-4 bg-[#f8f9fa] dark:bg-zinc-950 min-h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
              {(["Fazer", "Progresso", "Revisão", "Concluido"] as const).map(status => {
                const columnTasks = filteredTasks.filter(t => t.status === status);
                
                let title = "Pendente";
                let headerColor = "bg-slate-100 text-slate-700 border-slate-200";
                if (status === "Progresso") {
                  title = "Em Andamento";
                  headerColor = "bg-blue-50 text-blue-700 border-blue-200";
                } else if (status === "Revisão") {
                  title = "Impedimento";
                  headerColor = "bg-purple-50 text-purple-700 border-purple-200";
                } else if (status === "Concluido") {
                  title = "Concluído";
                  headerColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                }

                return (
                  <div 
                    key={status} 
                    className="flex flex-col bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-border h-full overflow-hidden"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const taskId = e.dataTransfer.getData("taskId");
                      if (taskId) {
                        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
                      }
                    }}
                  >
                    <div className={`p-3 border-b text-xs font-bold uppercase tracking-wider flex items-center justify-between ${headerColor}`}>
                      <span>{title}</span>
                      <span className="bg-white/50 px-2 py-0.5 rounded-full">{columnTasks.length}</span>
                    </div>
                    
                    <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                      {columnTasks.map(task => {
                        const taskProject = obras.find(o => o.id === task.project);
                        return (
                          <div 
                            key={task.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
                            className="bg-white dark:bg-zinc-800 p-3 rounded-lg border border-border shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors group"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                task.priority === "Alta" ? "bg-rose-100 text-rose-700" :
                                task.priority === "Média" ? "bg-amber-100 text-amber-700" :
                                "bg-blue-100 text-blue-700"
                              }`}>
                                {task.priority}
                              </span>
                              <Clock className="h-3.5 w-3.5 text-muted group-hover:text-primary transition-colors" />
                            </div>
                            <h4 className="text-sm font-semibold text-foreground leading-snug mb-2">{task.title}</h4>
                            
                            <div className="text-[10px] space-y-1.5 flex flex-col font-mono text-muted">
                              <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded w-fit">
                                <HardHat className="h-3 w-3" /> {taskProject?.name || "Geral"}
                              </span>
                              <div className="flex items-center justify-between pt-1">
                                <span className="font-semibold text-zinc-600 dark:text-zinc-400">{task.assignedTo}</span>
                                <span>{task.dueDate}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {columnTasks.length === 0 && (
                        <div className="h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted font-mono bg-secondary/20">
                          Solte itens aqui
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
