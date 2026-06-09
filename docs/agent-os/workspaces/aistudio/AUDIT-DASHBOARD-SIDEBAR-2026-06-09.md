# AUDIT UI - DASHBOARD, SIDEBAR E NAVEGAÇÃO - 2026-06-09

## 1. Navegação

| rota | handler em `App.tsx` | view renderizada | status |
|---|---:|---|---|
| `dashboard` | Sim | `DashboardView` | OK |
| `oportunidades` | Sim | `OportunidadesView` | OK |
| `obras` | Sim | `ObrasView` | OK |
| `obra-detail` | Não | `DashboardView` por fallback | FALTANDO |
| `tarefas` | Sim | `TarefasView` | OK |
| `compras` | Sim | `ComprasView` | OK |
| `estoque` | Sim | `ComprasView` | OK |
| `workspace` | Sim | `WorkspaceView` | OK |
| `mapa-agentes` | Não | `DashboardView` por fallback | FALTANDO |
| `financeiro-resumo` | Sim, via `financeiro-*` | `FinanceiroView` | OK |
| `financeiro-receitas` | Sim, via `financeiro-*` | `FinanceiroView` | OK |
| `financeiro-despesas` | Sim, via `financeiro-*` | `FinanceiroView` | OK |
| `financeiro-central` | Sim, via `financeiro-*` | `FinanceiroView` | OK |
| `financeiro-lancamentos` | Sim, via `financeiro-*` | `FinanceiroView` | OK |
| `financeiro-transferencias` | Sim, via `financeiro-*` | `FinanceiroView` | OK |
| `financeiro-fluxo-de-caixa` | Sim, via `financeiro-*` | `FinanceiroView` | OK |
| `financeiro-dre` | Sim, via `financeiro-*` | `FinanceiroView` | OK |
| `financeiro-categorias` | Sim, via `financeiro-*` | `FinanceiroView` | OK |
| `cadastros-clientes` | Sim, via `cadastros-*` | `AdminView` | OK |
| `cadastros-fornecedores` | Sim, via `cadastros-*` | `AdminView` | OK |
| `cadastros-insumos` | Sim, via `cadastros-*` | `AdminView` | OK |
| `configuracoes-empresa` | Sim, via `configuracoes-*` | `AdminView` | OK |
| `configuracoes-contas` | Sim, via `configuracoes-*` | `AdminView` | OK |
| `configuracoes-equipe` | Sim, via `configuracoes-*` | `AdminView` | OK |
| `planos` | Sim | `AdminView` | OK |

## 2. Sidebar

| item | rota | handler existe? | status |
|---|---|---:|---|
| Painel de Controle | `dashboard` | Sim | OK |
| Oportunidades (CRM) | `oportunidades` | Sim | OK |
| Projetos (Visão Global) | `obras` | Sim | OK |
| Obra ativa / Detalhe da Obra | `obra-detail` | Não | FALTANDO |
| Tarefas de Engenharia | `tarefas` | Sim | OK |
| Google Workspace | `workspace` | Sim | OK |
| Central de Agentes IA | `mapa-agentes` | Não | FALTANDO |
| Financeiro: Resumo | `financeiro-resumo` | Sim | OK |
| Financeiro: Receitas | `financeiro-receitas` | Sim | OK |
| Financeiro: Despesas | `financeiro-despesas` | Sim | OK |
| Financeiro: Conciliação Central | `financeiro-central` | Sim | OK |
| Financeiro: Lançamentos | `financeiro-lancamentos` | Sim | OK |
| Financeiro: Transferências | `financeiro-transferencias` | Sim | OK |
| Financeiro: Fluxo de Caixa | `financeiro-fluxo-de-caixa` | Sim | OK |
| Financeiro: DRE de Obra | `financeiro-dre` | Sim | OK |
| Financeiro: Categorias | `financeiro-categorias` | Sim | OK |
| Cadastros: Clientes | `cadastros-clientes` | Sim | OK |
| Cadastros: Fornecedores | `cadastros-fornecedores` | Sim | OK |
| Cadastros: Insumos SINAPI | `cadastros-insumos` | Sim | OK |
| Configuração: Empresa | `configuracoes-empresa` | Sim | OK |
| Configuração: Contas Bancárias | `configuracoes-contas` | Sim | OK |
| Configuração: Equipe de Engenharia | `configuracoes-equipe` | Sim | OK |
| Fazer Upgrade Pro | `planos` | Sim | OK |

## 3. Dashboard

