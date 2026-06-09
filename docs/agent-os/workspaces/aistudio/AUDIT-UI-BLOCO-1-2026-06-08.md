# AUDIT UI - BLOCO 1 - Compras, Estoque, Tarefas e Cadastros AiStudio

Data: 2026-06-08
Projeto: `C:\Users\User\Evis-AiStudio`

## Arquivos Lidos

| Arquivo | Uso na auditoria |
|---|---|
| `src/components/modules/ComprasView.tsx` | Auditoria das abas de compras, estoque fisico, Nina Compras, acoes e formularios |
| `src/components/modules/TarefasView.tsx` | Auditoria de tarefas, Kanban, filtros, Google Tasks e status |
| `src/components/modules/AdminView.tsx` | Auditoria de cadastros, configuracoes e planos no AiStudio |
| `src/types.ts` | Interfaces `PurchaseOrder`, `Insumo`, `Task` e seeds `INITIAL_PURCHASES`, `INITIAL_INSUMOS`, `INITIAL_TASKS` |
| `src/context/AppContext.tsx` | Confirmacao da origem dos estados globais em `INITIAL_*` e ausencia de Firestore nos modulos auditados |

## Contexto Complementar Para Comparacao

O diretorio `apps/saas` nao existe dentro de `C:\Users\User\Evis-AiStudio`. Para a comparacao solicitada, foi localizado e lido o SaaS em:

`C:\Users\User\.Site App Evis\apps\saas`

Arquivos relevantes lidos no SaaS:

| Area | Arquivos |
|---|---|
| Compras | `src/app/(app)/compras/*`, `src/components/modules/compras/*`, routers `purchase`, `quote`, `order` por busca |
| Estoque | `src/app/(app)/estoque/page.tsx`, `InventoryTable.tsx`, `TransactionDrawer.tsx`, `src/server/routers/inventory.ts` |
| Tarefas | `src/app/(app)/tarefas/page.tsx`, `TaskList.tsx`, `TaskKanban.tsx`, `TaskDrawer.tsx`, `gestao-horas/page.tsx`, `src/server/routers/task.ts` |
| Cadastros | paginas de clientes, fornecedores, insumos, empresa, contas, equipe e planos; drawers `CustomerDrawer`, `SupplierDrawer`, `ItemDrawer` |
| Banco | `prisma/schema.prisma` |

## Origem Dos Dados No AiStudio

| Entidade | Interface | Seed | Origem em runtime | Firestore? |
|---|---|---|---|---|
| Compras / OC | `PurchaseOrder` | `INITIAL_PURCHASES` | `AppContext` usa `useState<PurchaseOrder[]>(INITIAL_PURCHASES)` | Nao |
| Insumos | `Insumo` | `INITIAL_INSUMOS` | `AppContext` usa `useState<Insumo[]>(INITIAL_INSUMOS)`, mas `AdminView` nao usa | Nao |
| Tarefas | `Task` | `INITIAL_TASKS` | `AppContext` usa `useState<Task[]>(INITIAL_TASKS)` | Nao |
| Solicitacoes de compra | Tipo local anonimo | Nao usa `INITIAL_*` | `useState` local em `ComprasView` | Nao |
| Matriz de cotacao | Tipo local anonimo | Nao usa `INITIAL_*` | `comparisonMatrix` hardcoded em `ComprasView` | Nao |
| Estoque fisico | Tipo local anonimo | Nao usa `INITIAL_*` | `estoqueItems` hardcoded em `ComprasView` | Nao |
| Clientes / fornecedores no Admin | Tipos locais anonimos | Nao usa `INITIAL_*` | `useState` local em `AdminView` | Nao |

## 1. COMPRAS

### Resumo Por Aba

