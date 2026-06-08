import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { getAccessToken, googleSignIn } from "../../lib/auth";
import { createGoogleSheet } from "../../lib/googleApi";
import {
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  FileClock,
  FolderHeart,
  SendHorizontal,
  ChevronRight,
  Search,
  PlusSquare,
  Building,
  Upload,
  User,
  CheckCircle,
  Clock,
  Trash2,
  Info,
  Sparkles
} from "lucide-react";

export default function FinanceiroView() {
  const {
    currentRoute,
    setCurrentRoute,
    accounts,
    lancamentos,
    addLancamento,
    obras
  } = useApp();

  const [descFilter, setDescFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");

  // Local state for Quick Transaction Form (Receita / Despesa)
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState<"receita" | "despesa">("despesa");
  const [newCat, setNewCat] = useState("Materiais de Obra");
  const [newAcc, setNewAcc] = useState("acc_1");
  const [newProj, setNewProj] = useState("all");

  // State for Transfer tool
  const [fromAcc, setFromAcc] = useState("acc_1");
  const [toAcc, setToAcc] = useState("acc_2");
  const [transferAmount, setTransferAmount] = useState("");

  const handlePostTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newAmount);
    if (!newDesc.trim() || isNaN(parsedAmount)) return;

    const projectId = newProj === "all" ? undefined : newProj;
    addLancamento(newDesc, parsedAmount, newType, newCat, newAcc, projectId);

    setNewDesc("");
    setNewAmount("");
    alert("Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.");
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(transferAmount);
    if (isNaN(parsed) || parsed <= 0) return;

    if (fromAcc === toAcc) {
      alert("Selecione contas de origem e destino diferentes para efetuar a transferência!");
      return;
    }

    const source = accounts.find((a) => a.id === fromAcc);
    if (source && source.balance < parsed) {
      alert("Saldo insuficiente na conta de origem para esta transferência!");
      return;
    }

    // Book as despesa in origin and receita in destination
    addLancamento(`Transferência: Saída para ${accounts.find((a)=>a.id===toAcc)?.name}`, parsed, "despesa", "Transferência", fromAcc);
    addLancamento(`Transferência: Entrada vinda de ${source?.name}`, parsed, "receita", "Transferência", toAcc);

    setTransferAmount("");
    alert("Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.");
  };

  const deleteTransaction = (id: string) => {
    alert("Operação bloqueada por nível de acesso (Eng. Berti possui perfil de Aprovador Técnico. Para exclusões contábeis permanentes, contate o CFO Financeiro).");
  };

  // Helper arrays
  const categoriesList = [
    { name: "Materiais de Obra", count: 18, budget: 1450000 },
    { name: "Medição de Obra", count: 9, budget: 3800000 },
    { name: "Equipamentos / Ferramental", count: 12, budget: 95000 },
    { name: "Projetos de Arquitetura", count: 5, budget: 120000 },
    { name: "Gastos Gerais Canteiro", count: 32, budget: 45000 },
    { name: "Mão de Obra Avulsa", count: 14, budget: 82000 },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* -------------------- RESUMO -------------------- */}
      {currentRoute === "financeiro-resumo" && (
        <div className="space-y-6">
          {/* Vera Financeira (Auditora de Caixa) */}
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/40 rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2">
               <Sparkles className="h-4 w-4" /> Vera Financeira (Auditora de Caixa)
            </h3>
            <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
               Contas conciliadas com sucesso. O caixa projetado fica pressionado neste período.<br/>
               Esta despesa no "Residencial Kairo" pode comprometer a margem da obra.<br/>
               Lançamentos financeiros exigem confirmação.
            </p>
            <div className="mt-3 flex gap-3">
               <button className="text-[10px] font-bold px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer rounded shadow-sm"
                 onClick={() => alert("Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.")}
               >
                 Analisar impactos do Kairo
               </button>
               <button className="text-[10px] font-bold px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer rounded shadow-sm"
                 onClick={() => alert("Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.")}
               >
                 Simular projeção (30 dias)
               </button>
            </div>
          </div>

          {/* Quick Bank Accounts Balances Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <div key={acc.id} className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-4 custom-grid-line">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block leading-none">{acc.bank}</span>
                    <h3 className="text-xs font-bold text-zinc-800 font-sans mt-1">{acc.name}</h3>
                  </div>
                  <Coins className="h-5 w-5 text-zinc-450" />
                </div>
                <p className="text-base font-mono font-bold text-zinc-950 mt-3">
                  R$ {acc.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[9.5px] font-mono text-zinc-400 mt-1 block leading-none">{acc.accountNumber}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quick transaction poster */}
            <div className="bg-white border border-[hsl(var(--color-border))] lg:col-span-4 rounded-lg p-5">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 block">
                Novo Lançamento Rápido
              </h3>

              <form onSubmit={handlePostTransaction} className="space-y-3.5 mt-4 text-xs">
                <div>
                  <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1">Descrição</label>
                  <input
                    type="text"
                    required
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded"
                    placeholder="Ex: Compra Sacos de Cimento Usina"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      required
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded text-xs"
                      placeholder="1200"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1">Tipo</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded cursor-pointer"
                    >
                      <option value="despesa">📉 Despesa (-)</option>
                      <option value="receita">📈 Receita (+)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1">Categoria</label>
                    <select
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded text-[11px]"
                    >
                      <option value="Materiais de Obra">Materiais de Obra</option>
                      <option value="Medição de Obra">Medição de Obra</option>
                      <option value="Equipamentos / Ferramental">Equipamentos</option>
                      <option value="Gastos Gerais Canteiro">Gerais Canteiro</option>
                      <option value="Projetos de Arquitetura">Projetos/Estudos</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1">Conta Caixa</label>
                    <select
                      value={newAcc}
                      onChange={(e) => setNewAcc(e.target.value)}
                      className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded text-[11px]"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name.slice(0, 15)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1">Obra Associada</label>
                  <select
                    value={newProj}
                    onChange={(e) => setNewProj(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded"
                  >
                    <option value="all">Nenhuma (Fluxo Administrativo)</option>
                    {obras.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2 bg-[hsl(var(--color-primary))] text-white font-semibold font-mono uppercase text-[10.5px] rounded cursor-pointer hover:bg-opacity-95"
                >
                  Confirmar Lançamento
                </button>
              </form>
            </div>

            {/* General financial statement overview */}
            <div className="bg-white border border-[hsl(var(--color-border))] lg:col-span-8 rounded-lg p-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                  Transações Reconciliadas Gerais
                </h3>
                <span className="text-[10px] font-mono text-zinc-400">Total: {lancamentos.length} logs</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 text-[10.5px] text-zinc-400 font-mono uppercase">
                      <th className="pb-2">Histórico / Relator</th>
                      <th className="pb-2">Filtro / Categoria</th>
                      <th className="pb-2 text-right">Valor da Ordem</th>
                      <th className="pb-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 text-xs">
                    {lancamentos.slice(0, 5).map((ln) => (
                      <tr key={ln.id} className="hover:bg-zinc-50/50">
                        <td className="py-2.5">
                          <span className="font-semibold text-zinc-850 block">{ln.description}</span>
                          <span className="text-[9.5px] font-mono text-zinc-400 mt-0.5 block">{ln.date} • {accounts.find(a=>a.id === ln.bankAccount)?.name}</span>
                        </td>
                        <td className="py-2.5 font-mono text-[10.5px] text-zinc-500">{ln.category}</td>
                        <td className={`py-2.5 text-right font-mono font-bold ${
                          ln.type === "receita" ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {ln.type === "receita" ? "+" : "-"} R$ {ln.amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-center">
                          <button
                            onClick={() => deleteTransaction(ln.id)}
                            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- RECEITAS -------------------- */}
      {currentRoute === "financeiro-receitas" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4 block">
            Entradas e Receitas de Medição
          </h3>
          <div className="space-y-3">
            {lancamentos.filter(l => l.type === "receita").map((rec) => (
              <div key={rec.id} className="p-3 bg-emerald-50/30 border border-emerald-100 rounded-md flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9.5px] font-mono font-bold text-emerald-600 uppercase bg-emerald-100/50 px-1.5 py-0.5 rounded leading-none">RECEITA AUDITADA</span>
                  <p className="font-semibold text-zinc-800 font-sans mt-2">{rec.description}</p>
                  <span className="text-[9.5px] font-mono text-zinc-400 block mt-1">Lançado: {rec.date} • Caixa: {accounts.find(a=>a.id===rec.bankAccount)?.name}</span>
                </div>
                <span className="text-sm font-mono font-bold text-emerald-600 shrink-0">
                  + R$ {rec.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* -------------------- DESPESAS -------------------- */}
      {currentRoute === "financeiro-despesas" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4 block">
                Saídas e Faturamentos de Insumos
              </h3>
              <div className="space-y-3.5">
                {lancamentos.filter(l => l.type === "despesa").map((des) => (
                  <div key={des.id} className="p-3 bg-zinc-50 border border-zinc-150 rounded-md flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9.5px] font-mono font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1 rounded block w-fit">DESPESA</span>
                      <p className="font-semibold text-zinc-800 font-sans mt-2">{des.description}</p>
                      <p className="text-[9.5px] font-mono text-zinc-400 mt-1">Frente de Custo: {des.category} • {des.date}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-rose-600 shrink-0">
                      - R$ {des.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drag & drop mock layout */}
          <div className="space-y-4">
            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 block">
                Leitor Automático de Notas XML / PDF
              </h3>
              
              <div className="border-2 border-dashed border-zinc-200 hover:border-blue-500 rounded-lg p-8 mt-4.5 text-center cursor-pointer transition-colors">
                <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2 animate-bounce" />
                <span className="text-xs font-bold text-zinc-800 block">Arraste a Nota Fiscal Técnica</span>
                <span className="text-[10px] text-zinc-400 font-mono mt-1 block">Suporta Danfe XML ou PDF de Insumos</span>
              </div>
              
              <p className="text-[10px] text-zinc-450 mt-3Leading-relaxed text-center">
                O assistente EVIS detectará automaticamente o valor do faturamento, CNPJ do fornecedor e impostos de prefeitura retidos no ato do upload.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- CENTRAL CONCILIAÇÃO -------------------- */}
      {currentRoute === "financeiro-central" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4 font-sans">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                Conciliação Central - Match Eletrônico de Caixa
              </h3>
              <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
                Sincronização imediata de extratos OFX contra faturas de medições e ordens de compra.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold">
              100% CONCILIADO
            </span>
          </div>

          <div className="p-12 text-center">
            <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-xs font-bold text-zinc-800">Parabéns Eng. Berti!</h4>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Todas as transações do Itaú Construtora e Bradesco Operações foram devidamente conciliadas contra as notas fiscais e diários (RDO) de hoje.
            </p>
          </div>
        </div>
      )}

      {/* -------------------- LANÇAMENTOS MASTER -------------------- */}
      {currentRoute === "financeiro-lancamentos" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-3 mb-4.5 gap-3">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 font-mono">
                Livro Diário Técnico de Lançamentos
              </h3>
              <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
                Abaixo está a planilha de apropriação e rateio do portfólio completo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    let token = await getAccessToken();
                    if (!token) {
                      const res = await googleSignIn();
                      if (res) token = res.accessToken;
                      else return;
                    }
                    
                    const rows = [
                      ["ID", "Data", "Descrição", "Categoria", "Valor", "Tipo", "Conta"],
                      ...lancamentos.map(L => [
                        L.id, 
                        L.date, 
                        L.description, 
                        L.category, 
                        L.amount.toString(), 
                        L.type, 
                        accounts.find(a=>a.id===L.bankAccount)?.name || L.bankAccount
                      ])
                    ];

                    const url = await createGoogleSheet(token!, `EVIS - Diário Fluxo de Caixa ${new Date().toLocaleDateString('pt-BR')}`, rows);
                    alert("Ambiente simulado: a IA recomenda, o humano confirma e nenhuma ação real é executada nesta fase.");
                    window.open(url, "_blank");
                  } catch(e: any) {
                    alert(`Erro exportando Sheets: ${e.message}`);
                  }
                }}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg font-bold font-mono text-[10px] border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Google Sheets
              </button>
              <input
                type="text"
                value={descFilter}
                onChange={(e) => setDescFilter(e.target.value)}
                placeholder="Pesquisar histórico..."
                className="px-2.5 py-1.5 bg-zinc-50 text-[11px] border border-zinc-200 rounded focus:outline-hidden text-zinc-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-150 text-[10.5px] text-zinc-400 font-mono uppercase">
                  <th className="pb-2">Data / Obra</th>
                  <th className="pb-2">Descrição Lançamento</th>
                  <th className="pb-2">Categoria</th>
                  <th className="pb-2 text-right">Valor Líquido</th>
                  <th className="pb-2 text-center">Medidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {lancamentos
                  .filter((l) => l.description.toLowerCase().includes(descFilter.toLowerCase()))
                  .map((ln) => (
                    <tr key={ln.id} className="hover:bg-zinc-50/50">
                      <td className="py-2.5 font-mono text-[10.5px] text-zinc-500">
                        {ln.date}
                        <span className="block text-[9.5px] font-sans font-semibold text-zinc-400 mt-0.5 truncate">
                          {ln.project ? "Belle Vue" : "Geral Corporativo"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="font-semibold text-zinc-800 block">{ln.description}</span>
                        <span className="text-[9.5px] text-zinc-400 font-mono mt-0.5 block">{accounts.find(a=>a.id===ln.bankAccount)?.name}</span>
                      </td>
                      <td className="py-2.5 text-[10.5px] font-mono text-zinc-500">{ln.category}</td>
                      <td className={`py-2.5 text-right font-mono font-bold ${
                        ln.type === "receita" ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {ln.type === "receita" ? "+" : "-"} R$ {ln.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          onClick={() => deleteTransaction(ln.id)}
                          className="px-2 py-1 text-[10px] text-zinc-500 bg-zinc-100 hover:bg-zinc-200 rounded cursor-pointer"
                        >
                          Bloquear
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* -------------------- TRANSFERÊNCIAS -------------------- */}
      {currentRoute === "financeiro-transferencias" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5 max-w-md mx-auto">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4 flex items-center gap-1.5 leading-none">
            <SendHorizontal className="h-4.5 w-4.5 text-blue-500" /> Transferência entre Contas Caixa
          </h3>

          <form onSubmit={handleTransfer} className="space-y-4 text-xs font-sans text-left">
            <div>
              <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1">Conta de Origem (Debitar)</label>
              <select
                value={fromAcc}
                onChange={(e) => setFromAcc(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} — R$ {a.balance.toLocaleString()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1">Conta de Destino (Creditar)</label>
              <select
                value={toAcc}
                onChange={(e) => setToAcc(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} — R$ {a.balance.toLocaleString()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase block mb-1">Valor da Transferência (R$)</label>
              <input
                type="number"
                required
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded"
                placeholder="Ex: 50000"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[hsl(var(--color-primary))] text-white font-mono uppercase font-bold text-xs rounded hover:bg-opacity-95 cursor-pointer transition-colors"
            >
              Executar Transferência de Fundos
            </button>
          </form>
        </div>
      )}

      {/* -------------------- FLUXO DE CAIXA (SVG CHART) -------------------- */}
      {currentRoute === "financeiro-fluxo-de-caixa" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4 block">
            Evolução de Fluxo de Caixa Acumulado
          </h3>

          {/* SVG Cash Flow Lines */}
          <div className="h-64 w-full mt-6">
            <svg className="h-full w-full" viewBox="0 0 600 240">
              <line x1="40" y1="40" x2="580" y2="40" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="90" x2="580" y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="140" x2="580" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="190" x2="580" y2="190" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="210" x2="580" y2="210" stroke="#e2e8f0" strokeWidth="1" />

              <text x="5" y="45" fill="#94a3b8" fontSize="8" fontFamily="monospace">1M</text>
              <text x="5" y="95" fill="#94a3b8" fontSize="8" fontFamily="monospace">750k</text>
              <text x="5" y="145" fill="#94a3b8" fontSize="8" fontFamily="monospace">500k</text>
              <text x="5" y="195" fill="#94a3b8" fontSize="8" fontFamily="monospace">250k</text>
              <text x="5" y="213" fill="#94a3b8" fontSize="8" fontFamily="monospace">0</text>

              {/* Inflow bar indicators */}
              <rect x="100" y="90" width="15" height="120" fill="#10b981" rx="2" />
              <rect x="120" y="130" width="15" height="80" fill="#f43f5e" rx="2" />

              <rect x="240" y="60" width="15" height="150" fill="#10b981" rx="2" />
              <rect x="260" y="100" width="15" height="110" fill="#f43f5e" rx="2" />

              <rect x="380" y="40" width="15" height="170" fill="#10b981" rx="2" />
              <rect x="400" y="120" width="15" height="90" fill="#f43f5e" rx="2" />

              <text x="100" y="225" fill="#64748b" fontSize="8" fontFamily="sans-serif">Abril</text>
              <text x="240" y="225" fill="#64748b" fontSize="8" fontFamily="sans-serif">Maio</text>
              <text x="380" y="225" fill="#64748b" fontSize="8" fontFamily="sans-serif">Junho (Hoje)</text>
            </svg>
          </div>
          
          <div className="flex gap-4 text-xs font-mono font-semibold justify-center mt-3 border-t border-zinc-100 pt-3">
            <span className="flex items-center gap-1"><span className="h-2 w-4 bg-emerald-500 rounded-sm"></span> ENTRADAS (RECEITAS)</span>
            <span className="flex items-center gap-1"><span className="h-2 w-4 bg-rose-500 rounded-sm"></span> SAÍDAS (DESPESAS)</span>
          </div>
        </div>
      )}

      {/* -------------------- DRE DE OBRA (TABULAR) -------------------- */}
      {currentRoute === "financeiro-dre" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5 font-sans">
          <div className="border-b border-zinc-100 pb-3 mb-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
              DRE Comparativo de Resultados Técnicos
            </h3>
            <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
              Demonstrativo de Resultado de Exercício - Curitiba Construtora Consolidação.
            </p>
          </div>

          <div className="overflow-x-auto text-[11.5px] leading-relaxed select-text">
            <div className="min-w-[500px]">
              <div className="grid grid-cols-3 py-2 font-bold font-mono border-b border-zinc-250 bg-zinc-50 px-3 uppercase text-[10px] text-zinc-400">
                <span>Indicadores / Linhas Contábeis</span>
                <span className="text-right">Acumulado Anual (R$)</span>
                <span className="text-right">Aderência (%)</span>
              </div>

              {[
                { label: "(+) RECEITA OPERACIONAL BRUTA (Medições)", val: 18500000, margin: "100.0%", type: "head" },
                { label: "(-) Impostos e Deduções Municipais ISS", val: -555000, margin: "-3.0%", type: "sub" },
                { label: "(=) RECEITA OPERACIONAL LÍQUIDA", val: 17945000, margin: "97.0%", type: "mid" },
                { label: "(-) CUSTO DOS PRODUTOS VENDIDOS (CPV)", val: -12640000, margin: "-68.3%", type: "head" },
                { label: "   Custo de Materiais e Insumos SINAPI", val: -8412000, margin: "-45.4%", type: "sub" },
                { label: "   Mão de Obra de Campo & Força de Trabalho", val: -3420000, margin: "-18.4%", type: "sub" },
                { label: "   Encargos de Equipamentos e Gruas", val: -808000, margin: "-4.3%", type: "sub" },
                { label: "(=) RESULTADO BRUTO COMERCIAL", val: 5305000, margin: "28.7%", type: "mid" },
                { label: "(-) Despesas Gerais Administrativas", val: -542000, margin: "-2.9%", type: "sub" },
                { label: "(=) RESULTADO ANTES DOS IMPOSTOS DE RENDA (EBITDA)", val: 4763000, margin: "25.7%", type: "mid_accent" },
              ].map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-3 py-2.5 px-3 border-b border-zinc-100 ${
                    row.type === "head" ? "font-bold text-zinc-90 w" :
                    row.type === "mid" ? "font-bold text-blue-600 bg-zinc-50/50" :
                    row.type === "mid_accent" ? "font-bold text-white bg-[hsl(var(--color-primary))]" :
                    "text-zinc-650 pl-6"
                  }`}
                >
                  <span>{row.label}</span>
                  <span className="text-right font-mono font-semibold">
                    R$ {row.val.toLocaleString("pt-BR")}
                  </span>
                  <span className="text-right font-mono text-[10.5px]">
                    {row.margin}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* -------------------- CATEGORIAS -------------------- */}
      {currentRoute === "financeiro-categorias" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4 block">
            Classificação Hierárquica de Contas e Categorias
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriesList.map((cat, idx) => (
              <div key={idx} className="p-4 bg-zinc-50 border border-zinc-150 rounded hover:border-zinc-250 transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-850 font-sans">{cat.name}</h4>
                  <FolderHeart className="h-4 w-4 text-zinc-550" />
                </div>
                <div className="mt-3.5 flex items-center justify-between text-[11px] font-mono text-zinc-500 leading-none">
                  <span>{cat.count} lançamentos</span>
                  <span>R$ {(cat.budget / 1000).toFixed(0)}k teto</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
