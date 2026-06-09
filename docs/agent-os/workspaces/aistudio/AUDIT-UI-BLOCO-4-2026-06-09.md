# AUDIT UI - BLOCO 4 - Financeiro AiStudio

Data: 2026-06-09
Projeto: `C:\Users\User\Evis-AiStudio`

## Arquivos Lidos

| Arquivo | Uso na auditoria |
|---|---|
| `src/components/modules/FinanceiroView.tsx` | Tela principal do Financeiro |
| `src/types.ts` | `LancamentoFinanceiro`, `BankAccount`, `INITIAL_ACCOUNTS`, `INITIAL_LANCAMENTOS` |
| `src/context/AppContext.tsx` | Origem real dos estados e comportamento de `addLancamento` |
| `src/components/layout/Sidebar.tsx` | Lista das abas do financeiro |
| `src/components/modules/AdminView.tsx` | Verificacao de "Contas Bancarias" em configuracoes |

Observacao: a pasta `apps/saas` nao existe neste checkout em `C:\Users\User\Evis-AiStudio`, entao a comparacao foi feita contra o checklist funcional informado.

## 1. Abas Do Financeiro

| Aba | O que renderiza | Fonte dos dados | Formularios / validacao / salvamento | Calculos |
|---|---|---|---|---|
| Resumo | Vera Financeira, cards de contas bancarias, formulario "Novo Lancamento Rapido", tabela curta de transacoes | `accounts`, `lancamentos`, `obras` vindos do `AppContext`, inicializados por `INITIAL_ACCOUNTS`, `INITIAL_LANCAMENTOS`, `INITIAL_OBRAS` | Form de lancamento existe. Validacao minima: campos `required`, descricao nao vazia e valor numerico. Salva so em estado React local via `addLancamento` | Cards usam saldo atual do estado local. Sem calculo financeiro estruturado |
| Receitas | Lista de lancamentos do tipo receita | `lancamentos.filter(type === receita)` | Nao ha form | Apenas filtro por tipo em memoria |
| Despesas | Lista de despesas e bloco visual de upload XML/PDF | `lancamentos.filter(type === despesa)` | Upload e visual, sem handler real de arquivo, OCR ou persistencia | Apenas filtro por tipo em memoria |
| Conciliacao Central | Tela de status "100% conciliado" | Texto fixo/hardcoded | Nao ha form | Visual apenas, sem conciliacao real |
| Lancamentos | Livro diario com tabela e exportacao Google Sheets | `lancamentos` do estado local | Sem form de criacao nesta aba. Campo de busca por descricao. Botao Google Sheets chama API real se houver token Google | Sem calculo; lista em memoria |
| Transferencias | Form de transferencia entre contas | `accounts` do estado local | Form existe. Valida valor positivo, contas diferentes e saldo suficiente. Salva como dois lancamentos locais via `addLancamento` | Atualiza saldos localmente por receita/despesa; nao ha entidade "transferencia" nem transacao atomica |
| Fluxo de Caixa | Grafico SVG de barras | Dados fixos inline | Nao ha form | Visual fixo, nao calculado a partir de lancamentos |
| DRE de Obra | Tabela DRE comparativa | Dados fixos inline | Nao ha form | Visual fixo; nao calcula DRE real |
| Categorias | Cards de categorias com contagem e teto | `categoriesList` hardcoded dentro do componente | Nao ha CRUD | Visual fixo; nao deriva dos lancamentos |

## 2. Contas Bancarias

| Item | Situacao no AiStudio |
|---|---|
| Exibicao no Financeiro | Cards no Resumo e selects na Transferencia |
| Fonte | `accounts` do `AppContext`, inicializado por `INITIAL_ACCOUNTS` |
| Modelo | `BankAccount` tem `id`, `name`, `bank`, `balance`, `accountNumber` |
| Atualizacao de saldo | Localmente por `addLancamento`, receita soma e despesa subtrai |
| CRUD no Financeiro | Nao existe |
| CRUD em Configuracoes | Nao existe. A rota "Contas Bancarias" em `AdminView` mostra cards estaticos de integracao OFX/certificado |
| Persistencia | Nao ha Firestore para contas bancarias |

## 3. Lancamentos

