import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { PurchaseOrder } from "../../types";
import {
  Sparkles,
  Search,
  PlusSquare,
  Building2,
  TrendingUp,
  FileSpreadsheet,
  Coins,
  ArrowRightLeft,
  Briefcase,
  CheckCircle,
  Truck,
  Box,
  BadgeAlert,
  ArrowRight,
  Plus,
  Trash2,
  Activity,
  AlertTriangle,
  History
} from "lucide-react";

type ComprasTab = "panorama" | "solicitacoes" | "cotacoes" | "ordens" | "historico" | "estoque";

export default function ComprasView() {
  const { currentRoute, obras, purchases, setPurchases, getActiveProject, showToast } = useApp();
  const [comprasTab, setComprasTab] = useState<ComprasTab>("panorama");
  const [itemSearch, setItemSearch] = useState("");
  const activeObra = getActiveProject();
  const projectPurchases = purchases.filter(p => p.project === activeObra.id);

  // Solicitações de Compra localized list
  const [solicitacoes, setSolicitacoes] = useState([
    { id: "sc_1", item: "Tijolo Baiano de Ceramica 9x19x19", qty: 8000, unit: "un", project: "Residencial Belle Vue", status: "Aprovada", date: "2026-06-05" },
    { id: "sc_2", item: "Massa Corrida PVA Barrica 25kg", qty: 150, unit: "barricas", project: "Batel Tower", status: "Aguardando Parecer", date: "2026-06-04" },
    { id: "sc_3", item: "Fio de Cobre Flexivel Slime 2.5mm", qty: 20, unit: "rolos", project: "Residencial Kairo", status: "Rascunho", date: "2026-06-03" },
  ]);

  // Form states for SC
  const [newScItem, setNewScItem] = useState("");
  const [newScQty, setNewScQty] = useState("");
  const [newScUnit, setNewScUnit] = useState("un");

  // Comparison Matrix quotes data
  const [comparisonMatrix, setComparisonMatrix] = useState({
    item: "Cimento CP II F-32 Saco 50kg (Lote 1.000 sacos)",
    options: [
      { id: "q_1", name: "Votorantim Cimentos", price: 32000, days: 3, score: "9.8 (Melhor Opção)", recommendation: true },
      { id: "q_2", name: "LafargeHolcim Sul", price: 34500, days: 5, score: "8.5", recommendation: false },
      { id: "q_3", name: "InterCement Paraná", price: 31800, days: 8, score: "7.9 (Prazo alto)", recommendation: false },
    ]
  });

  // Local inventory state
  const [estoqueItems, setEstoqueItems] = useState([
    { id: "est_1", name: "Aço Estrutural CA-50 12mm", qty: 24, unit: "ton", project: "Residencial Belle Vue", minStock: 5 },
    { id: "est_2", name: "Cimento Portland CP-II", qty: 450, unit: "sacos", project: "Residencial Belle Vue", minStock: 100 },
    { id: "est_3", name: "Bloco Cerâmico 9x19x19 cm", qty: 12500, unit: "unidades", project: "Batel Tower", minStock: 2000 },
    { id: "est_4", name: "Tubos Hidrossanitários Tigre 50mm", qty: 85, unit: "peças", project: "Residencial Kairo", minStock: 20 },
    { id: "est_5", name: "Arame Recozido Nº 18", qty: 120, unit: "kg", project: "Residencial Belle Vue", minStock: 30 },
  ]);

  const projectEstoqueItems = estoqueItems.filter(e => e.project === activeObra.name);

  const handleCreateSc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScItem.trim() || !newScQty) return;

    const linkedProj = activeObra.name;
    const newSc = {
      id: `sc_${Date.now()}`,
      item: newScItem,
      qty: parseFloat(newScQty),
      unit: newScUnit,
      project: linkedProj,
      status: "Aguardando Parecer",
      date: new Date().toISOString().split("T")[0]
    };

    setSolicitacoes([newSc, ...solicitacoes]);
    setNewScItem("");
    setNewScQty("");
    showToast("Em desenvolvimento", "info");
  };

  const handleApproveQuote = (optName: string, price: number) => {
    // Generate actual PO and add to global ERP purchases
    const linkedObra = obras[0];
    const newPo: PurchaseOrder = {
      id: `OC-${Date.now().toString().slice(-4)}`,
      item: comparisonMatrix.item,
      quantity: 1000,
      unit: "sacos",
      pricePerUnit: price / 1000,
      total: price,
      supplier: optName,
      status: "Aprovado",
      date: new Date().toISOString().split("T")[0],
      project: linkedObra?.id || "ob_1"
    };

    setPurchases((prev) => [newPo, ...prev]);
    showToast("Em desenvolvimento", "info");
  };

  const executeRestock = (id: string, name: string) => {
    // Restock simulation
    setEstoqueItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, qty: item.qty + (item.minStock * 3) };
      }
      return item;
    }));
    showToast("Em desenvolvimento", "info");
  };



  return (
    <div className="space-y-6 font-sans text-xs select-none">
      {/* Tab Controller Header */}
      <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-950 flex items-center gap-1.5 leading-none">
            <Truck className="h-4.5 w-4.5 text-zinc-650" /> Portal Integrado de Suprimentos & Fretes
          </h2>
          <p className="text-[10px] text-zinc-500 font-sans mt-1">
            Gere solicitações, homologue propostas de cotação e monitore ordens de compra emitidas.
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {[
            { id: "panorama", label: "Panorama", icon: Activity },
            { id: "solicitacoes", label: "Solicitações (SC)", icon: PlusSquare },
            { id: "cotacoes", label: "Cotações / Matriz", icon: ArrowRightLeft },
            { id: "ordens", label: "Ordens (OC)", icon: FileSpreadsheet },
            { id: "estoque", label: "Estoque Físico", icon: Box },
            { id: "historico", label: "Histórico SINAPI", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = comprasTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setComprasTab(tab.id as ComprasTab)}
                className={`px-3 py-1.5 font-semibold font-mono uppercase text-[9.5px] rounded border cursor-pointer transition-all flex items-center gap-1 leading-none ${
                  isActive
                    ? "bg-[hsl(var(--color-primary))] text-white border-[hsl(var(--color-primary))]"
                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {comprasTab === "estoque" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
           {/* Radar de Insumos */}
           <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-900/40 mb-5 relative shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                 <Sparkles className="h-4 w-4 text-amber-600" />
                 <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-amber-800 dark:text-amber-400">
                    Radar de Insumos (Auditor de Materiais)
                 </h3>
              </div>
              <p className="text-sm font-medium text-amber-950 dark:text-amber-100 mb-3 leading-relaxed">
                 O consumo de <span className="font-bold underline text-amber-800">Aço Estrutural CA-50 12mm</span> está acima do previsto. Há risco de ruptura antes da próxima etapa.<br/>
                 Além disso, notei uma variação de preço (+3%) na última previsão do SINAPI; esta variação pode afetar a margem.
              </p>
              <div className="flex gap-3">
                 <button onClick={() => showToast("Em desenvolvimento", "info")} className="text-[10px] font-bold px-3 py-1.5 bg-amber-600 text-white hover:bg-amber-700 transition-colors uppercase rounded shadow-sm cursor-pointer">
                   Analisar Variação de Preço
                 </button>
                 <button onClick={() => showToast("Em desenvolvimento", "info")} className="text-[10px] font-bold px-3 py-1.5 bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors uppercase rounded shadow-sm cursor-pointer">
                   Investigar consumo atípico
                 </button>
              </div>
           </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-150 pb-3 mb-4.5 gap-3">
            <div>
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-zinc-950 flex items-center gap-1.5 leading-none">
                <Box className="h-4.5 w-4.5 text-zinc-650" /> Almoxarifado Central & Estoque Físico
              </h2>
              <p className="text-[10px] text-zinc-500 font-sans mt-1">
                Acompanhamento em tempo real de materiais descarregados nos canteiros da obra {activeObra.name}.
              </p>
            </div>
            <span className="text-[9.5px] font-mono text-zinc-400">Total de Categorias Monitoradas: {projectEstoqueItems.length}</span>
          </div>

          <div className="overflow-x-auto text-[11px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] text-zinc-400 font-mono uppercase">
                  <th className="pb-2.5">Descrição Insumo</th>
                  <th className="pb-2.5">Qtd Estocada</th>
                  <th className="pb-2.5">Unidade</th>
                  <th className="pb-2.5 text-center">Acordo Emergencial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {projectEstoqueItems.map((item) => {
                  const isRunningLow = item.qty <= item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/50">
                      <td className="py-3">
                        <span className="font-semibold text-zinc-800 block leading-tight">{item.name}</span>
                        {isRunningLow && (
                          <span className="inline-block mt-1 text-[8.5px] font-mono font-bold text-rose-600 bg-rose-50 border border-rose-100 px-1 py-0.5 rounded leading-none uppercase">
                            ⚠️ ABAIXO DO LIMITE MÍNIMO
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-mono font-bold text-zinc-805">{item.qty.toLocaleString()}</td>
                      <td className="py-3 font-mono text-zinc-500">{item.unit}</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => executeRestock(item.id, item.name)}
                          className="px-2.5 py-1.5 text-[9.5px] font-semibold bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-650 rounded cursor-pointer transition-colors font-mono uppercase"
                        >
                          Disparar Reposição
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PANORAMA SUB TAB */}
      {comprasTab === "panorama" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-4">
              <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Solicitações de Compra</span>
              <span className="text-xl font-bold font-mono text-zinc-800 mt-1 block">{solicitacoes.length}</span>
              <p className="text-[9.5px] text-zinc-500 font-sans mt-1">Requisitos ativos no mês corrente.</p>
            </div>

            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-4">
              <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Volume Homologado</span>
              <span className="text-xl font-bold font-mono text-zinc-800 mt-1 block">
                R$ {projectPurchases.reduce((acc, curr) => acc + curr.total, 0).toLocaleString("pt-BR")}
              </span>
              <p className="text-[9.5px] text-zinc-500 font-sans mt-1">Soma líquida de ordens autorizadas.</p>
            </div>

            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-4">
              <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Ordens de Compra (OCs)</span>
              <span className="text-xl font-bold font-mono text-zinc-800 mt-1 block">{projectPurchases.length}</span>
              <p className="text-[9.5px] text-zinc-500 font-sans mt-1">Carga logística despachada.</p>
            </div>

            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-4">
              <span className="text-[10px] font-mono font-bold text-zinc-400 block uppercase">Insumos Críticos</span>
              <span className="text-xl font-bold font-mono text-rose-600 mt-1 block">1 material</span>
              <p className="text-[9.5px] text-zinc-500 font-sans mt-1">Estoques em nível crítico de canteiro.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4 block">
                Fluxograma Logístico de Cargas
              </h3>
              <div className="h-44 w-full flex items-end justify-between px-6 border-b border-zinc-200 pb-4">
                <div className="w-12 text-center">
                  <div className="bg-zinc-200 h-10 w-full rounded-t-sm" title="Rascunhos"></div>
                  <span className="text-[9.5px] font-mono text-zinc-500 mt-1.5 block">Aguardando</span>
                </div>
                <div className="w-12 text-center">
                  <div className="bg-blue-300 h-24 w-full rounded-t-sm" title="Cotando"></div>
                  <span className="text-[9.5px] font-mono text-zinc-500 mt-1.5 block">Cotação</span>
                </div>
                <div className="w-12 text-center">
                  <div className="bg-[hsl(var(--color-primary))] h-32 w-full rounded-t-sm" title="Aprovadas"></div>
                  <span className="text-[9.5px] font-mono text-zinc-500 mt-1.5 block">Em trânsito</span>
                </div>
                <div className="w-12 text-center">
                  <div className="bg-emerald-500 h-20 w-full rounded-t-sm" title="Concluídas"></div>
                  <span className="text-[9.5px] font-mono text-zinc-500 mt-1.5 block">Entregue</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-3 block">
                  Configuração de Alertas de Compra
                </h3>
                <p className="text-zinc-650 leading-relaxed">
                  As ordens de reposição emergencial são disparadas automaticamente para os fornecedores homologados quando o estoque cai do nível de segurança.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded text-amber-900 mt-4 flex gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Aço Estrutural CA-50 em Batel atingiu nível mínimo permitido de 5 t!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOLICITAÇÕES SUB TAB */}
      {comprasTab === "solicitacoes" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4 block">
              Fila Técnica de Solicitações de Compra (SC)
            </h3>

            <div className="overflow-x-auto text-[11px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] text-zinc-400 font-mono uppercase">
                    <th className="pb-2">Material requisitado</th>
                    <th className="pb-2">Canteiro de Destino</th>
                    <th className="pb-2 text-right">Qtd</th>
                    <th className="pb-2 text-center">Status Parecer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {solicitacoes
                    .filter(s => s.project === activeObra.name && s.item.toLowerCase().includes(itemSearch.toLowerCase()))
                    .map((sc) => (
                      <tr key={sc.id} className="hover:bg-zinc-50/50">
                        <td className="py-2.5">
                          <span className="font-semibold text-zinc-800 block text-xs">{sc.item}</span>
                          <span className="text-[9.5px] font-mono text-zinc-400 mt-0.5 block">Gerada em: {sc.date}</span>
                        </td>
                        <td className="py-2.5 font-sans font-medium text-zinc-600">{sc.project}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-zinc-800">{sc.qty} {sc.unit}</td>
                        <td className="py-2.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded font-bold font-mono text-[8.5px] ${
                            sc.status === "Aprovada" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                            sc.status === "Rascunho" ? "bg-zinc-50 text-zinc-500 border border-zinc-150" :
                            "bg-amber-50 text-amber-600 border border-amber-100"
                          }`}>
                            {sc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 border-b border-zinc-100 pb-3 mb-4 block">
              Registrar Solicitação de Compra
            </h3>

            <form onSubmit={handleCreateSc} className="space-y-4 text-xs text-left text-zinc-700">
              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">Nome/Especificação do Insumo</label>
                <input
                  type="text"
                  required
                  value={newScItem}
                  onChange={(e) => setNewScItem(e.target.value)}
                  placeholder="Ex: Cerâmica Porcelanato Portobello 60x60"
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-zinc-700 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">Qtd Solicitada</label>
                  <input
                    type="number"
                    required
                    value={newScQty}
                    onChange={(e) => setNewScQty(e.target.value)}
                    placeholder="Ex: 50"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-zinc-700 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">Unidade Medida</label>
                  <select
                    value={newScUnit}
                    onChange={(e) => setNewScUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-zinc-750 font-sans"
                  >
                    <option value="un">un (unidades)</option>
                    <option value="ton">ton (toneladas)</option>
                    <option value="m³">m³ (metros cúbicos)</option>
                    <option value="sacos">sacos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">Canteiro Local</label>
                <div className="w-full px-3 py-2 bg-zinc-100 border border-zinc-200 rounded text-zinc-500 font-sans cursor-not-allowed">
                  {activeObra.name}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[hsl(var(--color-primary))] text-white font-mono uppercase font-bold text-xs rounded hover:bg-opacity-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Enviar para Homologação
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COTAÇÕES / MATRIZ */}
      {comprasTab === "cotacoes" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
           {/* Nina Compras Insights */}
           <div className="bg-fuchsia-50 dark:bg-fuchsia-900/10 p-4 rounded-lg border border-fuchsia-200 dark:border-fuchsia-900/40 mb-5 relative shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                 <Sparkles className="h-4 w-4 text-fuchsia-600" />
                 <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-fuchsia-800 dark:text-fuchsia-400">
                    Nina Compras (Analista de Suprimentos)
                 </h3>
              </div>
              <p className="text-sm font-medium text-fuchsia-950 dark:text-fuchsia-100 mb-3 leading-relaxed">
                 O menor preço não é necessariamente a melhor compra se atrasar a obra. A <strong>Votorantim Cimentos</strong> oferece a melhor recomendação em custo-benefício (9.8).<br/>
                 Há também uma <span className="font-bold underline cursor-pointer text-fuchsia-800">Compra Crítica iminente</span> (Aço Estrutural CA-50 em Batel). Esta solicitação impacta o caminho crítico. Emitir compra exige aprovação.
              </p>
              <div className="flex gap-3">
                 <button onClick={() => showToast("Em desenvolvimento", "info")} className="text-[10px] font-bold px-3 py-1.5 bg-fuchsia-600 text-white hover:bg-fuchsia-700 transition-colors rounded shadow-sm cursor-pointer">
                   Comparativo de Fornecedores
                 </button>
                 <button onClick={() => showToast("Em desenvolvimento", "info")} className="text-[10px] font-bold px-3 py-1.5 bg-white border border-fuchsia-200 text-fuchsia-700 hover:bg-fuchsia-50 transition-colors rounded shadow-sm cursor-pointer">
                   Tratar Compra Crítica (Aço CA-50)
                 </button>
              </div>
           </div>

          <div className="border-b border-zinc-150 pb-3 mb-4.5">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 leading-none">
              Quadro Comparativo de Propostas: {comparisonMatrix.item}
            </h3>
            <p className="text-[10px] text-zinc-500 font-sans mt-1.5">
              Selecione o melhor parceiro técnico para homologação direta de frete FOB/CIF.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {comparisonMatrix.options.map((opt) => (
              <div
                key={opt.id}
                className={`p-4.5 rounded-lg border flex flex-col justify-between relative ${
                  opt.recommendation
                    ? "border-[hsl(var(--color-primary))] bg-blue-50/15"
                    : "border-zinc-200 bg-zinc-50/40"
                }`}
              >
                {opt.recommendation && (
                  <span className="absolute top-3 right-3 px-1.5 py-0.5 bg-[hsl(var(--color-primary))] text-white font-mono text-[8px] font-bold rounded">
                    EVIS RECOMENDA (BDI)
                  </span>
                )}

                <div>
                  <h4 className="text-xs font-bold text-zinc-800 font-sans">{opt.name}</h4>
                  <p className="text-sm font-bold font-mono text-zinc-900 mt-3">R$ {opt.price.toLocaleString("pt-BR")}</p>
                  
                  <div className="mt-4 text-[10px] text-zinc-500 space-y-1 font-mono">
                    <div>Prazo de Entrega: <strong className="text-zinc-700">{opt.days} dias corridos</strong></div>
                    <div>Score de Qualidade: <strong className="text-zinc-700">{opt.score}</strong></div>
                  </div>
                </div>

                <div className="mt-5 border-t border-zinc-150 pt-3 text-center">
                  <button 
                    onClick={() => handleApproveQuote(opt.name, opt.price)}
                    className={`w-full py-2 rounded text-[9.5px] font-mono font-bold uppercase cursor-pointer ${
                      opt.recommendation
                        ? "bg-[hsl(var(--color-primary))] text-white"
                        : "bg-white border border-zinc-250 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    Homologar e Gerar OC
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDENS DE COMPRA (OC) */}
      {comprasTab === "ordens" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
          <div className="flex justify-between items-center border-b border-zinc-100 pb-3 mb-4 flex-col sm:flex-row gap-2">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900">
                Ordens de Compra e Rastreabilidade Logística
              </h3>
              <p className="text-[10px] text-zinc-500 font-sans mt-0.5">
                Relação de insumos com contratos vigentes e prazos de transporte rastreados.
              </p>
            </div>
            <span className="text-[9.5px] font-mono text-zinc-400">Total OCs Emitidas: {projectPurchases.length}</span>
          </div>

          <div className="overflow-x-auto text-[11px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] text-zinc-400 font-mono uppercase">
                  <th className="pb-2">OC Código / Data</th>
                  <th className="pb-2">Especificação do Volume</th>
                  <th className="pb-2">Parceiro Fornecedor</th>
                  <th className="pb-2 text-right">Valor Líquido</th>
                  <th className="pb-2 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {projectPurchases.map((po) => (
                  <tr key={po.id} className="hover:bg-zinc-50/50">
                    <td className="py-2.5 font-mono text-[10.5px] text-zinc-500">
                      <strong>{po.id}</strong>
                      <span className="block text-[9px] mt-0.5">{po.date}</span>
                    </td>
                    <td className="py-2.5">
                      <span className="text-zinc-800 font-semibold block leading-tight">{po.item}</span>
                      <span className="text-[9.5px] text-zinc-400 font-mono mt-0.5 block">Qtd: {po.quantity} {po.unit}</span>
                    </td>
                    <td className="py-2.5 font-sans font-medium text-zinc-600 font-mono text-[11.5px]">{po.supplier}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-zinc-800">
                      R$ {po.total.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        onClick={() => {
                          setPurchases(prev => prev.filter(p => p.id !== po.id));
                          showToast("Em desenvolvimento", "info");
                        }}
                        className="px-2 py-1 text-[9.5px] text-zinc-500 bg-zinc-50 hover:bg-rose-50 hover:text-rose-600 border border-zinc-200 hover:border-rose-100 rounded cursor-pointer transition-colors font-mono"
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

      {/* HISTÓRICO DE PREÇOS */}
      {comprasTab === "historico" && (
        <div className="bg-white border border-[hsl(var(--color-border))] rounded-lg p-5">
          <div className="flex items-center gap-1.5 text-blue-500 font-mono uppercase font-bold text-[10px] mb-1">
            <Coins className="h-4.5 w-4.5 text-blue-500" /> Indicadores SINAPI Curitiba
          </div>
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-900 mb-4 block">
            Monitor de Variação de Preços de Insumos da Construção Civil
          </h3>

          {/* SINAPI Trajectory Chart */}
          <div className="h-40 w-full flex items-end justify-between px-10 border-b border-zinc-200 pb-3 mb-4 mt-6">
            <div className="text-center font-mono text-[10px] text-zinc-400">
              <div className="bg-blue-100 h-16 w-8 rounded-t-sm mx-auto"></div>
              <span className="text-[9px] mt-1.5 block">Jan / 26</span>
            </div>
            <div className="text-center font-mono text-[10px] text-zinc-400">
              <div className="bg-blue-200 h-20 w-8 rounded-t-sm mx-auto"></div>
              <span className="text-[9px] mt-1.5 block">Fev / 26</span>
            </div>
            <div className="text-center font-mono text-[10px] text-zinc-400">
              <div className="bg-blue-300 h-24 w-8 rounded-t-sm mx-auto"></div>
              <span className="text-[9px] mt-1.5 block">Mar / 26</span>
            </div>
            <div className="text-center font-mono text-[10px] text-zinc-400">
              <div className="bg-[hsl(var(--color-primary))] h-32 w-8 rounded-t-sm mx-auto"></div>
              <span className="text-[9px] mt-1.5 block">Hoje</span>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-150 rounded text-[11px] text-blue-900 leading-relaxed font-sans">
            <strong>Previsão de Preços SINAPI Inteligente:</strong> O módulo detecta uma elevação linear média de 3.4% no m³ do concreto estrutural usinado Fck 35 MPa e queda de 1.8% na barra Gerdau CA-50 de 12mm em Curitiba e Região Metropolitana. Recomendamos antecipar os pedidos das lajes do Batel.
          </div>
        </div>
      )}
    </div>
  );
}
