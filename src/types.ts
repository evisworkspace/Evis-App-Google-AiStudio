/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Obra {
  id: string;
  name: string;
  location: string;
  description: string;
  progress: number; // 0 to 100
  budgetTotal: number;
  budgetSpent: number;
  status: "Planejamento" | "Fundação" | "Estrutura" | "Acabamento" | "Entregue";
  startDate: string;
  endDate: string;
  manager: string;
  equipe: { name: string; role: string; avatar?: string }[];
  documentos: { name: string; type: string; size: string; date: string }[];
  rdoList: { id: string; date: string; weather: string; workers: number; progressNote: string; observations: string }[];
  medicoesList: { id: string; date: string; amount: number; description: string; status: "Aprovado" | "Pendente" | "Revisando" }[];
  orcamentoInsumos: { category: string; planned: number; actual: number; margin: number }[];
}

export interface Oportunidade {
  id: string;
  title: string;
  client: string;
  clientEmail?: string;
  value: number;
  stage: "Proposta" | "Negociação" | "Apresentação" | "Ganho" | "Perdido";
  date: string;
  owner: string;
  probability: number; // %
}

export interface LancamentoFinanceiro {
  id: string;
  description: string;
  amount: number;
  type: "receita" | "despesa";
  category: string;
  date: string;
  bankAccount: string;
  status: "Realizado" | "Pendente";
  project?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  bank: string;
  balance: number;
  accountNumber: string;
}

export interface PurchaseOrder {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
  supplier: string;
  status: "Aprovado" | "Pendente" | "Cotando" | "Entregue";
  date: string;
  project: string;
}

export interface Insumo {
  id: string;
  code: string;
  name: string;
  unit: string;
  sinapiPrice: number;
  marketPrice: number;
  category: string;
}

export interface Task {
  id: string;
  title: string;
  project: string;
  assignedTo: string;
  dueDate: string;
  priority: "Alta" | "Média" | "Baixa";
  status: "Fazer" | "Progresso" | "Revisão" | "Concluido";
  loggedHours?: number;
}

export type MenuRoute =
  | "dashboard"
  | "oportunidades"
  | "obras"
  | "obra-detail"
  | "tarefas"
  | "compras"
  | "estoque"
  | "workspace"
  | "mapa-agentes"
  | "financeiro-resumo"
  | "financeiro-receitas"
  | "financeiro-despesas"
  | "financeiro-central"
  | "financeiro-lancamentos"
  | "financeiro-transferencias"
  | "financeiro-fluxo-de-caixa"
  | "financeiro-dre"
  | "financeiro-categorias"
  | "cadastros-clientes"
  | "cadastros-fornecedores"
  | "cadastros-insumos"
  | "configuracoes-empresa"
  | "configuracoes-contas"
  | "configuracoes-equipe"
  | "planos";

export type AppTheme = "claro" | "escuro" | "hibrido";