| Pergunta | Resposta |
|---|---|
| "Novo Lancamento Rapido" salva onde? | Estado React local, via `addLancamento` no `AppContext` |
| Usa Firestore? | Nao |
| Atualiza conta bancaria? | Sim, mas so no estado local da sessao |
| Atualiza obra? | So se for despesa com obra associada; aumenta `budgetSpent` e recalcula `progress` localmente |
| Listagem e paginada? | Nao |
| Carrega tudo? | Sim, renderiza arrays em memoria. No Resumo mostra so `slice(0, 5)` |
| Filtros funcionam? | Parcialmente. A aba Lancamentos filtra por descricao. Receitas/Despesas filtram por tipo. Nao ha filtro funcional por obra, categoria ou periodo |
| `projectFilter` | Existe como estado, mas nao e usado na UI nem na listagem |
| Exclusao | Botoes existem, mas so exibem alerta; nao removem nada |

## 4. DRE E Fluxo De Caixa

| Area | Dinamico ou fixo? | Grafico | Dados reais? |
|---|---|---|---|
| Fluxo de Caixa | Fixo | SVG manual inline | Nao. Meses, barras e escala sao hardcoded |
| DRE | Fixo | Nao ha grafico, so tabela | Nao. Linhas e valores sao hardcoded |
| Recharts | Nao usado | Nao ha `recharts` no FinanceiroView | N/A |
| Base em lancamentos | Nao | Nao calcula entradas, saidas, saldo acumulado, competencia ou DRE | Nao |

## 5. Agente Vera Financeira

| Item | Situacao |
|---|---|
| Mensagem | Hardcoded no JSX |
| Usa IA real? | Nao |
| Usa dados financeiros reais? | Nao diretamente; o texto cita Kairo e caixa pressionado sem calculo |
| Botao "Analisar impactos do Kairo" | So dispara alerta de ambiente simulado |
| Botao "Simular projecao (30 dias)" | So dispara alerta de ambiente simulado |
| Acoes conectadas | Nao |

## 6. Comparacao Com `apps/saas`

| Capacidade citada do `apps/saas` | Existe no AiStudio? | Vazio / simulado | Falta |
|---|---:|---|---|
| `Payment` com installments/parcelas | Nao | N/A | Modelo de pagamento, parcelas, vencimento, liquidacao, status por parcela |
| `FinancialCategory` hierarquica para DRE | Nao | Aba Categorias e hardcoded; DRE e fixa | Entidade hierarquica, plano de contas, vinculo com lancamentos e calculo de DRE |
| `BankAccount` por empresa e por entidade | Parcial | Ha `BankAccount` global simples | Campos/relacionamentos por empresa, entidade, obra/SPE, persistencia e permissoes |
| Filtro por obra | Parcial | Lancamento tem `project?`, form permite associar obra | Filtro real por obra nas listagens; exibicao correta do nome da obra |
| Filtro por categoria | Parcial | Categoria e string no lancamento | Filtro funcional, categoria normalizada e hierarquica |
| Filtro por periodo | Nao | N/A | Filtro por data/vencimento/competencia |
| Conciliacao | Nao funcional | Tela mostra "100% conciliado" hardcoded | Importacao OFX/extrato, matching, divergencias, status por lancamento |
| Persistencia real | Nao para financeiro | Firestore existe no projeto, mas financeiro nao usa | Colecoes financeiras e queries por empresa |
| CRUD de contas bancarias | Nao | Configuracao bancaria e card estatico | Criar, editar, inativar, vincular entidade/empresa |
| Graficos reais | Nao | Fluxo SVG fixo | Recharts ou calculo visual baseado em dados reais |

## 7. Gaps Prioritarios Top 5

| Prioridade | Gap | Impacto |
|---:|---|---|
| 1 | Persistencia financeira real no Firestore | Hoje contas e lancamentos somem ao recarregar e nao sao multiusuario |
| 2 | Modelo financeiro completo: pagamentos, parcelas, vencimentos, liquidacao e status | O sistema ainda nao cobre contas a pagar/receber de ERP |
| 3 | Plano de contas / categorias hierarquicas para DRE | DRE atual e demonstrativa, nao auditavel nem calculada |
| 4 | Conciliacao bancaria funcional | A tela existe, mas nao ha extrato, matching, divergencia ou confirmacao |
| 5 | Filtros, paginacao e validacoes robustas | Listas carregam tudo em memoria, filtros sao minimos e os forms aceitam dados incompletos para operacao real |
