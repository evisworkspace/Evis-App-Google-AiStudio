# AUDIT UI - BLOCO 3 - Obras E Workspace AiStudio

Data: 2026-06-09
Projeto: `C:\Users\User\Evis-AiStudio`

## Arquivos Lidos

| Arquivo | Uso na auditoria |
|---|---|
| `src/components/modules/ObrasView.tsx` | Tela de listagem/detalhe de obras, abas, RDO, medicoes e agentes |
| `src/components/modules/WorkspaceView.tsx` | Central operacional da obra, widgets Google, agentes e drawers |
| `src/types.ts` | `interface Obra`, `rdoList`, `medicoesList`, `orcamentoInsumos`, `INITIAL_OBRAS` |
| `src/context/AppContext.tsx` | Origem dos estados de obras, tarefas, lancamentos e funcoes `addRdo`/`addMedicao` |
| `src/components/assistente/EvisChat.tsx` | Confirmacao do evento `open-maestro` usado pelos agentes do Workspace |

Observacao: a pasta `apps/saas` nao existe neste checkout em `C:\Users\User\Evis-AiStudio`, entao a comparacao com Refurbish foi feita contra o checklist funcional informado no prompt.

## 1. Obras - Listagem E Detalhe

### Carga Dos Dados

| Item | Origem | Persistencia | Observacao |
|---|---|---:|---|
| `obras` | `INITIAL_OBRAS` em `src/types.ts` via `AppContext` | Nao | `useState(INITIAL_OBRAS)`, sem Firestore para obras |
| `rdoList` | Dentro de cada `Obra` em `INITIAL_OBRAS` | So memoria | `addRdo` adiciona no estado React |
| `medicoesList` | Dentro de cada `Obra` em `INITIAL_OBRAS` | So memoria | `addMedicao` adiciona no estado React |
| `orcamentoInsumos` | Dentro de cada `Obra` em `INITIAL_OBRAS` | So memoria | Lista plana por categoria |
| Firestore | Nao usado para obras/RDO/medicoes | Nao | Firestore aparece para empresa/onboarding, nao para obra |

### Listagem

| Area | O que exibe | Dado real ou mock |
|---|---|---|
| Chips | Todas, Em Andamento, Atrasadas, Aguardando Insumos | Calculado em memoria sobre `obras`, `tasks`, `orcamentoInsumos` |
| Quadro Kanban | Obras por status: Planejamento, Fundacao, Estrutura, Acabamento, Entregue | Seed/mock de `INITIAL_OBRAS` |
| Lista | Projeto, cliente, status, etiqueta, data, responsavel | Seed/mock; cliente usa `manager` ou fallback |
| Botoes | Criar projeto, Filtrar, Como funciona, Acoes, Configuracoes | Majoritariamente decorativos/sem acao real |

### Abas Da Obra

| Aba | O que exibe | Status do dado |
|---|---|---|
| Geral | Progresso, datas, equipe, aviso tecnico, ultimos RDOs, linha do tempo | Misto: campos da obra/RDO reais em memoria; aviso e linha do tempo hardcoded |
| Orcamento | Tabela de categorias com planejado, realizado, margem/desvio | Seed/mock em `orcamentoInsumos`; sem orcamento hierarquico |
| Fisico-Financeiro | Progresso fisico x financeiro, BDI, desvio, barras comparativas | Misto: usa `progress`/`budget`; BDI, meta 71% e analise sao hardcoded |
| Cronograma | Banner "Cronos", Gantt de frentes | Simulado; `scheduleItems` hardcoded |
| Curva S | SVG de curva planejada x real | Misto: usa `obra.progress`/`budgetSpent`; curva/meta/analise hardcoded |
| RDO | Banner IA, formulario, chamada `/api/ai/diario`, historico | Parcialmente funcional; salva so em estado React |
| Medicoes | Tabela de medicoes, modal para nova medicao, regras CEF/Itau | Parcialmente funcional em memoria; regras/textos hardcoded |
| Financeiro | Cards, extrato por projeto filtrando `lancamentos` | Misto: usa lancamentos seed; inclui uma linha hardcoded |
| Compras & Insumos | Renderiza `ComprasView` | Fora do escopo lido; aba delegada |
| Equipe | Lista e formulario de alocacao | Simulado/local; altera `projectTeam`, nao persiste em `obra.equipe` |
| Documentos | Lista, upload por prompt, remover | Simulado/local; sem upload/storage real |

## 2. Workspace - Central Operacional Da Obra