export const INITIAL_OBRAS: Obra[] = [
  {
    id: "ob_1",
    name: "Residencial Belle Vue",
    location: "Batel, Curitiba - PR",
    description: "Edifício residencial de alto padrão com 18 andares, lareiras individuais e acabamento em mármore importado.",
    progress: 68,
    budgetTotal: 18500000,
    budgetSpent: 12640000,
    status: "Estrutura",
    startDate: "2025-01-15",
    endDate: "2026-11-30",
    manager: "Eng. Roberto Berti",
    equipe: [
      { name: "Eng. Roberto Berti", role: "Gestor de Obra" },
      { name: "Marta Souza", role: "Mestre de Obras" },
      { name: "Lucas Mendes", role: "Técnico em Segurança" },
    ],
    documentos: [
      { name: "Alvara_Construcao_Prefeitura.pdf", type: "PDF", size: "4.2 MB", date: "2025-01-10" },
      { name: "Projeto_Arquitetonico_V4_Final.dwg", type: "DWG", size: "18.5 MB", date: "2025-02-14" },
      { name: "Projeto_Estrutural_Calculo_Assinado.pdf", type: "PDF", size: "8.1 MB", date: "2025-01-22" },
    ],
    rdoList: [
      { id: "rdo_1", date: "2026-06-05", weather: "Ensolarado", workers: 42, progressNote: "Concretagem da laje do 12º pavimento concluída às 17h. Início do escoramento do 13º nível.", observations: "Entrega de frota de concreto usinado correu sem atrasos pela Engemix." },
      { id: "rdo_2", date: "2026-06-04", weather: "Nublado / Garoa", workers: 38, progressNote: "Armação de vigas do 13º nível. Assentamento de alvenaria interna do 6º nível.", observations: "Garoa fina reduziu o ritmo de trabalho externo no período da tarde, reforço no fechamento de paredes." },
    ],
    medicoesList: [
      { id: "med_1", date: "2026-05-31", amount: 480000, description: "Concretagem lajes 10º e 11º nível e alvenaria correspondente", status: "Aprovado" },
      { id: "med_2", date: "2026-04-30", amount: 410000, description: "Infraestrutura hidráulica prumadas e alvenaria 4º e 5º nível", status: "Aprovado" },
      { id: "med_3", date: "2026-06-15", amount: 520000, description: "Concretagem laje do 12º nível e fechamentos drywall 1º de acabamento", status: "Pendente" },
    ],
    orcamentoInsumos: [
      { category: "Infraestrutura & Fundação", planned: 2500000, actual: 2480000, margin: 20000 },
      { category: "Estrutura (Concreto/Aço)", planned: 6800000, actual: 7120000, margin: -320000 },
      { category: "Alvenarias & Divisórias", planned: 1800000, actual: 1650000, margin: 150000 },
      { category: "Instalações Prediais", planned: 3200000, actual: 2900000, margin: 300000 },
      { category: "Acabamentos & Revestimentos", planned: 4200000, actual: 490000, margin: 3710000 },
    ],
  },
  {
    id: "ob_2",
    name: "Residencial Kairo",
    location: "Cabral, Curitiba - PR",
    description: "Condomínio clube de 3 torres com foco em sustentabilidade, energia solar e captação de água pluvial.",
    progress: 32,
    budgetTotal: 34200000,
    budgetSpent: 11050000,
    status: "Fundação",
    startDate: "2025-09-01",
    endDate: "2027-08-30",
    manager: "Enga. Amanda Costa",
    equipe: [
      { name: "Enga. Amanda Costa", role: "Gestora de Obra" },
      { name: "Carlos Drummond", role: "Mestre de Obras" },
    ],
    documentos: [
      { name: "Licenca_Ambiental_Instalacao.pdf", type: "PDF", size: "2.8 MB", date: "2025-08-15" },
      { name: "Sondagem_Solo_Geotecnica_Relatorio.pdf", type: "PDF", size: "12.4 MB", date: "2025-08-20" },
    ],
    rdoList: [
      { id: "rdo_3", date: "2026-06-05", weather: "Chuvoso", workers: 22, progressNote: "Escavação contida devido à lama intensa. Execução de sapata isolada do bloco B interna.", observations: "Chuva torrencial de 11mm em Curitiba interrompeu a movimentação de terra externa. Alocação interna." },
    ],
    medicoesList: [
      { id: "med_4", date: "2026-05-31", amount: 980000, description: "Finalização das estacas hélice contínua Bloco A", status: "Aprovado" },
    ],
    orcamentoInsumos: [
      { category: "Fundações & Estacas", planned: 5500000, actual: 5740000, margin: -240000 },
      { category: "Estrutura Geral", planned: 12500000, actual: 4310000, margin: 8190000 },
      { category: "Acabamento & Urbanização", planned: 16200000, actual: 1000000, margin: 15200000 },
    ],
  },
  {
    id: "ob_3",
    name: "Smart Tower Corporate",
    location: "Centro, Curitiba - PR",
    description: "Edifício comercial AAA com fachada de vidro temperado acústica e certificação LEED Gold de sustentabilidade.",
    progress: 10,
    budgetTotal: 48000000,
    budgetSpent: 4850000,
    status: "Planejamento",
    startDate: "2026-04-01",
    endDate: "2028-12-20",
    manager: "Eng. Pedro Alencar",
    equipe: [
      { name: "Eng. Pedro Alencar", role: "Gestor Técnico" },
    ],
    documentos: [
      { name: "Projeto_Estrutural_Metalico.pdf", type: "PDF", size: "21.0 MB", date: "2026-05-10" },
    ],
    rdoList: [],
    medicoesList: [],
    orcamentoInsumos: [
      { category: "Projetos & Licenças", planned: 1200000, actual: 1150000, margin: 50000 },
      { category: "Infraestrutura Inicial", planned: 6800000, actual: 3700000, margin: 3100000 },
    ],
  },
];