| Aba | O que renderiza | Dados sao `INITIAL_*` ou Firestore? | Formularios existem e salvam? | Status das acoes | Nina Compras |
|---|---|---|---|---|---|
| Panorama | KPIs de solicitacoes, volume homologado, OCs e insumos criticos; grafico visual de fluxo logistico; alerta de compra | Usa `purchases` do `AppContext`, originado em `INITIAL_PURCHASES`; `solicitacoes` local; nao Firestore | Nao ha formulario | Sem acoes de dominio; apenas visual/informativo | Nao aparece |
| Solicitacoes | Fila tecnica de SC filtrada pela obra ativa e busca por item; formulario de registro de SC | `solicitacoes` hardcoded em `useState`; nao `INITIAL_*`; nao Firestore | Sim. Cria SC em estado local da tela e mostra `alert`; perde ao recarregar | Nao ha aprovar/rejeitar. Status e apenas texto/badge (`Aprovada`, `Aguardando Parecer`, `Rascunho`) | Nao aparece |
| Cotacoes | Card Nina Compras; matriz comparativa fixa com 3 fornecedores; botoes para homologar fornecedor | `comparisonMatrix` hardcoded; ao homologar cria OC em `purchases` local do `AppContext`; nao Firestore | Nao ha formulario para cadastrar cotacao/fornecedor/preco | `Homologar e Gerar OC` funciona apenas em memoria: adiciona `PurchaseOrder` local e alerta simulacao | Hardcoded, nao dinamica |
| Ordens | Tabela de OCs da obra ativa com codigo, data, item, fornecedor, valor e botao bloquear | `purchases` do `AppContext`, originado em `INITIAL_PURCHASES` e alteravel em memoria; nao Firestore | Nao ha formulario de OC | `Bloquear` remove a OC do estado local; nao persiste e nao altera status formal | Nao aparece |
| Historico | Indicadores SINAPI Curitiba, grafico de barras visual e texto de previsao de precos | Hardcoded; nao usa `INITIAL_INSUMOS`; nao Firestore | Nao | Sem acoes funcionais | Nao aparece |
| Estoque | Radar de insumos; tabela de estoque fisico por obra ativa; botao de reposicao | `estoqueItems` hardcoded em `useState`; nao `INITIAL_INSUMOS`; nao Firestore | Nao ha cadastro/edicao de item | `Disparar Reposicao` soma `minStock * 3` no saldo local; nao registra movimento | Nao aparece |

### Acoes De Compras

| Acao | Onde aparece | Funcionalidade real | Persistencia |
|---|---|---|---|
| Enviar SC para homologacao | Aba Solicitacoes | Cria objeto local com status `Aguardando Parecer` | Somente memoria React |
| Aprovar SC | Nao existe como botao | Nao implementado | Nao |
| Rejeitar SC | Nao existe como botao | Nao implementado | Nao |
| Finalizar cotacao | Nao existe como fluxo formal | Nao implementado; so homologar fornecedor | Nao |
| Homologar e gerar OC | Aba Cotacoes | Adiciona `PurchaseOrder` ao `purchases` local | Somente memoria React |
| Bloquear OC | Aba Ordens | Remove OC do array local | Somente memoria React |
| Repor estoque | Aba Estoque | Aumenta quantidade local | Somente memoria React |

## 2. ESTOQUE

| Pergunta | Resposta |
|---|---|
| Existe aba ou secao de estoque dentro do `ComprasView`? | Sim. Existe a aba `Estoque Fisico` dentro do controlador de abas de `ComprasView`. |
| Campos item, quantidade, minimo, projeto preenchidos? | Sim em dados hardcoded: `name`, `qty`, `unit`, `project`, `minStock`. A tabela mostra item, quantidade e unidade. O minimo e usado para alerta, mas nao aparece como coluna explicita. |
| Tem movimentacao entrada/saida? | Nao. Existe apenas `executeRestock`, que soma uma quantidade ao saldo. Nao ha entrada, saida, transferencia, motivo, data, responsavel ou historico. |
| Usa `INITIAL_INSUMOS`? | Nao. Embora `INITIAL_INSUMOS` exista em `types.ts`, o estoque do `ComprasView` usa `estoqueItems` local. |
| Usa Firestore? | Nao. |

### Campos Presentes No Estoque AiStudio

| Campo | Existe no dado local? | Aparece na UI? | Observacao |
|---|---:|---:|---|
| Item | Sim, `name` | Sim | Texto do insumo |
| Quantidade atual | Sim, `qty` | Sim | Formatada na tabela |
| Unidade | Sim, `unit` | Sim | Coluna propria |
| Estoque minimo | Sim, `minStock` | Parcial | Usado para alerta, sem coluna |
| Projeto/obra | Sim, `project` | Parcial | Usado para filtrar pela obra ativa; nao aparece como coluna |
| Localizacao | Nao | Nao | Ausente |
| Ultima movimentacao | Nao | Nao | Ausente |
| Tipo de movimento | Nao | Nao | Ausente |

## 3. TAREFAS