| bloco / seção | o que exibe | origem do dado | ação conectada? |
|---|---|---|---|
| Operação Climática | alerta climático e condição de concretagem | texto estático simulado | Só visual |
| Mensagem Sentinela | card de alerta crítico de agente IA | texto estático simulado | Parcial: dispara evento `open-maestro` |
| Mensagem EVA Executiva | card de resumo executivo IA | texto estático simulado | Parcial: dispara evento `open-maestro` |
| KPI Orçamento Geral | KPI financeiro | `obras` vindo de `INITIAL_OBRAS` | Só visual |
| KPI Desembolso | KPI financeiro | `obras` vindo de `INITIAL_OBRAS` | Só visual |
| KPI Progresso Físico | KPI + barra de progresso | `obras` vindo de `INITIAL_OBRAS` | Só visual |
| KPI Funil de Contratos | KPI comercial | `oportunidades` vindo de `INITIAL_OPORTUNIDADES` | Só visual |
| Cronograma de Marcos | timeline/lista horizontal de milestones | `useState` local hardcoded, simulado | Sim: filtro por obra e alternância local de status |
| Tarefas Urgentes | lista de tarefas alta prioridade | `tasks` vindo de `INITIAL_TASKS` | Parcial: abre modal; confirmação está quebrada |
| Últimos Lançamentos Financeiros | tabela financeira | `lancamentos` vindo de `INITIAL_LANCAMENTOS` | Parcial/decorativa: “Sincronizar” só simula loading |
| Resumo Operacional dos Portfólios | lista de obras, localização, mão de obra e avanço | `obras` vindo de `INITIAL_OBRAS`; mão de obra usa fórmula artificial | Só visual |
| Drawer Apropriar Horas | modal/input para lançar horas | tarefa selecionada + estado local | Quebrado: botão confirmar chama `useApp()` dentro do handler |

## 4. Header

| elemento interativo | ação | conectado ou decorativo |
|---|---|---|
| Overlay dos dropdowns | fecha perfil/notificações | Conectado |
| Botão menu | abre/fecha sidebar | Conectado |
| Select “Obra Principal” | altera `selectedProjectId` | Conectado |
| Botão “Modo Foco” | abre/fecha sidebar | Conectado |
| Tema Claro, desktop | `setTheme("claro")` | Conectado |
| Tema Escuro, desktop | `setTheme("escuro")` | Conectado |
| Tema Híbrido, desktop | `setTheme("hibrido")` | Conectado |
| Botão WhatsApp | alterna `isWhatsAppOpen` | Conectado |
| Sino de notificações | abre/fecha dropdown | Conectado |
| “Lidas” no dropdown | cursor/hover, sem handler | Decorativo |
| Itens da lista de notificações | hover, sem clique | Decorativo |
| Avatar/perfil | abre/fecha menu de perfil | Conectado |
| Perfil & Empresa | navega para `configuracoes-empresa` | Conectado |
| Faturamento & Planos | navega para `planos` | Conectado |
| Configurações Gerais | navega para `configuracoes-contas` | Conectado |
| Tema Claro/Escuro/Híbrido no perfil | altera tema | Conectado |
| Google AI Studio Build | link externo | Conectado |
| Sair do ERP | chama logout Firebase | Conectado |
| Data atual | texto fixo “Sábado, 06 de Junho de 2026 UTC” | Decorativo/estático |

## 5. Gaps Críticos

| gap | impacto |
|---|---|
| `obra-detail` existe no tipo e na sidebar, mas não tem handler em `App.tsx` | Clicar no detalhe da obra cai no Dashboard por fallback |
| `mapa-agentes` existe no tipo e na sidebar, mas não tem handler em `App.tsx` | Central de Agentes IA não abre uma view própria |
| `compras` e `estoque` têm handler, mas não aparecem na sidebar | Rotas existem, mas não há entrada visível de navegação no menu lido |
| Dashboard usa quase tudo a partir de `INITIAL_*` ou estado local hardcoded | Dados principais são simulados, não reais |
| Botão “Apropriar Registro” no Dashboard chama `useApp()` dentro de um `onClick` | Ação tende a quebrar em runtime por violar regras de hooks |
| “Sincronizar” em lançamentos não sincroniza dados | Só ativa shimmer/loading local |
| Header mostra data fixa de 06/06/2026 | Pode parecer informação operacional real, mas está hardcoded |
| Notificações do Header são hardcoded | Não há fonte real nem ação para marcar como lidas |
| “Lidas” parece clicável, mas não executa nada | Interação decorativa/confusa |