export const INITIAL_OPORTUNIDADES: Oportunidade[] = [
  { id: "op_1", title: "Retrofit Galpão Logístico Ambev", client: "Ambev S.A.", clientEmail: "contato@ambev.exemplo.com", value: 8750000, stage: "Proposta", date: "2026-05-20", owner: "Ricardo Prado", probability: 70 },
  { id: "op_2", title: "Ampliação Hospital Sugisawa", client: "Grupo Sugisawa S/S", clientEmail: "diretoria@sugisawa.exemplo.com", value: 14200000, stage: "Negociação", date: "2026-05-14", owner: "Eng. Berti", probability: 90 },
  { id: "op_3", title: "Construção Sede Sicoob Sul", client: "Sicoob Central", clientEmail: "projetos@sicoob.exemplo.com", value: 6400000, stage: "Apresentação", date: "2026-05-28", owner: "Ricardo Prado", probability: 40 },
  { id: "op_4", title: "Residencial Quinta do Sol", client: "Invescon Incorporadora", value: 29500000, stage: "Ganho", date: "2026-06-01", owner: "Eng. Berti", probability: 100 },
  { id: "op_5", title: "Complexo Esportivo Curitibano", client: "Clube Curitibano", value: 3800000, stage: "Perdido", date: "2026-04-10", owner: "Sandro Alencar", probability: 0 },
];

export const INITIAL_ACCOUNTS: BankAccount[] = [
  { id: "acc_1", name: "Itaú Construtora Master", bank: "Itaú Unibanco", balance: 5410290.45, accountNumber: "Ag: 3810 - C/C: 29103-4" },
  { id: "acc_2", name: "Bradesco Operações Batel", bank: "Bradesco", balance: 1248000.12, accountNumber: "Ag: 0495 - C/C: 10398-0" },
  { id: "acc_3", name: "Caixa Garantias de Obra", bank: "Caixa Econômica", balance: 3500000.00, accountNumber: "Ag: 1533 - C/C: 00392-1" },
];

export const INITIAL_LANCAMENTOS: LancamentoFinanceiro[] = [
  { id: "lan_1", description: "Medição Aprovada Residencial Belle Vue", amount: 480000, type: "receita", category: "Medição de Obra", date: "2026-06-05", bankAccount: "acc_1", status: "Realizado", project: "ob_1" },
  { id: "lan_2", description: "Compra Compra Concreto Usinado fck 30 MPa", amount: 94000, type: "despesa", category: "Materiais de Obra", date: "2026-06-04", bankAccount: "acc_1", status: "Realizado", project: "ob_1" },
  { id: "lan_3", description: "Pagamento Locação de Grua de Alta Altura", amount: 35000, type: "despesa", category: "Equipamentos / Ferramental", date: "2026-06-01", bankAccount: "acc_2", status: "Realizado", project: "ob_1" },
  { id: "lan_4", description: "Adiantamento Contrato Projeto Paisagístico", amount: 28000, type: "despesa", category: "Projetos de Arquitetura", date: "2026-06-05", bankAccount: "acc_2", status: "Pendente", project: "ob_2" },
  { id: "lan_5", description: "Medição Sapata Bloco A - Residencial Kairo", amount: 980000, type: "receita", category: "Medição de Obra", date: "2026-05-31", bankAccount: "acc_3", status: "Realizado", project: "ob_2" },
  { id: "lan_6", description: "Compra de Vergalhão de Aço CA-50 Gerdau", amount: 152000, type: "despesa", category: "Insumo Ferro e Aço", date: "2026-06-02", bankAccount: "acc_1", status: "Realizado", project: "ob_1" },
  { id: "lan_7", description: "Fatura de Energia Celesc Canteiro Principal", amount: 4850, type: "despesa", category: "Gastos Gerais Canteiro", date: "2026-06-06", bankAccount: "acc_2", status: "Pendente", project: "ob_1" },
];