| Pergunta | Resposta |
|---|---|
| `TarefasView` renderiza algo ou esta vazio? | Renderiza uma tela completa com header, sincronizacao Google, abas `Visao Geral & Indicadores` e `Quadro Kanban`. |
| Filtros por obra, responsavel, status funcionam? | Nao existem filtros dedicados por obra, responsavel ou status. Ha apenas busca textual por titulo/responsavel no Kanban. |
| CRUD de tarefas existe? | Parcial. Nao ha criar, editar ou excluir. Existe alteracao de status por drag-and-drop no Kanban usando `setTasks` local. |
| Apontamento de horas existe? | Nao. O tipo `Task` tem `loggedHours?: number`, mas nao existe UI para apontar horas, historico de apontamentos ou `TaskTimeEntry`. |
| Usa Firestore? | Nao. Tarefas vem de `INITIAL_TASKS` via `AppContext`. |
| Integracao Google | Parcial. Botao sincroniza tarefas pendentes para Google via `createGoogleTask`, apos obter token Google. |

### Abas De Tarefas

| Aba | O que renderiza | Dados | Funcionalidade |
|---|---|---|---|
| Visao Geral & Indicadores | Card Automador EVIS, KPIs, distribuicao por obra, tarefas concluidas recentes | `tasks` e `obras` do `AppContext`, originados de `INITIAL_TASKS` e `INITIAL_OBRAS` | Indicadores calculados em memoria; botoes do Automador mostram alerta simulado |
| Quadro Kanban | Colunas `Fazer`, `Progresso`, `Revisao`, `Concluido`; cards arrastaveis | `tasks` do `AppContext` | Drag-and-drop altera `status` local via `setTasks`; busca por titulo/responsavel |

### Tarefas - Campos Da Interface `Task`

| Campo | Existe | Usado na UI |
|---|---:|---|
| `id` | Sim | Key e drag/drop |
| `title` | Sim | Card/listagem/KPIs |
| `project` | Sim | Distribuicao por obra e badge no Kanban |
| `assignedTo` | Sim | Busca e card |
| `dueDate` | Sim | Card e Google sync |
| `priority` | Sim | Badge e KPI prioridade alta |
| `status` | Sim | Colunas Kanban e progresso |
| `loggedHours` | Sim, opcional | Nao aparece como apontamento formal; sem edicao |

## 4. CADASTROS - ADMINVIEW

### Mapa De Secoes Existentes

| Secao / rota | Existe no `AdminView`? | O que mostra | Dados de `INITIAL_*` ou Firestore? | CRUD funciona? |
|---|---:|---|---|---|
| Clientes (`cadastros-clientes`) | Sim | Lista de clientes com nome, CNPJ, segmento e contratos ativos; botao `+ Adicionar Cliente SPE` | Hardcoded em `useState` local; nao `INITIAL_*`; nao Firestore | Nao. Lista existe, mas botao nao abre formulario nem salva |
| Fornecedores (`cadastros-fornecedores`) | Sim | Lista de fornecedores com CNPJ, especialidade e rating; botao `+ Cadastrar Fornecedor` | Hardcoded em `useState` local; nao `INITIAL_*`; nao Firestore | Nao. Lista existe, mas botao nao abre formulario nem salva |
| Insumos SINAPI (`cadastros-insumos`) | Nao | Nada renderizado para essa rota | `INITIAL_INSUMOS` existe em `types.ts`, mas nao e usado no `AdminView` | Nao |
| Empresa (`configuracoes-empresa`) | Sim | Formulario com razao social, CNPJ e inscricao municipal | Hardcoded em estados locais (`companyName`, `cnpj`, `municipalRegistration`); nao Firestore | Parcial visual. Altera estado local e mostra `alert`; nao persiste |
| Contas bancarias (`configuracoes-contas`) | Sim | Cards de integracao bancaria OFX e certificado A3 | Hardcoded visual; nao usa `INITIAL_ACCOUNTS`; nao Firestore | Nao. Nao ha formulario |
| Equipe (`configuracoes-equipe`) | Nao | Nada renderizado para essa rota | Nao usa `INITIAL_OBRAS.equipe` nem Firestore | Nao |
| Planos (`planos`) | Sim | Tela de billing/licencas com plano Enterprise, preco, renovacao e card de IA | Hardcoded visual | Nao. Nao troca plano nem persiste |

### Clientes

