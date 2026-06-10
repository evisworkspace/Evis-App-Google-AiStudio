import React, { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Cliente,
  createCliente,
  getClientes,
  softDeleteCliente,
} from "../../services/clienteService";
import {
  getMemoryEvents,
  getImportRuns,
  deleteAllUserData,
} from "../../services/acervoService";
import type { ImportRun } from "../../types";
import {
  Sparkles,
  Sliders,
  CheckCircle,
  Building,
  User,
  ShieldAlert,
  CreditCard,
  PlusSquare,
  Users,
  HardHat,
  Search,
  ExternalLink,
  Download,
  Trash2,
  Archive,
  FileText,
  Loader2,
} from "lucide-react";

export default function AdminView() {
  const { currentRoute, setCurrentRoute, companyId, showToast, currentUser } = useApp();
  const uid = currentUser?.uid || "";

  const [acervoExporting, setAcervoExporting] = useState(false);
  const [acervoDeleting, setAcervoDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [lastRun, setLastRun] = useState<ImportRun | null>(null);
  const [loadingRun, setLoadingRun] = useState(false);

  useEffect(() => {
    if (currentRoute !== "configuracoes-acervo" || !uid) return;
    let cancelled = false;
    setLoadingRun(true);
    getImportRuns(uid)
      .then((runs) => { if (!cancelled) setLastRun(runs[0] || null); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingRun(false); });
    return () => { cancelled = true; };
  }, [currentRoute, uid]);

  const handleExportJson = async () => {
    if (!uid) return;
    setAcervoExporting(true);
    try {
      const events = await getMemoryEvents(uid);
      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), total: events.length, events }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `acervo_${new Date().toISOString().substring(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`${events.length} relatos exportados.`, "success");
    } catch {
      showToast("Erro ao exportar acervo.", "error");
    } finally {
      setAcervoExporting(false);
    }
  };

  const handleExportMarkdown = async () => {
    if (!uid) return;
    setAcervoExporting(true);
    try {
      const events = await getMemoryEvents(uid);
      const md = events
        .map((e) => `# ${e.title}\n\n> Data: ${e.eventDate} (${e.dateConfidence}) · Origem: ${e.sourceFile}\n\n${e.content}`)
        .join("\n\n---\n\n");
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `acervo_${new Date().toISOString().substring(0, 10)}.md`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`${events.length} relatos exportados como Markdown.`, "success");
    } catch {
      showToast("Erro ao exportar Markdown.", "error");
    } finally {
      setAcervoExporting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (deleteConfirmText !== "APAGAR TUDO") {
      showToast('Digite "APAGAR TUDO" para confirmar.', "error");
      return;
    }
    setAcervoDeleting(true);
    try {
      await deleteAllUserData(uid);
      showToast("Todos os dados do acervo foram apagados.", "info");
      setDeleteConfirmText("");
      setLastRun(null);
    } catch {
      showToast("Erro ao apagar dados.", "error");
    } finally {
      setAcervoDeleting(false);
    }
  };

  const [companyName, setCompanyName] = useState("Curitiba Construtora S/A");
  const [cnpj, setCnpj] = useState("12.345.678/0001-90");
  const [municipalRegistration, setMunicipalRegistration] = useState("IS-982.110.33-A");

  const [fornecedores, setFornecedores] = useState([
    { name: "Cemex Concresul Paraná", cnpj: "44.921.432/0001-44", type: "Concreto Usinado", rating: "A" },
    { name: "Gerdau Metais Filial Sul", cnpj: "05.120.301/0002-11", type: "Aços e Juntas", rating: "A+" },
    { name: "Curitiba Blocos & Lajes Ltda", cnpj: "20.302.404/0001-85", type: "Artefatos Cimento", rating: "B+" },
  ]);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (currentRoute !== "cadastros-clientes" || !companyId) return;

    const loadClientes = async () => {
      setLoadingClientes(true);
      try {
        const loadedClientes = await getClientes(companyId);
        if (!cancelled) setClientes(loadedClientes);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        if (!cancelled) showToast("Erro ao carregar clientes do Firestore.", "error");
      } finally {
        if (!cancelled) setLoadingClientes(false);
      }
    };

    loadClientes();

    return () => {
      cancelled = true;
    };
  }, [currentRoute, companyId, showToast]);

  const handleAddCliente = async () => {
    if (!companyId) {
      showToast("Empresa não selecionada para cadastrar cliente.", "error");
      return;
    }

    const name = prompt("Nome do cliente / incorporador:")?.trim();
    if (!name) return;

    const cnpjCliente = prompt("CNPJ do cliente:")?.trim() || "Não informado";
    const type = prompt("Segmento do cliente:")?.trim() || "Contratante";

    try {
      const created = await createCliente(companyId, {
        name,
        cnpj: cnpjCliente,
        type,
        contracts: 0,
      });
      setClientes((prev) => [created, ...prev]);
      showToast("Cliente cadastrado no Firestore.", "success");
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      showToast("Erro ao cadastrar cliente no Firestore.", "error");
    }
  };

  const handleSoftDeleteCliente = async (cliente: Cliente) => {
    if (!companyId) return;

    try {
      await softDeleteCliente(companyId, cliente.id);
      setClientes((prev) => prev.filter((item) => item.id !== cliente.id));
      showToast(`Cliente "${cliente.name}" arquivado.`, "info");
    } catch (error) {
      console.error("Erro ao arquivar cliente:", error);
      showToast("Erro ao arquivar cliente no Firestore.", "error");
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* -------------------- CADASTROS: FORNECEDORES -------------------- */}
      {currentRoute === "cadastros-fornecedores" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5 text-left">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4.5">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                Cadastro de subempreiteiras, usinas e fornecedores homologados
              </h3>
              <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
                Relação fiscal de fornecedores avaliados pelo controle de qualidade EVIS.
              </p>
            </div>
            <button className="py-1 px-2.5 bg-[hsl(var(--color-primary))] text-white font-mono text-[9.5px] font-bold rounded hover:bg-blue-600 cursor-pointer uppercase">
              + Cadastrar Fornecedor
            </button>
          </div>

          <div className="space-y-3">
            {fornecedores.map((f, idx) => (
              <div key={idx} className="p-3 bg-zinc-50 border border-zinc-150 rounded-md flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-zinc-800">{f.name}</h4>
                  <span className="text-[10px] font-mono text-zinc-400 block mt-1">CNPJ: {f.cnpj} • Especialidade: {f.type}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">
                    Rating {f.rating}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------- CADASTROS: CLIENTES -------------------- */}
      {currentRoute === "cadastros-clientes" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5 text-left">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4.5">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                Clientes Incorporadores, SPEs e Contratantes
              </h3>
              <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
                Relação de contratantes finais de medições físicas.
              </p>
            </div>
            <button onClick={handleAddCliente} className="py-1 px-2.5 bg-[hsl(var(--color-primary))] text-white font-mono text-[9.5px] font-bold rounded hover:bg-blue-600 cursor-pointer uppercase">
              + Adicionar Cliente SPE
            </button>
          </div>

          <div className="space-y-3">
            {loadingClientes ? (
              <p className="text-xs text-zinc-400 py-6 text-center">Carregando clientes...</p>
            ) : clientes.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">Nenhum cliente cadastrado para esta empresa.</p>
            ) : clientes.map((c) => (
              <div key={c.id} className="p-3 bg-zinc-50 border border-zinc-150 rounded-md flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-zinc-800">{c.name}</h4>
                  <p className="text-[10px] font-mono text-zinc-400 mt-1">CNPJ: {c.cnpj} • Segmento: {c.type}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-sans text-zinc-500 block">
                    {c.contracts ?? 0} contratos ativos
                  </span>
                  <button
                    onClick={() => handleSoftDeleteCliente(c)}
                    className="text-[9px] text-rose-500 hover:text-rose-700 font-mono uppercase mt-1 cursor-pointer"
                  >
                    Arquivar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------- CONFIGURAÇÕES: EMPRESA -------------------- */}
      {currentRoute === "configuracoes-empresa" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5 max-w-md mx-auto text-left">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4.5 block">
            Dados Fiscais e Cadastrais Corporativos
          </h3>

          <form onSubmit={(e) => { e.preventDefault(); alert("Dados empresariais atualizados e sincronizados com a contabilidade fiscal central!"); }} className="space-y-4 font-sans">
            <div>
              <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1">Razão Social Ltda / S.A.</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-xs select-text text-zinc-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1">CNPJ Fiscal</label>
                <input
                  type="text"
                  required
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-xs select-text text-zinc-800"
                />
              </div>

              <div>
                <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1">Inscrição Municipal</label>
                <input
                  type="text"
                  required
                  value={municipalRegistration}
                  onChange={(e) => setMunicipalRegistration(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-xs select-text text-zinc-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[hsl(var(--color-primary))] text-white font-mono uppercase font-bold text-xs rounded hover:bg-opacity-95 cursor-pointer"
            >
              Salvar Configuração Fiscal
            </button>
          </form>
        </div>
      )}

      {/* -------------------- CONFIGURAÇÕES: CONTAS -------------------- */}
      {currentRoute === "configuracoes-contas" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5 max-w-sm mx-auto text-left">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4 flex items-center gap-1 leading-none">
            <Sliders className="h-4.5 w-4.5" /> Chaves de Integração de Conta
          </h3>

          <div className="space-y-4">
            <div className="p-3.5 bg-zinc-50 border border-zinc-150 rounded">
              <span className="text-[10px] font-bold text-zinc-800 block">Integração Bancária OFX Autologging</span>
              <p className="text-[10.5px] text-zinc-500 mt-1">Sincronização instantânea com Itaú Construtora e Caixa Econômica.</p>
              <span className="inline-block mt-3 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[9px] font-mono font-bold uppercase">
                ATIVO E CONCILIADO
              </span>
            </div>

            <div className="p-3.5 bg-zinc-50 border border-zinc-150 rounded">
              <span className="text-[10px] font-bold text-zinc-800 block">Cofre de Certificado Digital A3</span>
              <p className="text-[10.5px] text-zinc-500 mt-1">Autorização eletrônica de NFe e RDOs por assinatura em lote.</p>
              <span className="inline-block mt-3 px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[9px] font-mono font-bold uppercase">
                CERTIFICADO VALIDA EM 120 DIAS
              </span>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- CONFIGURAÇÕES: ACERVO -------------------- */}
      {currentRoute === "configuracoes-acervo" && (
        <div className="space-y-4 max-w-lg mx-auto">
          {/* Header */}
          <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3 mb-4">
              <Archive className="h-4 w-4 text-zinc-600" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                Backup & Controle do Acervo
              </h3>
            </div>

            {/* Export JSON */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                <div>
                  <p className="text-[11px] font-semibold text-zinc-800">Exportar acervo completo — JSON</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Todos os relatos com metadados completos</p>
                </div>
                <button
                  onClick={handleExportJson}
                  disabled={acervoExporting}
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-zinc-900 text-white font-mono text-[9.5px] font-bold rounded hover:bg-zinc-700 cursor-pointer uppercase disabled:opacity-50 transition-colors"
                >
                  {acervoExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                  JSON
                </button>
              </div>

              {/* Export Markdown */}
              <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-100 rounded-lg">
                <div>
                  <p className="text-[11px] font-semibold text-zinc-800">Exportar acervo — Markdown</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Todos os relatos concatenados em um .md</p>
                </div>
                <button
                  onClick={handleExportMarkdown}
                  disabled={acervoExporting}
                  className="flex items-center gap-1.5 py-1.5 px-3 bg-zinc-100 text-zinc-700 font-mono text-[9.5px] font-bold rounded hover:bg-zinc-200 cursor-pointer uppercase disabled:opacity-50 transition-colors"
                >
                  {acervoExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                  .MD
                </button>
              </div>
            </div>
          </div>

          {/* Last import run */}
          <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
            <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider text-zinc-700 border-b border-zinc-100 pb-2 mb-3">
              Último relatório de importação
            </h4>
            {loadingRun ? (
              <div className="flex items-center gap-2 py-3 text-zinc-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="text-[10px]">Carregando...</span>
              </div>
            ) : !lastRun ? (
              <p className="text-[10px] text-zinc-400 py-2">Nenhuma importação registrada.</p>
            ) : (
              <div className="space-y-1 text-[10px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Data</span>
                  <span className="text-zinc-700">{new Date(lastRun.startedAt).toLocaleString("pt-BR")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Criados</span>
                  <span className="text-emerald-600 font-bold">{lastRun.successCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Erros</span>
                  <span className={lastRun.errorCount > 0 ? "text-red-500 font-bold" : "text-zinc-400"}>{lastRun.errorCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Sem data</span>
                  <span className="text-amber-600">{lastRun.unknownDateCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Duplicados</span>
                  <span className="text-orange-500">{lastRun.duplicateCandidates}</span>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-100 pt-1 mt-1">
                  <span className="text-zinc-400">Run ID</span>
                  <span className="text-zinc-600">{lastRun.id.substring(0, 12)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Delete all */}
          <div className="bg-white border border-red-200 rounded-lg p-5">
            <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider text-red-600 border-b border-red-100 pb-2 mb-3 flex items-center gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Zona de Perigo
            </h4>
            <p className="text-[10px] text-zinc-500 mb-3">
              Apaga permanentemente todos os relatos e histórico de importações. Esta ação não pode ser desfeita.
            </p>
            <div className="space-y-2">
              <label className="text-[9px] font-mono font-bold text-zinc-400 uppercase block">
                Digite "APAGAR TUDO" para confirmar
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder='APAGAR TUDO'
                className="w-full px-3 py-2 bg-zinc-50 border border-red-200 rounded text-xs font-mono text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-red-400"
              />
              <button
                onClick={handleDeleteAll}
                disabled={acervoDeleting || deleteConfirmText !== "APAGAR TUDO"}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-600 text-white font-mono text-[10px] font-bold rounded cursor-pointer uppercase hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {acervoDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Apagar todos os dados do acervo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- PLANOS & BILLING -------------------- */}
      {currentRoute === "planos" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-6 max-w-2xl mx-auto text-left">
          <div className="text-center pb-6 border-b border-zinc-100">
            <CreditCard className="h-10 w-10 text-[hsl(var(--color-primary))] mx-auto mb-2 animate-pulse" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-950">
              EVIS SaaS Portal — Faturamento & Licenças
            </h2>
            <p className="text-[11px] text-zinc-505 max-w-sm mx-auto mt-1 leading-relaxed">
              Residencial Belle Vue & Curitiba Construtora operando sob a licença corporativa modular.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded flex flex-col justify-between">
              <div>
                <span className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase tracking-wide">Modalidade Ativa</span>
                <h4 className="text-sm font-bold text-zinc-800 font-sans mt-1">Plano Construtora Enterprise</h4>
                <p className="text-[11px] text-zinc-500 mt-3.5 leading-relaxed">
                  • Canteiros de Obra Ilimitados<br />
                  • Armazenamento Ilimitado de Projetos (DWG)<br />
                  • 10 Assinaturas Técnicas de RDO em Lote<br />
                  • Assistente de Inteligência Artificial EVIS Integrado
                </p>
              </div>

              <div className="mt-5 border-t border-zinc-150 pt-2.5">
                <span className="text-xs font-mono font-bold text-[hsl(var(--color-primary))] block">R$ 1.490,00 <span className="text-[10px] text-zinc-400 font-normal">/ mês</span></span>
                <span className="text-[9.5px] text-zinc-400 block mt-1.5 font-mono">Próxima renovação: 29/06/2026</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/20 border border-[hsl(var(--color-primary))] rounded flex flex-col justify-between">
              <div>
                <span className="text-[9.5px] font-mono font-bold text-blue-500 uppercase tracking-widest block leading-none">Assistente Inteligente</span>
                <h4 className="text-sm font-bold text-zinc-800 font-sans mt-2">Uso da Inteligência Artificial</h4>
                <p className="text-[11px] text-blue-700 mt-3.5 leading-relaxed font-sans">
                  Sua conta possui acesso total e irrestrito ao <span className="font-bold text-zinc-900">Assistente Inteligente EVIS</span>, operado via redes neurais com grounding de cronogramas. Livre de tokens limitadores.
                </p>
              </div>

              <div className="mt-5 border-t border-blue-200 pt-2.5">
                <span className="text-[10px] text-zinc-400 font-bold block uppercase leading-none">Chave de Conexão</span>
                <span className="text-[10.5px] text-emerald-600 font-mono font-bold mt-1.5 block">Configurada via Secrets do Google AI Studio</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