| Bloco | O que deveria exibir | Status | Google/API real ou mock |
|---|---|---|---|
| Tela desconectada | Login Google para Workspace | FUNCIONAL | Usa Firebase Auth/Google sign-in |
| Header da obra | Status, risco, responsavel, cliente, progresso, sincronizar | FUNCIONAL parcial | Botao sincroniza Calendar/Drive reais; risco/cliente parcialmente hardcoded |
| Localizacao da Obra | Mapa e endereco | FUNCIONAL parcial | `iframe` Google Maps real; "Abrir no Maps" so toast |
| Equipe e Comunicacao | Contatos e WhatsApp equipe | SIMULADO | Contatos hardcoded; envio WhatsApp mock; cron chama `/api/whatsapp/cron-analyze` local |
| Ficha da Obra | Dados cadastrais resumidos | SIMULADO parcial | Usa nome/local/manager; CPF, datas, area e cliente hardcoded |
| Diario de Obra IA card | Entrada para RDO por Maestro | SIMULADO parcial | Abre `EvisChat` por evento; nao abre drawer RDO direto |
| Agentes Atentos | EVA, Sentinela, Vera, Nina | SIMULADO parcial | Cards hardcoded; acoes abrem Maestro |
| Tarefas Abertas | Tarefas da obra | FUNCIONAL em memoria | Usa `tasks` por `project.id`; sem Firestore |
| Proximas Reunioes | Eventos Google Calendar | FUNCIONAL parcial | Leitura real do Calendar; insight "Agenda IA" hardcoded |
| Arquivos da Obra | Arquivos Google Drive | FUNCIONAL parcial | Leitura real do Drive; nao filtra por obra; Dora hardcoded |
| Banner Governanca | Aviso de simulacao IA/HITL | DECORATIVO | Mock |
| Drawer Ficha | Cadastro completo + mapa interno | SIMULADO parcial | Dados mistos; mapa do drawer e mock visual |
| Drawer WhatsApp | Esboco de mensagem | SIMULADO | Copia/prepara; nao envia |
| Drawer RDO | Rascunho IA com clima, equipe, fotos, tarefas | SIMULADO | Nao salva RDO; "Google Docs" e mock |
| Drawer EVA Decisoes | Decisoes e handoffs | SIMULADO | Sem entrada direta no Workspace; so existe no JSX |
| Drawer Sentinela | Riscos, evidencias, mitigacao | SIMULADO | Evidencias hardcoded |
| Drawer Vera Financeira | Fluxo/DRE/lembretes | SIMULADO | Lembretes locais |
| Drawer Nina Compras | Cotacao e fornecedores | SIMULADO | "Google Sheets Matrix" visual; sem API |
| Drawer Dora Documentos | OCR/classificacao | SIMULADO | "Google Drive Corporativo" explicitamente simulado |
| Drawer Agenda | Reagendamento e slots | SIMULADO | Nao escreve no Calendar |

## 3. RDO - Diario De Obra

| Pergunta | Resposta |
|---|---|
| Existe drawer/modal de RDO? | Sim no `WorkspaceView` (`activeDrawer === "rdo"`), mas nao ha botao direto principal que chame esse drawer; o card principal abre o Maestro. Em `ObrasView`, RDO e aba, nao drawer. |
| Campos em `ObrasView` | Transcricao para IA, clima, efetivo/trabalhadores, atividades concluidas, observacoes tecnicas. |
| Campos no drawer `WorkspaceView` | Clima, SST/ocorrencias, efetivo, relato operacional, anexos por nome, tarefas sugeridas, confirmacao humana. |
| Agente "Diario de Obra IA" | Presente nas duas telas. Em `ObrasView`, parte e hardcoded e parte dinamica via `/api/ai/diario`. Em `WorkspaceView`, o fluxo e hardcoded/simulado. |
| Salva dados? | `ObrasView` salva em `obra.rdoList` via estado React somente. `WorkspaceView` nao salva RDO na obra; apenas mostra toast e fecha fluxo simulado. |
| Fotos/status | Nao ha fotos reais nem storage. No Workspace ha nomes de anexos simulados. Nao ha status formal do RDO no tipo `rdoList`. |

## 4. Agentes IA Nas Telas