| Item | Status |
|---|---|
| Lista existe? | Sim |
| CRUD funciona? | Nao |
| Dados | `clientes` local em `useState` |
| Persistencia | Nenhuma |
| Busca/filtros | Nao |
| Campos exibidos | Nome, CNPJ, segmento, contratos ativos |

### Fornecedores

| Item | Status |
|---|---|
| Lista existe? | Sim |
| CRUD funciona? | Nao |
| Dados | `fornecedores` local em `useState` |
| Persistencia | Nenhuma |
| Busca/filtros | Nao |
| Campos exibidos | Nome, CNPJ, especialidade, rating |

### Insumos SINAPI

| Item | Status |
|---|---|
| Lista existe? | Nao no `AdminView` |
| Busca funciona? | Nao existe UI |
| Dados | `INITIAL_INSUMOS` existe, mas nao esta conectado a tela |
| Persistencia | Nenhuma |

### Empresa, Contas Bancarias, Equipe

| Secao | Formulario existe? | Salva? | Observacao |
|---|---:|---:|---|
| Empresa | Sim | Nao persiste; so estado local e `alert` | Campos fiscais basicos |
| Contas Bancarias | Nao | Nao | Cards informativos sobre integracao bancaria/certificado |
| Equipe | Nao | Nao | Rota existe no tipo `MenuRoute`, mas nao ha branch renderizada |

### Planos

| Item | Status |
|---|---|
| Tela existe? | Sim |
| Mostra o que? | Plano `Construtora Enterprise`, preco `R$ 1.490,00 / mes`, renovacao em `29/06/2026`, beneficios e card de uso de IA |
| Dados dinamicos? | Nao; hardcoded |
| Acao real? | Nao |

## 5. COMPARACAO COM `apps/saas`

### Compras

| Capacidade do `apps/saas` | AiStudio tem? | Diferenca |
|---|---:|---|
| Dados persistidos em Postgres/Prisma via tRPC | Nao | AiStudio usa `INITIAL_PURCHASES` e estados locais |
| Solicitacoes com create/update | Parcial | AiStudio cria SC apenas em estado local, sem edicao/persistencia |
| Itens da SC vinculados ao catalogo de insumos | Nao | SaaS busca `item.list`; AiStudio usa texto livre |
| Filtros por status, obra e busca | Parcial | AiStudio so filtra SC por obra ativa e texto do item; sem filtros de status/obra selecionavel |
| Acoes enviar, aprovar, rejeitar SC | Nao | SaaS tem `purchase.submit`, `approve`, `reject`; AiStudio nao |
| Criar cotacao a partir de SC | Nao | SaaS tem `quote.createFromPurchase`; AiStudio tem matriz hardcoded |
| Matriz de cotacao baseada em fornecedores/itens reais | Nao | AiStudio usa 3 fornecedores fixos |
| Selecionar vencedor/gerar OC a partir da cotacao | Parcial | AiStudio gera OC local; SaaS gera OC via mutation e atualiza dados |
| Ordens com create/update | Nao | AiStudio so lista e remove local |
| Aprovar/cancelar/marcar entregue OC | Nao | SaaS tem mutations reais em `order` |
| Parcelas/payment info em OC | Nao | SaaS tem `paymentQuantity` e `paymentInfo`; AiStudio nao |

### Estoque

| Capacidade do `apps/saas` | AiStudio tem? | Diferenca |
|---|---:|---|
| Modulo proprio `/estoque` | Parcial | AiStudio tem aba dentro de Compras, nao modulo completo |
| Cadastro de item em estoque | Nao | SaaS cria inventario com item, obra, quantidade, minimo, localizacao |
| Filtros por item/codigo, obra e estoque baixo | Nao | AiStudio so filtra pelo projeto ativo internamente |
| KPIs de itens, baixo estoque e movimentacoes do dia | Nao | AiStudio tem apenas alerta visual |
| Estoque minimo visivel | Parcial | AiStudio usa minimo para alerta, mas nao mostra coluna |
| Localizacao | Nao | SaaS tem `location` |
| Movimentacao entrada/saida/transferencia | Nao | SaaS tem `addTransaction`; AiStudio so reposicao local |
| Historico de ultimas movimentacoes | Nao | SaaS mostra ultimas transacoes |

### Tarefas