export const INITIAL_PURCHASES: PurchaseOrder[] = [
  { id: "po_1", item: "Concreto Usinado FCK 30MPa - Usina", quantity: 180, unit: "m³", pricePerUnit: 420, total: 75600, supplier: "Engemix Concretos", status: "Aprovado", date: "2026-06-04", project: "ob_1" },
  { id: "po_2", item: "Cimento Portland CP II-Z - Saco 50kg", quantity: 600, unit: "sc", pricePerUnit: 34.5, total: 20700, supplier: "Cimento Votoran", status: "Entregue", date: "2026-05-28", project: "ob_1" },
  { id: "po_3", item: "Aço CA-50 Bitola 10.0mm Gerdau", quantity: 12, unit: "ton", pricePerUnit: 6800, total: 81600, supplier: "Gerdau Metais", status: "Aprovado", date: "2026-06-02", project: "ob_1" },
  { id: "po_4", item: "Madeira Sarrafo para Caixaria 2.5x5.0cm", quantity: 1500, unit: "m", pricePerUnit: 3.2, total: 4800, supplier: "Madeireira Pinheiro", status: "Pendente", date: "2026-06-05", project: "ob_2" },
  { id: "po_5", item: "Bloco Cerâmico 9x19x19cm (Tijolo 8 Furos)", quantity: 38000, unit: "un", pricePerUnit: 1.15, total: 43700, supplier: "Olaria Curitibana", status: "Cotando", date: "2026-06-06", project: "ob_1" },
];

export const INITIAL_INSUMOS: Insumo[] = [
  { id: "ins_1", code: "7303 SINAPI", name: "Concreto fck 30 MPa usinado lançado para estruturas", unit: "m³", sinapiPrice: 485.50, marketPrice: 420.00, category: "Estrutura" },
  { id: "ins_2", code: "4081 SINAPI", name: "Aço CA-50 diam. 10mm reto cortado e dobrado em usina", unit: "kg", sinapiPrice: 8.90, marketPrice: 7.15, category: "Estrutura" },
  { id: "ins_3", code: "1351 SINAPI", name: "Tijolo cerâmico maciço comum para alvenarias de vedação", unit: "un", sinapiPrice: 1.45, marketPrice: 1.15, category: "Fechamentos" },
  { id: "ins_4", code: "0340 SINAPI", name: "Areia grossa tipo brita lavada saca comercial de obra", unit: "m³", sinapiPrice: 125.00, marketPrice: 98.00, category: "Fundações" },
  { id: "ins_5", code: "2104 SINAPI", name: "Portas de madeira compensada lisa de folha de embaúba", unit: "un", sinapiPrice: 285.00, marketPrice: 245.00, category: "Acabamentos" },
];

export const INITIAL_TASKS: Task[] = [
  { id: "tsk_1", title: "Concretar laje do 13º nível", project: "ob_1", assignedTo: "Eng. Berti", dueDate: "2026-06-12", priority: "Alta", status: "Progresso", loggedHours: 8.5 },
  { id: "tsk_2", title: "Realizar medição mensal para liberação do banco", project: "ob_1", assignedTo: "Eng. Berti", dueDate: "2026-06-15", priority: "Alta", status: "Progresso", loggedHours: 4.0 },
  { id: "tsk_3", title: "Enviar relatórios de ensaio geotécnico do solo", project: "ob_2", assignedTo: "Amanda Costa", dueDate: "2026-06-10", priority: "Média", status: "Fazer" },
  { id: "tsk_4", title: "Revisar prancha do projeto elétrico do Bloco C", project: "ob_2", assignedTo: "Carlos Drummond", dueDate: "2026-06-08", priority: "Baixa", status: "Revisão", loggedHours: 1.5 },
  { id: "tsk_5", title: "Aprovar compras pendentes de caixaria de madeira", project: "ob_2", assignedTo: "Eng. Berti", dueDate: "2026-06-07", priority: "Média", status: "Fazer" },
];
