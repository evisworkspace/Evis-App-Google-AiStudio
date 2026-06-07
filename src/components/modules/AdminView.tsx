import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
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
  ExternalLink
} from "lucide-react";

export default function AdminView() {
  const { currentRoute, setCurrentRoute } = useApp();

  const [companyName, setCompanyName] = useState("Curitiba Construtora S/A");
  const [cnpj, setCnpj] = useState("12.345.678/0001-90");
  const [municipalRegistration, setMunicipalRegistration] = useState("IS-982.110.33-A");

  const [fornecedores, setFornecedores] = useState([
    { name: "Cemex Concresul Paraná", cnpj: "44.921.432/0001-44", type: "Concreto Usinado", rating: "A" },
    { name: "Gerdau Metais Filial Sul", cnpj: "05.120.301/0002-11", type: "Aços e Juntas", rating: "A+" },
    { name: "Curitiba Blocos & Lajes Ltda", cnpj: "20.302.404/0001-85", type: "Artefatos Cimento", rating: "B+" },
  ]);

  const [clientes, setClientes] = useState([
    { name: "Ambev Incorporações S.A.", cnpj: "10.222.111/0001-50", type: "Industrial", contracts: 2 },
    { name: "Residencial Belle Vue Empr.", cnpj: "33.555.222/0001-90", type: "Residencial", contracts: 1 },
  ]);

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
            <button className="py-1 px-2.5 bg-[hsl(var(--color-primary))] text-white font-mono text-[9.5px] font-bold rounded hover:bg-blue-600 cursor-pointer uppercase">
              + Adicionar Cliente SPE
            </button>
          </div>

          <div className="space-y-3">
            {clientes.map((c, idx) => (
              <div key={idx} className="p-3 bg-zinc-50 border border-zinc-150 rounded-md flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-zinc-800">{c.name}</h4>
                  <p className="text-[10px] font-mono text-zinc-400 mt-1">CNPJ: {c.cnpj} • Segmento: {c.type}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-sans text-zinc-500 block">
                     {c.contracts} contratos ativos
                  </span>
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