| Capacidade do `apps/saas` | AiStudio tem? | Diferenca |
|---|---:|---|
| Lista e Kanban | Sim | AiStudio tem Kanban e indicadores; SaaS tem lista/Kanban com backend |
| Criar/editar tarefa | Nao | SaaS tem `TaskDrawer` com `task.create/update` |
| Excluir tarefa | Nao | SaaS tem soft delete via `task.delete` |
| Mudar status | Parcial | AiStudio muda status via drag local; SaaS persiste via `task.changeStatus` |
| Filtro por status | Nao | SaaS tem filtro de status na lista |
| Filtro por etapa | Nao | SaaS tem `stage` |
| Filtro por obra/responsavel no router | Nao na UI AiStudio | SaaS router suporta `idRefurbish`, `onlyMine`, `priority`; UI lida com alguns filtros |
| Apontamento de horas | Nao | SaaS tem modelo `TaskTimeEntry` e mutation `task.logTime`, mas pagina `gestao-horas` ainda e placeholder |
| Responsavel como usuario real | Nao | AiStudio usa string `assignedTo`; SaaS usa `idResponsible` e relacao com `User` |

### Cadastros

| Capacidade do `apps/saas` | AiStudio tem? | Diferenca |
|---|---:|---|
| Clientes com lista, busca, paginacao e drawer | Nao | AiStudio lista hardcoded, sem busca/formulario |
| Cliente create/update/toggle ativo | Nao | SaaS tem mutations reais |
| Fornecedores com lista, busca e drawer | Nao | AiStudio lista hardcoded, sem formulario |
| Contatos de fornecedor | Nao | SaaS permite adicionar/remover contatos |
| Metodos de pagamento de fornecedor | Nao | SaaS permite adicionar metodos |
| Insumos com lista, busca, filtro tipo e drawer | Nao | AiStudio nao renderiza `cadastros-insumos` |
| Empresa com formulario persistente | Parcial | AiStudio tem formulario local; SaaS salva via `company.update` |
| Contas bancarias com criacao e conta padrao | Nao | SaaS tem `BankAccountList` com create e set default |
| Equipe com convite/remocao e limite de plano | Nao | SaaS tem `inviteUser`, `removeUser` e limites |
| Planos Free/Pro com limites reais | Parcial | AiStudio mostra plano hardcoded; SaaS consulta limites e plano atual |

## 6. GAPS PRIORITARIOS

### Compras

| Prioridade | Gap | Impacto |
|---:|---|---|
| 1 | Persistir SC, cotacoes e OCs em backend/Firestore ou alinhar ao backend SaaS | Sem persistencia, todo fluxo se perde ao recarregar |
| 2 | Implementar fluxo real SC -> aprovacao/rejeicao -> cotacao -> OC | Hoje aprovar/rejeitar/finalizar cotacao sao ausentes ou simulados |
| 3 | Substituir matriz/Nina/historico hardcoded por dados reais | A IA e a matriz parecem operacionais, mas nao refletem dados dinamicos |

### Tarefas

| Prioridade | Gap | Impacto |
|---:|---|---|
| 1 | Implementar CRUD completo de tarefas | Usuario nao consegue criar, editar ou excluir demandas |
| 2 | Adicionar filtros reais por obra, responsavel e status | A tela nao suporta gestao operacional por responsavel/obra |
| 3 | Criar apontamento de horas com historico | `loggedHours` existe no tipo, mas nao ha fluxo de registro ou auditoria |

### Cadastros

| Prioridade | Gap | Impacto |
|---:|---|---|
| 1 | Implementar CRUD real para clientes, fornecedores e insumos | Cadastros centrais do ERP sao listas visuais/hardcoded |
| 2 | Tornar Empresa, Contas Bancarias e Equipe persistentes | Configuracoes administrativas nao sobrevivem reload e nao governam o sistema |
| 3 | Conectar rotas existentes mas vazias (`cadastros-insumos`, `configuracoes-equipe`) | Sidebar/rotas prometem funcionalidades que nao renderizam conteudo |

## Conclusao

O AiStudio entrega uma demonstracao visual coerente para Compras, Estoque, Tarefas e Cadastros, mas a maior parte do comportamento auditado ainda esta em estado local, `INITIAL_*` ou conteudo hardcoded. Nao ha Firestore nesses modulos auditados.

O `apps/saas` ja possui base operacional mais madura para os mesmos dominios: Prisma/tRPC, CRUDs reais, estoque com transacoes, tarefas com backend, cadastros persistentes e plano/equipe/contas com mutacoes. A principal lacuna do AiStudio e transformar a camada demonstrativa em fluxo persistente e auditavel.