| Tela | Banner/mensagem | Hardcoded ou dinamico? | Acao conectada? |
|---|---|---|---|
| Obras | Aviso Tecnico Geral de Seguranca | Hardcoded | Nao |
| Obras | Cronos Planejador | Hardcoded | Botoes so alert simulado |
| Obras | Analise do Planejamento / Curva S | Misto, com valores da obra | Nao |
| Obras | Diario de Obra IA | Hardcoded | Publicacao simulada |
| Obras | Gerar Diario de Obra com IA | Dinamico via `/api/ai/diario` | Sim, preenche formulario |
| Obras | Motor Semantico de Obra IA | Dinamico, resultado da API | Sem persistencia propria |
| Obras | Analise Tecnica fisico-financeira | Hardcoded | Nao |
| Obras | Analise Tecnica Segura documentos | Hardcoded | Nao |
| Workspace | Risco Principal no header | Hardcoded | Nao |
| Workspace | Diario de Obra IA card | Hardcoded | Abre Maestro |
| Workspace | EVA, Sentinela, Vera, Nina | Hardcoded | Abrem Maestro |
| Workspace | Agenda Inteligente IA | Hardcoded | Abre Maestro |
| Workspace | Dora Documentos | Hardcoded | Abre Maestro |
| Workspace | Governanca EVIS | Hardcoded | Nao |
| Workspace | Drawers de agentes | Hardcoded/local-state | Acoes simuladas; sem mutacao real externa |

## 5. Comparacao Com `apps/saas`

Observacao: nao existe diretorio `apps/saas` dentro de `C:\Users\User\Evis-AiStudio`, entao nao consegui inspecionar o codigo local do Refurbish. A comparacao abaixo usa as capacidades listadas no prompt como referencia.

| Capacidade do Refurbish `apps/saas` | AiStudio tem? | Vazio/simulado | Falta |
|---|---|---|---|
| Ficha completa: endereco, equipe, datas, m2 | Parcial | Endereco e `location`; equipe/datas existem; m2 e hardcoded no Workspace | Campos estruturados de endereco, cliente, tipo, area, contrato, responsaveis formais |
| RDO com fotos e status | Parcial | RDO tem data, clima, trabalhadores, nota, observacoes; fotos so nomes simulados no Workspace | Fotos reais, storage, status, autor, validacao, vinculo documental |
| Orcamento com `RefurbishItem` hierarquico | Nao | AiStudio tem `orcamentoInsumos` plano por categoria | Hierarquia, itens, insumos, composicoes, unidade, quantidade, predecessores |
| Contratos e medicoes | Parcial | Medicoes basicas existem; contratos aparecem so como texto/documento simulado | Entidade de contrato, vinculo com medicao, aprovacao, anexos |
| Documentos no storage | Parcial visual | `documentos` e so metadado; Drive lista arquivos reais recentes mas nao por obra/storage | Upload real, URL/storage, vinculo com obra/RDO/contrato/medicao |
| Tarefas vinculadas | Parcial | `tasks` tem `project`; cron WhatsApp pode criar tarefas em memoria | Tarefa vinculada a RDO, documento, contrato, item de orcamento, responsavel real e persistencia |

## 6. Gaps Prioritarios

### Obras

| Prioridade | Gap |
|---:|---|
| 1 | Persistencia: obras, RDOs, medicoes, equipe e documentos ficam em memoria; nao ha Firestore/storage para o modulo. |
| 2 | Modelo `Obra` raso: falta cliente, endereco estruturado, area/m2, tipo, contrato, status detalhado, responsaveis e metadados tecnicos. |
| 3 | RDO incompleto: sem fotos reais, status, autor, assinatura, publicacao, documento gerado ou vinculo com tarefas. |
| 4 | Orcamento nao hierarquico: `orcamentoInsumos` e uma lista plana, insuficiente para Refurbish/SINAPI/composicoes. |
| 5 | Muitas abas sao mock: cronograma, curva S, fisico-financeiro, financeiro e documentos misturam dados locais com analises hardcoded. |

### Workspace

| Prioridade | Gap |
|---:|---|
| 1 | Integracoes Google sao majoritariamente leitura generica; Calendar/Drive nao sao filtrados por obra e nao ha escrita real. |
| 2 | Agentes sao mais narrativos que operacionais: cards abrem chat, mas decisoes/drawers nao persistem mudancas no dominio. |
| 3 | RDO do Workspace nao conversa com `ObrasView`: gera rascunho simulado, mas nao salva em `rdoList`. |
| 4 | Documentos/Dora/OCR sao simulados; nao ha classificacao real, storage, metadados persistidos ou vinculo com Drive por obra. |
| 5 | Fluxos de WhatsApp, agenda, cotacao e financeiro nao executam acoes externas reais; ficam em toast/local state. |
