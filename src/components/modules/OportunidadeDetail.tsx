import React, { useState } from "react";
import { Obra, Oportunidade } from "../../types";
import { useApp } from "../../context/AppContext";
import {
  ArrowLeft, Building2, Briefcase, Play, FileText, LayoutDashboard, Calculator, CheckSquare, Layers, Sparkles, User, File, ArrowRight, CheckCircle, Send, Video, Mail, HardHat
} from "lucide-react";
import { getAccessToken, googleSignIn } from "../../lib/auth";
import { createGoogleMeetEvent, createGoogleDriveFolder, sendGmail } from "../../lib/googleApi";
import { createObra } from "../../services/obraService";
import { softDeleteOportunidade } from "../../services/oportunidadeService";

interface Props {
  oportunidade: Oportunidade;
  onBack: () => void;
}

export default function OportunidadeDetail({ oportunidade, onBack }: Props) {
  const { setOportunidades, setObras, showToast, companyId, setSelectedProjectId, navigate } = useApp();
  const [activeTab, setActiveTab] = useState<"geral" | "orcamento" | "tarefas" | "arquivos" | "propostas">("geral");

  // Orçamentista IA Chat States (moved exactly from ObrasView)
  const [isOrcamentistaOpen, setIsOrcamentistaOpen] = useState(false);
  const [orcMsg, setOrcMsg] = useState<Array<{ role: "user" | "assistant"; content: string; itens?: any[] }>>([
    { role: "assistant", content: "Olá! Sou o Otto Orçamentista da Curitiba Construtora. Estou pronto para analisar as frentes de insumos desta pré-obra e te dar orientações de compra balizadas pelo SINAPI. Itens com baixa confiança serão sinalizados para revisão manual!" }
  ]);
  const [orcInput, setOrcInput] = useState("");
  const [isQueryingOrc, setIsQueryingOrc] = useState(false);

  // Fake list of orçamentos generated
  const [orcamentosList, setOrcamentosList] = useState<any[]>([]);

  const handleAskOrc = async (q: string) => {
    if (!q.trim() || isQueryingOrc) return;
    setOrcMsg((prev) => [...prev, { role: "user", content: q }]);
    setOrcInput("");
    setIsQueryingOrc(true);

    try {
      const res = await fetch("/api/ai/orcamentista", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          context: `Orçamentista IA - ${oportunidade.title} - ${oportunidade.client}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setOrcMsg((prev) => [
          ...prev,
          { role: "assistant", content: data.reply || "Análise do Orçamentista concluída.", itens: data.itens || undefined }
        ]);
        if (data.itens && data.itens.length > 0) {
          setOrcamentosList(prev => [...prev, ...data.itens]);
        }
      } else {
        throw new Error(data.error || "Erro de resposta");
      }
    } catch (err: any) {
      setOrcMsg((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Erro na análise do orçamentista: ${err.message}. Por favor, tente novamente ou verifique se a chave do Gemini está ativa.` }
      ]);
    } finally {
      setIsQueryingOrc(false);
    }
  };

  const [isSchedulingMeet, setIsSchedulingMeet] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState(`Referente à Oportunidade: ${oportunidade.title}`);
  const [emailBody, setEmailBody] = useState("");
  const [meetDate, setMeetDate] = useState(() => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    return tmrw.toISOString().split("T")[0];
  });
  const [meetTime, setMeetTime] = useState("10:00");
  const [meetClientEmail, setMeetClientEmail] = useState(oportunidade.clientEmail || "");

  const handleCreateMeetClick = () => {
    setMeetClientEmail(oportunidade.clientEmail || "");
    setShowMeetModal(true);
  };

  const handleSendEmailClick = () => {
    setMeetClientEmail(oportunidade.clientEmail || "");
    setShowEmailModal(true);
  };

  const confirmSendEmail = async () => {
    try {
      setIsSendingEmail(true);
      let token = await getAccessToken();
      if (!token) {
        showToast("É necessário conectar com o Google para enviar email. Por favor, autentique.", "info");
        const res = await googleSignIn();
        if (res) {
          token = res.accessToken;
        } else {
          setIsSendingEmail(false);
          return;
        }
      }

      if (!meetClientEmail.trim()) {
        showToast("O email do cliente é obrigatório.", "error");
        setIsSendingEmail(false);
        return;
      }

      await sendGmail(
        token!,
        meetClientEmail.trim(),
        emailSubject,
        emailBody
      );

      showToast(`Email enviado pelo Gmail para ${meetClientEmail}.`, "success");
      setShowEmailModal(false);
    } catch (e: any) {
      showToast(`Erro ao enviar email: ${e.message}`, "error");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const confirmScheduledMeet = async () => {
    try {
      setIsSchedulingMeet(true);
      let token = await getAccessToken();
      if (!token) {
        showToast("É necessário conectar com o Google para agendar. Por favor, autentique.", "info");
        const res = await googleSignIn();
        if (res) {
          token = res.accessToken;
        } else {
          setIsSchedulingMeet(false);
          return;
        }
      }

      const startDateTime = new Date(`${meetDate}T${meetTime}:00`).toISOString();
      const endDateTime = new Date(new Date(`${meetDate}T${meetTime}:00`).getTime() + 60 * 60000).toISOString(); // 1 hour duration

      const title = `Reunião Comercial: ${oportunidade.title}`;
      const desc = `Discussão técnico-comercial para a obra ${oportunidade.title}\nCliente: ${oportunidade.client}`;
      const attendees = meetClientEmail.trim() ? [{ email: meetClientEmail.trim() }] : [];

      const data = await createGoogleMeetEvent(
        token!,
        title,
        desc,
        startDateTime,
        endDateTime,
        attendees
      );

      const meetLink = data.hangoutLink;
      showToast(`Reunião criada no Google Calendar${meetLink ? `: ${meetLink}` : "."}`, "success");
      setShowMeetModal(false);
    } catch (e: any) {
      showToast(`Erro ao agendar reunião: ${e.message}`, "error");
    } finally {
      setIsSchedulingMeet(false);
    }
  };

  const handleVirarObra = async () => {
    try {
      if (!companyId) {
        showToast("Empresa não selecionada para converter oportunidade em obra.", "error");
        return;
      }

      setIsConverting(true);
      let token = await getAccessToken();
      let driveFolderInfo = "";
      if (token) {
        try {
          const folderData = await createGoogleDriveFolder(token, `EVIS Projeto Técnico - ${oportunidade.title}`);
          driveFolderInfo = `Pasta GDrive vinculada.\nID: ${folderData.id}`;
          showToast(`Pasta criada no Google Drive para ${oportunidade.title}.`, "success");
        } catch (e: any) {
          console.error(e);
          showToast(`Atenção: Não criou pasta Drive. ${e.message}`, "info");
        }
      }

      // move from oportunidades to obras
      const novaObra: Omit<Obra, "id" | "obraId"> = {
        oportunidadeId: oportunidade.id,
        name: oportunidade.title,
        location: "Curitiba/PR", // mock
        description: `Obra gerada a partir da oportunidade: ${oportunidade.title}\n${driveFolderInfo}`,
        progress: 0,
        budgetSpent: 0,
        budgetTotal: oportunidade.value || 1000000,
        status: "Planejamento" as const,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        manager: oportunidade.owner,
        equipe: [{ name: oportunidade.owner, role: "Gestor" }],
        documentos: [],
        rdoList: [],
        medicoesList: [],
        orcamentoInsumos: []
      };

      const obraCriada = await createObra(companyId, novaObra);
      await softDeleteOportunidade(companyId, oportunidade.id);

      setObras(prev => [...prev, obraCriada]);
      setOportunidades(prev => prev.filter(o => o.id !== oportunidade.id));
      setSelectedProjectId(obraCriada.id);
      showToast(`"${oportunidade.title}" virou obra com sucesso.`, "success");
      navigate("obra-detail");
    } catch (error: any) {
      showToast(`Erro ao converter oportunidade em obra: ${error.message}`, "error");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer text-zinc-500 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-900">{oportunidade.title}</h1>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase tracking-wider">Pré-Obra</span>
              <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase tracking-wider">{oportunidade.stage}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1 font-mono uppercase tracking-widest">
              <Building2 className="h-3 w-3" /> {oportunidade.client} • Curitiba/PR
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex flex-col text-right mr-4">
            <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest">Valor Estimado</span>
            <span className="font-bold text-lg text-zinc-900">R$ {(oportunidade.value / 1000000).toFixed(2)}M</span>
          </div>
          <button
            className="px-4 py-2 border border-blue-500 text-blue-600 font-bold rounded-lg hover:bg-blue-50 bg-white shadow-sm flex items-center gap-2 transition-all cursor-pointer text-sm disabled:opacity-50"
            onClick={handleCreateMeetClick}
            disabled={isSchedulingMeet}
          >
            <Video className="h-4 w-4" /> {isSchedulingMeet ? "Agendando..." : "Google Meet"}
          </button>
          <button
            className="px-4 py-2 border border-blue-500 text-blue-600 font-bold rounded-lg hover:bg-blue-50 bg-white shadow-sm flex items-center gap-2 transition-all cursor-pointer text-sm disabled:opacity-50"
            onClick={handleSendEmailClick}
            disabled={isSendingEmail}
          >
            <Mail className="h-4 w-4" /> {isSendingEmail ? "Enviando..." : "Gmail Enviar"}
          </button>
          <button
            className="px-4 py-2 border border-emerald-500 text-emerald-600 font-bold rounded-lg hover:bg-emerald-50 bg-white shadow-sm flex items-center gap-2 transition-all cursor-pointer text-sm disabled:opacity-50"
            onClick={handleVirarObra}
            disabled={isConverting}
          >
            <HardHat className="h-4 w-4" /> {isConverting ? "Convertendo..." : "Virar Obra"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 overflow-x-auto scrollbar-hide select-none transition-colors duration-200">
        {[
          { id: "geral", icon: LayoutDashboard, label: "Geral" },
          { id: "orcamento", icon: Calculator, label: "Orçamento" },
          { id: "tarefas", icon: CheckSquare, label: "Tarefas" },
          { id: "arquivos", icon: File, label: "Arquivos" },
          { id: "propostas", icon: FileText, label: "Propostas" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3.5 border-b-2 text-[11px] font-bold font-mono tracking-widest uppercase transition-colors whitespace-nowrap cursor-pointer ${activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-zinc-400 hover:text-zinc-700 hover:border-zinc-300"
              }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-primary" : "text-zinc-400"}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Areas */}
      {activeTab === "geral" && (
        <div className="space-y-4">
          {/* Lia Comercial Suggestion Card */}
          <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-900/40 rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-purple-800 dark:text-purple-400 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Lia Comercial (Assistente CRM)
            </h3>
            <p className="text-sm font-semibold text-purple-950 dark:text-purple-100">
              Este lead parece quente porque demonstrou urgência e pediu retorno rápido. Posso preparar um briefing para orçamento, mas você confirma antes.
            </p>
            <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              Temperatura do Lead: {oportunidade.probability < 50 ? "Baixa (Risco de Perda)" : oportunidade.probability < 80 ? "Moderada" : "Alta (Quente)"}. Sugiro contato em até 24 horas.
            </p>
            <div className="mt-4 flex gap-3">
              <button className="text-[10px] font-bold px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-all cursor-pointer shadow-sm"
                onClick={() => showToast("Em desenvolvimento", "info")}
              >
                Preparar briefing para orçamento
              </button>
              <button className="text-[10px] font-bold px-3 py-1.5 bg-white border border-purple-200 text-purple-700 rounded hover:bg-purple-50 transition-all cursor-pointer shadow-sm"
                onClick={() => showToast("Em desenvolvimento", "info")}
              >
                Ver contexto de risco da conta
              </button>
            </div>
          </div>

          <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 mb-4">Dados da Obra</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Status</span>
                <p className="font-semibold text-sm mt-1">{oportunidade.stage}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Localização</span>
                <p className="font-semibold text-sm mt-1">Curitiba/PR</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Orçamento</span>
                <p className="font-semibold text-sm mt-1">R$ {(oportunidade.value / 1000).toLocaleString("pt-BR")}k</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Área Estimada</span>
                <p className="font-semibold text-sm mt-1">0 m²</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 mb-4">Cliente / Incorporador</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Nome</span>
                <p className="font-semibold text-sm mt-1">{oportunidade.client}</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Sensibilidade (Probabilidade)</span>
                <p className="font-semibold text-sm mt-1 text-emerald-600">{oportunidade.probability}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "orcamento" && (
        <div className="space-y-6">
          {/* Otto Orçamentista Insights */}
          <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-lg border border-emerald-200 dark:border-emerald-900/40 mb-2 relative shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                Otto Orçamentista (Assistente de Custos)
              </h3>
            </div>
            <p className="text-sm font-medium text-emerald-950 dark:text-emerald-100 mb-3 leading-relaxed">
              Há lacunas no escopo que podem afetar o preço final (ex: falta prever infraestrutura de refrigeração para todas as salas). <br />
              Este item tem baixa confiança e precisa de revisão humana: <strong>Fundação profunda — Cotação parametrizada (margem de erro de 20%)</strong>. <br />
              Orçamento final exige aprovação do responsável.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setIsOrcamentistaOpen(!isOrcamentistaOpen)} className="text-[10px] font-bold px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors uppercase rounded shadow-sm cursor-pointer">
                Ativar Simulador de Custos
              </button>
              <button onClick={() => showToast("Em desenvolvimento", "info")} className="text-[10px] font-bold px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors uppercase rounded shadow-sm cursor-pointer">
                Enviar perguntas pendentes ao cliente
              </button>
            </div>
          </div>

          <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 flex-wrap gap-4">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" /> Assistência de IA
                </h3>
                <p className="text-[11px] text-purple-700 font-sans mt-0.5">
                  Importe um orçamento existente ou crie um novo com o Agente Orçamentista.
                </p>
              </div>
              <button
                onClick={() => setIsOrcamentistaOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-mono text-[10px] font-bold rounded cursor-pointer shadow-sm"
              >
                <Sparkles className="h-3 w-3" /> Orçar com IA
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-sans">
                  <span>BDI Produto:</span>
                  <input type="text" className="w-12 h-6 border border-zinc-200 rounded text-center" defaultValue="10" /> %
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-sans">
                  <span>BDI M.O.:</span>
                  <input type="text" className="w-12 h-6 border border-zinc-200 rounded text-center" defaultValue="25" /> %
                </div>
              </div>
              <div className="flex gap-2">
                <input type="text" className="bg-white border border-zinc-200 rounded px-2 h-7 text-xs w-64" placeholder="Buscar item..." />
                <button className="bg-zinc-800 text-white h-7 px-3 rounded text-[10px] font-mono font-bold hover:bg-zinc-700 cursor-pointer">
                  + Adicionar grupo
                </button>
              </div>
            </div>

            <div className="mt-4 border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left font-sans whitespace-nowrap">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                    <th className="px-4 py-2 font-bold w-12">Nº</th>
                    <th className="px-4 py-2 font-bold">Item</th>
                    <th className="px-4 py-2 font-bold">Categoria</th>
                    <th className="px-4 py-2 font-bold text-center">Un.</th>
                    <th className="px-4 py-2 font-bold text-right">Qtd.</th>
                    <th className="px-4 py-2 font-bold text-right">Custo un.</th>
                    <th className="px-4 py-2 font-bold text-right">Preço un.</th>
                    <th className="px-4 py-2 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orcamentosList.length === 0 ? (
                    <tr className="bg-white hover:bg-zinc-50/50">
                      <td className="px-4 py-2.5 text-xs text-zinc-600 font-medium">1</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-700 font-bold">Resumo / Novo grupo</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400">—</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400 text-center">—</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400 text-right">—</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-800 text-right">R$ 0</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-400 text-right">—</td>
                      <td className="px-4 py-2.5 text-xs text-zinc-800 text-right font-bold">R$ 0</td>
                    </tr>
                  ) : (
                    orcamentosList.map((item, idx) => (
                      <tr key={idx} className="border-b border-zinc-100 bg-white hover:bg-zinc-50/50">
                        <td className="px-4 py-2.5 text-xs text-zinc-600 font-medium">{idx + 1}</td>
                        <td className="px-4 py-2.5 text-xs text-zinc-700 font-bold truncate max-w-[200px]">{item.category}</td>
                        <td className="px-4 py-2.5 text-[10px] text-blue-600 font-mono font-bold uppercase">{item.category}</td>
                        <td className="px-4 py-2.5 text-xs text-zinc-500 text-center">VB</td>
                        <td className="px-4 py-2.5 text-xs text-zinc-700 text-right">1</td>
                        <td className="px-4 py-2.5 text-xs text-zinc-800 text-right">R$ 0</td>
                        <td className="px-4 py-2.5 text-[10px] text-zinc-400 font-mono text-right">N/A</td>
                        <td className="px-4 py-2.5 text-xs text-zinc-800 text-right font-bold">R$ {item.planned?.toLocaleString()}</td>
                      </tr>
                    ))
                  )}

                  {/* Footers */}
                  <tr className="bg-zinc-50 border-t border-zinc-200 font-semibold font-mono text-xs">
                    <td colSpan={7} className="px-4 py-3 text-right">Total Geral</td>
                    <td className="px-4 py-3 text-right font-black text-primary">
                      R$ {orcamentosList.reduce((acc, curr) => acc + (curr.planned || 0), 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AI Estimator Modal slide-over */}
      {/* Overlay to close when clicking outside */}
      <div
        className={`fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-xs transition-opacity duration-300 ${isOrcamentistaOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOrcamentistaOpen(false)}
      />

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[420px] bg-white border-l border-zinc-200 flex flex-col shadow-2xl transition-transform duration-300 transform ${isOrcamentistaOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 shrink-0 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 leading-tight">Otto Orçamentista</h4>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500">Agente de Pré-Obra</span>
            </div>
          </div>
          <button
            onClick={() => setIsOrcamentistaOpen(false)}
            className="p-1.5 hover:bg-zinc-200 rounded-md text-zinc-500 cursor-pointer transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 p-4 text-xs text-left scrollbar-thin bg-white">
          {orcMsg.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border leading-relaxed font-sans ${m.role === "user"
                  ? "bg-zinc-900 text-white border-zinc-950 ml-8"
                  : "bg-zinc-50 text-zinc-800 border-zinc-200 mr-4"
                }`}
            >
              <p className="font-semibold text-[9.5px] font-mono opacity-60 tracking-wider mb-1">
                {m.role === "user" ? "Berti (Você)" : "Otto Orçamentista"}
              </p>
              <p className="whitespace-pre-line text-sm font-medium leading-relaxed">
                {m.content}
              </p>

              {m.itens && m.itens.length > 0 && (
                <div className="mt-4 bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-xs">
                  <div className="bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold uppercase p-2 px-3 border-b border-emerald-100 flex justify-between items-center">
                    <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Insumos Extraídos</span>
                    <button className="bg-emerald-600 text-white hover:bg-emerald-700 px-2 py-1 rounded text-[9px] cursor-pointer shadow-xs" onClick={() => showToast("Insumos importados para a grade de orçamento!", "success")}>
                      Aplicar Insumos
                    </button>
                  </div>
                  <div className="p-2.5 space-y-2">
                    {m.itens.map((it: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-100 rounded text-xs select-text">
                        <span className="font-semibold text-zinc-800 flex-1 pr-2 line-clamp-1">{it.category}</span>
                        <span className="font-mono text-zinc-600 font-bold whitespace-nowrap">R$ {it.planned?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isQueryingOrc && (
            <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200/60 flex items-center gap-2.5 text-zinc-600 text-xs font-semibold animate-pulse mr-4">
              <Sparkles className="h-4.5 w-4.5 text-amber-500 shrink-0 animate-spin" />
              <span>Analisando parâmetros SINAPI e planilhas...</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-100 bg-white shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
          <div className="flex gap-2 overflow-x-auto pb-3 mb-1 font-sans scrollbar-hide">
            {[
              { label: "Gerar macro resumo", q: "Pode me dar uma estimativa macro focada em fundações e superestrutura?" },
              { label: "Quais tributos?", q: "Qual a estimativa de impostos e BDI médios para este tamanho de obra em Curitiba?" },
              { label: "Sugira insumos", q: "Sugira uma matriz básica de insumos para este tipo de obra (cimento, aço, areia, brita)." }
            ].map((chip, idx) => (
              <button
                key={idx}
                disabled={isQueryingOrc}
                onClick={() => handleAskOrc(chip.q)}
                className="shrink-0 px-2.5 py-1.5 text-[10px] font-bold font-mono text-zinc-600 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-950 rounded-lg transition-all cursor-pointer"
              >
                💡 {chip.label}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-2 relative">
            <textarea
              value={orcInput}
              onChange={(e) => setOrcInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAskOrc(orcInput);
                }
              }}
              disabled={isQueryingOrc}
              placeholder="Descreva seu projeto ou cole um escopo..."
              className="flex-1 px-3.5 py-2.5 pr-10 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-sans placeholder-zinc-450 focus:outline-hidden focus:ring-2 focus:ring-zinc-900 focus:bg-white resize-none min-h-[44px] max-h-[120px]"
              rows={1}
            />
            <button
              type="button"
              onClick={() => handleAskOrc(orcInput)}
              disabled={isQueryingOrc || !orcInput.trim()}
              className="absolute right-2 bottom-1.5 p-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors disabled:opacity-50 disabled:bg-zinc-300"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      {/* Google Meet Schedule Modal */}
      {showMeetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-zinc-200 overflow-hidden flex flex-col font-sans animate-fade-in-scale">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <Video className="h-5 w-5 text-blue-600" />
                Agendar Reunião Comercial (Meet)
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Cliente / Obra</label>
                <div className="px-3 py-2 bg-zinc-50 text-sm font-semibold rounded-xl text-zinc-800 border border-zinc-200">
                  {oportunidade.client} — {oportunidade.title}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Data</label>
                  <input
                    type="date"
                    value={meetDate}
                    onChange={(e) => setMeetDate(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Horário</label>
                  <input
                    type="time"
                    value={meetTime}
                    onChange={(e) => setMeetTime(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">E-mail do Cliente (Para Convite)</label>
                <input
                  type="email"
                  placeholder="cliente@exemplo.com"
                  value={meetClientEmail}
                  onChange={(e) => setMeetClientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <p className="text-[10px] text-zinc-500 mt-1.5 ml-1">Um convite do Google Calendar será enviado contendo o link do Meet.</p>
              </div>
            </div>
            <div className="p-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50">
              <button
                onClick={() => setShowMeetModal(false)}
                className="px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-200/50 rounded-lg cursor-pointer transition-colors"
                disabled={isSchedulingMeet}
              >
                Cancelar
              </button>
              <button
                onClick={confirmScheduledMeet}
                disabled={isSchedulingMeet}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-2"
              >
                {isSchedulingMeet ? "Agendando..." : "Confirmar e Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gmail Email Schedule Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-zinc-200 overflow-hidden flex flex-col font-sans animate-fade-in-scale">
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                <Mail className="h-5 w-5 text-red-500" />
                Enviar Mensagem via Gmail
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Para (E-mail do Cliente)</label>
                <input
                  type="email"
                  placeholder="cliente@exemplo.com"
                  value={meetClientEmail}
                  onChange={(e) => setMeetClientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Assunto</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Mensagem (Corpo)</label>
                <textarea
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                  placeholder="Olá! Seguem os acompanhamentos..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-zinc-100 flex justify-end gap-3 bg-zinc-50">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-zinc-200/50 rounded-lg cursor-pointer transition-colors"
                disabled={isSendingEmail}
              >
                Cancelar
              </button>
              <button
                onClick={confirmSendEmail}
                disabled={isSendingEmail}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-2"
              >
                {isSendingEmail ? "Enviando..." : "Enviar Email Pelo Gmail"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
