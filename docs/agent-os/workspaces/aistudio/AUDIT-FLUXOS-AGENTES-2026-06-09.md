# AUDIT-FLUXOS-AGENTES-2026-06-09

Projeto auditado: `C:\Users\User\Evis-AiStudio`
Arquivo de saída: `C:\Users\User\Evis-AiStudio\docs\agent-os\workspaces\aistudio\AUDIT-FLUXOS-AGENTES-2026-06-09.md`
Data da auditoria: 2026-06-09

## Escopo lido

Arquivos principais auditados:
- `src/components/assistente/EvisChat.tsx`
- `src/components/modules/WorkspaceView.tsx`
- `src/components/modules/DashboardView.tsx`
- `src/components/modules/OportunidadesView.tsx`
- `src/components/modules/OportunidadeDetail.tsx`
- `server.ts`

Arquivos auxiliares consultados somente para confirmar modelo de dados em memória:
- `src/context/AppContext.tsx`
- `src/types.ts`

Resumo executivo:
- Os agentes existem principalmente como componentes visuais, mensagens simuladas, drawers e estados locais React.
- Há endpoints de IA em `server.ts`, mas eles não formam uma cadeia de orquestração entre agentes.
- Os handoffs mais claros estão no `WorkspaceView.tsx`, via troca de drawer (`setActiveDrawer`) e `showToast`; eles não passam payload estruturado nem persistem contexto.
- O fluxo HITL mais completo no código é o de extração de lead em `OportunidadesView.tsx`: IA extrai, humano revisa, depois o sistema preenche o formulário e salva em estado local via `addOportunidade`.
- Nos arquivos auditados não há leitura/escrita real no Firestore para operações dos agentes. O `AppContext` usa `useState` com dados iniciais; Firebase aparece para autenticação.

## 1. MATRIZ AGENTE - MÓDULO

| Agente | Dashboard | Oportunidades | Obras | Workspace | Financeiro | Compras |
| --- | --- | --- | --- | --- | --- | --- |
| Maestro Operacional | Não aparece como card próprio; é acionado indiretamente por `open-maestro`. | Não aparece como agente de CRM. | Hub flutuante via `EvisChat`, filtrando contexto por rota/obra. | Central de mensagens e drawer de WhatsApp; recebe eventos `open-maestro`. | Apenas roteia conversa para Vera quando role contém Financeira. | Apenas roteia conversa para Nina quando role contém Compras. |
| EVA Executiva | Card global de resumo executivo com botão Abrir Conversa (`DashboardView.tsx:254-281`). | Não aparece diretamente. | Mensagens globais no chat; papel de visão executiva. | Card de resumo diário e drawer `decisoes`; encaminha para Nina, Diário, Dora e Agenda (`WorkspaceView.tsx:1054-1208`). | Vê risco financeiro consolidado, mas não executa financeiro. | Encaminha decisão de cotação para Nina. |
| Sentinela | Card crítico de risco no portfólio, com escopo global (`DashboardView.tsx:218-245`). | Não aparece. | Mensagem global no chat com severidade crítica. | Card/drawer de evidências; recomenda mitigação e aciona Nina/Agenda (`WorkspaceView.tsx:1214-1351`). | Pode gerar risco financeiro indireto; sem drawer financeiro próprio. | Usa evidências de compras e pode acionar Nina. |
| Vera Financeira | Não há card de agente Vera no Dashboard; há dados financeiros gerais. | Não aparece. | Mensagem global no chat para vencimentos/caixa. | Card e drawer de otimização de caixa (`WorkspaceView.tsx:514-528`, `1357-1563`). | Agente principal de caixa, vencimentos, DRE e compensação. | Lê impacto de compras pendentes da Nina; não compra. |
| Nina Compras | Não há card próprio no Dashboard. | Não aparece diretamente. | Mensagem de obra no chat para insumo crítico. | Card e drawer de cotação, fornecedores, comparação e aprovação simulada (`WorkspaceView.tsx:532-546`, `1569-1735`). | Gera impacto financeiro para Vera. | Agente principal de cotação e solicitação de materiais. |
| Dora Documentos | Não há card próprio no Dashboard. | Não aparece diretamente. | Mensagem de obra no chat para anexos sensíveis. | Card e drawer de OCR/classificação de documentos (`WorkspaceView.tsx:636-649`, `1741-1889`). | Pode sinalizar documento sensível de NF/contrato. | Classifica documentos de suprimentos; não compra. |
| Diário de Obra IA | Não há card próprio no Dashboard. | Não aparece. | Mensagem de obra no chat para RDO pendente. | Card e drawer de RDO assistido por IA (`WorkspaceView.tsx:437-462`, `748-1048`). | Gera apontamentos que podem afetar medição/financeiro. | Sugere reestocagem junto à Nina dentro do RDO. |
| Agenda Inteligente / Cronos | Não há card próprio no Dashboard. | Não aparece. | Mensagem de obra no chat para conflito de agenda. | Card de Agenda Inteligente e drawer de reagendamento (`WorkspaceView.tsx:591-604`, `1895-2004`). | Pode proteger medição/recebíveis por reagendamento. | Sentinela pode acioná-la para contingência de suprimentos. |
| Lia Comercial | Não aparece no Dashboard. | Card de insights da Lia e fluxo de extração de lead (`OportunidadesView.tsx:335-350`, `872-944`). | Atua antes da obra; não opera obra ativa. | Não aparece no Workspace. | Não aparece. | Pode preparar briefing para orçamento, mas sem handoff real para compras. |
| Otto Orçamentista | Não aparece no Dashboard. | Drawer/aba de orçamento na oportunidade detalhada (`OportunidadeDetail.tsx:360-377`, `491-514`). | Atua na pré-obra; converte orçamento em itens de oportunidade. | Não aparece no Workspace. | Estima custos/BDI antes do financeiro. | Sugere insumos; não abre Nina diretamente. |
| WhatsApp Analyzer / Lia Omnichannel | Não aparece no Dashboard. | Pode classificar solicitação de orçamento via endpoint, mas sem caller visível nos arquivos auditados. | Pode gerar tarefa ou nota a partir de mensagem. | `runWhatsappCron` lê `/api/whatsapp/cron-analyze` e cria tasks locais (`WorkspaceView.tsx:89-127`). | Pode extrair comprovante/nota se implementado. | Pode extrair material solicitado e criar task para Compras. |

## 2. FLUXOS DE PASSAGEM DE CONTEXTO

Existe passagem visual de contexto entre agentes, mas quase sempre sem payload estruturado e sem persistência.

Fluxos encontrados:
- Dashboard -> Maestro/EvisChat: `DashboardView` dispara `window.dispatchEvent(new CustomEvent("open-maestro", { detail: { agentRole } }))` (`DashboardView.tsx:191-192`). `EvisChat` escuta `open-maestro` e abre a thread do agente correspondente (`EvisChat.tsx:198-211`). O payload é apenas `agentRole`.
- Workspace -> Maestro/EvisChat: `WorkspaceView` tem o mesmo padrão de `openMaestro` (`WorkspaceView.tsx:169-170`) nos cards de Diário, EVA, Sentinela, Vera, Nina, Agenda e Dora.
- EVA -> Nina: no drawer de decisões, clicar em "Abrir Nina Compras" chama `setActiveDrawer("cotacao")` e exibe toast de handoff (`WorkspaceView.tsx:1096-1097`). Não passa objeto de decisão, risco, item ou obra; o drawer de Nina usa dados estáticos.
- EVA -> Diário: `setActiveDrawer("rdo")` com toast (`WorkspaceView.tsx:1129-1130`). Não passa o conteúdo da decisão como input para o RDO.
- EVA -> Dora: `setActiveDrawer("classificacao")` com toast (`WorkspaceView.tsx:1162-1163`). Não passa o documento sensível detectado como payload.
- EVA -> Agenda: `setActiveDrawer("reagendar")` com toast (`WorkspaceView.tsx:1195-1196`). Não passa evento de calendário real.
- Sentinela -> Nina: `setActiveDrawer("cotacao")` com toast (`WorkspaceView.tsx:1314-1315`). Não passa o risco de aço CA-50 para a cotação.
- Sentinela -> Agenda: `setActiveDrawer("reagendar")` com toast (`WorkspaceView.tsx:1323-1324`). Não passa a contingência para replanejamento.
- RDO -> Nina/Sentinela: o rascunho de RDO contém textos estáticos como "Solicitar reestocagem de cimento CP-II junto à Nina" e "Riscos Detectados pela Sentinela" (`WorkspaceView.tsx:979-1003`), mas isso não cria tarefa nem mensagem para Nina ou Sentinela.
- EvisChat -> ações sugeridas: `handleAction` ignora `actionStr` semanticamente e apenas marca a mensagem como `simulada` (`EvisChat.tsx:222-224`). Exemplo: o botão "Acionar Nina Compras" do alerta da Sentinela não aciona Nina de fato (`EvisChat.tsx:80-83`).

Gap registrado:
- Não há barramento de eventos de agentes, tabela de mensagens persistida, objeto de handoff ou chamada backend que receba `sourceAgent`, `targetAgent`, `obraId`, `evidence`, `recommendation`, `approvalRequired` e `status`.
- Os endpoints `/api/ai/*` não chamam uns aos outros. Cada rota responde isoladamente.

## 3. FLUXO DE ESCALADA

Caminho visual implementado:
1. Um agente crítico aparece como card/mensagem. Exemplo: Sentinela no Dashboard detecta risco crítico no Batel Tower (`DashboardView.tsx:218-245`).
2. O usuário clica em "Abrir Conversa".
3. A tela dispara evento `open-maestro` com `agentRole` (`DashboardView.tsx:245`).
4. `EvisChat` escuta o evento, abre o painel e seleciona `ag-sentinela` (`EvisChat.tsx:198-211`).
5. O usuário vê a conversa simulada, evidências, severidade e botões de ação.
6. Ao clicar em uma ação, `handleAction` mostra toast e muda o status para `simulada` (`EvisChat.tsx:222-224`).

Implementado de fato:
- UI de alerta, severidade, chat, toast e mudança de estado local.
- Abrir o Maestro via evento browser.

Não implementado de fato:
- Fila de notificação persistente.
- Persistência do alerta em Firestore.
- Regras de criticidade automatizadas.
- Envio de push/e-mail/WhatsApp real.
- Maestro como serviço backend/orquestrador.
- Encaminhamento real do contexto crítico para outro agente.

Conclusão:
- O fluxo agente -> mensagem -> Maestro -> usuário é visual e local. Ele funciona como UX demonstrável, mas não como escalada operacional persistente.

## 4. CONTEXTO GLOBAL vs CONTEXTO DE OBRA

### Agentes em contexto global

- EVA Executiva: mensagens globais em `EvisChat` (`scope: "Global"`) e card no Dashboard.
- Sentinela: risco de portfólio/global em `EvisChat` e Dashboard; no Workspace também assume contexto da obra ativa.
- Vera Financeira: alerta de caixa consolidado em `EvisChat` (`scope: "Global"`) e drawer financeiro por obra no Workspace.
- Lia Comercial: contexto de funil/CRM em `OportunidadesView` e `/api/ai/assistente`.
- Maestro Operacional: hub global de mensagens; decide a thread pelo papel do agente.
- WhatsApp Analyzer: endpoint recebe `contextObras` e pode classificar mensagens em ações globais ou de obra.

### Agentes em contexto de obra específica

- Nina Compras: no `EvisChat`, mensagens de obra usam `obraId` e `obraName` derivados de `activeProj` (`EvisChat.tsx:109-124`). No Workspace opera sobre `project = getActiveProject()` (`WorkspaceView.tsx:35-36`).
- Dora Documentos: mesma lógica de obra ativa em `EvisChat` e Workspace.
- Diário de Obra IA: mensagem `scope: "Obra"` com `obraId`; drawer de RDO usa `project.name`, `project.manager`, `project.location`.
- Agenda Inteligente/Cronos: mensagem `scope: "Obra"`; drawer usa conflito fixo de Kairós, mas tela é Workspace de obra ativa.
- Otto Orçamentista: contexto de pré-obra/oportunidade específica via prop `oportunidade` em `OportunidadeDetail`.

### Como cada tela decide o contexto

- `EvisChat`: usa `activeProj = getActiveProject()` e cria mensagens de obra somente quando há projeto ativo (`EvisChat.tsx:37-38`, `106-190`). A lista filtra mensagens de obra por `m.obraId === activeProj?.id`, mas mantém mensagens globais sempre (`EvisChat.tsx:285-309`). O cabeçalho visual diz "Visão Global / Portfólio" quando `activeRoute` é `dashboard` ou `oportunidades`, mas o filtro real ainda inclui mensagens da obra ativa além das globais.
- `WorkspaceView`: usa `project = getActiveProject()` e `project.id` para tasks e conteúdo (`WorkspaceView.tsx:35-36`, `100-114`, `161`). É contexto de obra ativa.
- `DashboardView`: usa arrays globais (`obras`, `oportunidades`, `lancamentos`, `tasks`) e mostra portfólio; não fixa uma obra, exceto filtros visuais de marcos.
- `OportunidadesView`: usa `oportunidades` do contexto e uma oportunidade selecionada para abrir detalhe. É contexto de CRM/funil.
- `OportunidadeDetail`: usa a prop `oportunidade`; Otto e ações de Meet/Gmail/Drive são de pré-obra/oportunidade.
- `server.ts`: `/api/ai/assistente` trabalha com dados hard-coded de portfólio e pode retornar `idRefurbish` para redirecionamento. `/api/ai/orcamentista` e `/api/ai/diario` exigem `idRefurbish`.

Gap de contexto:
- Não há objeto de contexto único e persistente compartilhado entre agentes. Cada tela monta seu próprio contexto local/hard-coded.

## 5. FLUXO DE HITL COMPLETO

### Exemplo real mais completo: extração de lead com Lia/IA em Oportunidades

1. Agente gera recomendação/extração:
   - Usuário abre "Nova Proposta", escolhe modo IA, insere texto/imagem e clica em "Mapear com Inteligência Artificial".
   - O frontend chama `POST /api/ai/extract-lead` com `text`, `imageBase64` e `mimeType` (`OportunidadesView.tsx:872-879`).
   - O servidor retorna `data`, `confidence`, `provider` e `sourceDetails` (`server.ts:199-364`). Sem chave Gemini, retorna payload simulado completo (`server.ts:204-255`).

2. Usuário vê a recomendação:
   - O resultado entra em `setExtractedLead(data)` e o toast instrui "Verifique a revisão HITL" (`OportunidadesView.tsx:881-884`).
   - A UI exibe "Mapeador de Lead (HITL)" com campos e percentuais de confiança (`OportunidadesView.tsx:910-937`).

3. Usuário aprova/rejeita:
   - O botão "Aplicar e Revisar Manualmente" copia campos extraídos para o formulário manual (`setTitle`, `setClient`, `setValue`) e muda `setAddMethod("manual")` (`OportunidadesView.tsx:944-954`).
   - Rejeição explícita não existe; o usuário pode cancelar o modal ou não aplicar.

4. Após aprovação, o sistema faz de fato:
   - O usuário submete o formulário manual em "Sincronizar CRM".
   - `handleSubmit` chama `addOportunidade(title, client, valFloat, stage)` e ajusta `probability` no estado local (`OportunidadesView.tsx:53-72`).
   - No `AppContext`, `addOportunidade` cria um novo item e chama `setOportunidades` (`AppContext.tsx:242-253`).
   - Não há Firestore, API de persistência ou commit externo. O efeito real é inserir no estado React da sessão.

### Outros HITLs observados

- RDO: usuário gera rascunho, marca checkbox `human-confirm-checkbox` e clica "Publicar RDO Simulado". O sistema só mostra toast e fecha drawer (`WorkspaceView.tsx:1011-1035`). Não salva RDO real.
- Cotação Nina: usuário seleciona fornecedor, marca `human-confirm-cotacao` e clica "Enviar Para Aprovação Comercial". O sistema seta `cotacaoFinalizada = true` e mostra toast (`WorkspaceView.tsx:1700-1722`). Não cria pedido real.
- Agenda: usuário marca `human-confirm-reagendar` e confirma. O sistema seta `vistoriaReagendada = true` e mostra toast (`WorkspaceView.tsx:1927-1945`). Não chama Google Calendar.
- Vera: consentimento de compensação seta `financeiroOtimizado = true` e mostra toast (`WorkspaceView.tsx:1543-1551`).
- OportunidadeDetail: "Virar Obra" move a oportunidade para `obras` no estado local e remove de `oportunidades` (`OportunidadeDetail.tsx:174-209`). Ele tenta criar pasta no Google Drive se houver token (`OportunidadeDetail.tsx:178-180`), mas o toast diz ambiente simulado.

Gap relevante:
- Otto em `OportunidadeDetail` chama `fetch("/api/ai/chat")` (`OportunidadeDetail.tsx:37`), mas `server.ts` expõe `/api/chat` e `/api/ai/orcamentista`, não `/api/ai/chat`. Portanto o chat do Otto parece apontar para rota inexistente no servidor auditado.

## 6. DADOS QUE OS AGENTES PRECISAM DO FIRESTORE

Observação: os arquivos auditados não implementam Firestore para agentes. A tabela abaixo mapeia o necessário para tornar cada agente operacional, usando os nomes de estado/modelo existentes (`obras`, `oportunidades`, `tasks`, `lancamentos`, `documentos`, `rdoList`, `medicoesList`, `orcamentoInsumos`) e coleções operacionais inferidas.

| Agente | Lê de | Escreve em |
| --- | --- | --- |
| Maestro Operacional | `companies/{companyId}`, `users`, `obras`, `oportunidades`, `tasks`, `agent_messages`, `agent_events`, `approvals` | `agent_messages`, `agent_threads`, `agent_handoffs`, `notifications`, `approvals`, `audit_logs` |
| EVA Executiva | `obras`, `tasks`, `lancamentos`, `oportunidades`, `risk_events`, `agent_handoffs`, `approvals` | `executive_summaries`, `decision_queue`, `agent_messages`, `agent_handoffs`, `notifications` |
| Sentinela de Riscos | `obras`, `tasks`, `milestones/cronograma`, `lancamentos`, `purchase_orders`, `cotacoes`, `rdoList`, `whatsapp_messages`, `orcamentoInsumos` | `risk_events`, `mitigation_plans`, `agent_messages`, `agent_handoffs`, `tasks`, `audit_logs` |
| Vera Financeira | `lancamentos`, `bankAccounts`, `contas_pagar`, `contas_receber`, `obras`, `purchase_orders`, `medicoesList`, `orcamentoInsumos` | `financial_alerts`, `payment_reminders`, `cashflow_scenarios`, `approval_requests`, `agent_messages` |
| Nina Compras | `obras`, `insumos`, `orcamentoInsumos`, `fornecedores`, `cotacoes`, `purchase_orders`, `risk_events`, `tasks` | `solicitacoes_cotacao`, `cotacoes`, `purchase_orders`, `supplier_messages`, `approval_requests`, `agent_handoffs` |
| Dora Documentos | `obras/{id}/documentos`, `drive_files`, `ocr_results`, `clientes`, `contratos`, `notas_fiscais`, `rdoList` | `document_classifications`, `sensitive_flags`, `ocr_reviews`, `document_audit_logs`, `agent_messages` |
| Diário de Obra IA | `obras`, `tasks`, `rdoList`, `equipe`, `documentos/anexos`, `whatsapp_messages`, `weather_snapshots`, `risk_events` | `rdo_drafts`, `rdoList`, `field_events`, `task_suggestions`, `material_consumption`, `approval_requests` |
| Agenda Inteligente / Cronos | `obras`, `tasks`, `milestones`, `calendar_events`, `equipe`, `risk_events`, `medicoesList` | `schedule_conflicts`, `calendar_change_requests`, `calendar_events`, `agent_messages`, `tasks`, `audit_logs` |
| Lia Comercial | `oportunidades`, `clientes`, `contacts`, `lead_sources`, `whatsapp_messages`, `emails`, `propostas` | `lead_extractions`, `oportunidades`, `crm_notes`, `tasks`, `agent_messages`, `approval_requests` |
| Otto Orçamentista | `oportunidades`, `obras/pre_obras`, `orcamentoInsumos`, `documentos`, `sinapi_items`, `cotacoes`, `historico_orcamentos` | `orcamento_drafts`, `orcamentoInsumos`, `budget_questions`, `approval_requests`, `agent_messages` |
| WhatsApp Analyzer / Lia Omnichannel | `whatsapp_messages`, `contacts`, `obras`, `oportunidades`, `tasks`, `fornecedores` | `whatsapp_classifications`, `tasks`, `crm_notes`, `agent_messages`, `suggested_replies`, `audit_logs` |

## 7. SEQUÊNCIA DE ATIVAÇÃO NATURAL

Sequência lógica seguindo lead -> obra -> entrega:

1. Lia Comercial identifica/qualifica lead no funil.
   - Em `OportunidadesView`, Lia sugere briefing e contato em até 24h.
   - No fluxo IA, `/api/ai/extract-lead` estrutura dados do lead.

2. Humano revisa o lead (HITL) e salva a oportunidade.
   - O usuário revisa campos extraídos, aplica no formulário manual e cria a oportunidade.

3. Otto Orçamentista entra na pré-obra.
   - Em `OportunidadeDetail`, Otto analisa escopo, lacunas e itens de baixa confiança.
   - Idealmente deveria chamar `/api/ai/orcamentista`; hoje o componente chama `/api/ai/chat`, rota não encontrada no servidor auditado.

4. Lia/Otto apoiam comunicação comercial.
   - `OportunidadeDetail` permite Gmail e Google Meet, com modais e autenticação Google.

5. Humano converte oportunidade em obra.
   - `handleVirarObra` cria `novaObra`, adiciona a `obras` e remove a oportunidade do estado local.

6. EVA Executiva assume visão de portfólio/obra.
   - Resume decisões do dia, margens, pendências e direciona para agentes especialistas.

7. Dora Documentos classifica documentação inicial.
   - Alvarás, contratos, notas e documentos sensíveis entram em triagem/OCR com aprovação humana.

8. Agenda Inteligente/Cronos organiza marcos, vistorias e conflitos.
   - Detecta conflitos de calendário e sugere reagendamento mediante confirmação.

9. Nina Compras prepara suprimentos críticos.
   - Gera comparação de fornecedores, solicitação de cotação e aprovação comercial simulada.

10. Diário de Obra IA registra operação diária.
   - Recebe relato, clima, equipe, anexos, gera rascunho de RDO e pede validação técnica.

11. Sentinela monitora desvios transversais.
   - Cruza indícios de WhatsApp, compras e cronograma para risco de atraso, custo e margem.

12. Vera Financeira avalia caixa, vencimentos e impacto das compras.
   - Consolida vencimentos, DRE, pagamentos e compensações/aditivos.

13. EVA/Maestro escalam decisões críticas ao usuário.
   - Visualmente, isso acontece via cards, drawers e `EvisChat`.
   - Operacionalmente, ainda falta fila persistente de decisões, notificações e handoffs com payload.

14. Encerramento/entrega.
   - Dora fecha documentação, Diário consolida histórico/RDOs, Vera fecha financeiro, Sentinela confirma riscos mitigados, EVA apresenta resumo executivo.

## Rotas `/api/ai/*` e encadeamento

Rotas encontradas em `server.ts`:
- `POST /api/ai/assistente`: LIA/Maestro global. Responde perguntas de portfólio e pode retornar `type` como `redirect_diario` ou `redirect_orcamentista` com `idRefurbish` (`server.ts:103-196`).
- `POST /api/ai/extract-lead`: extração estruturada de lead/oportunidade com confiança por campo (`server.ts:199-364`).
- `POST /api/ai/orcamentista`: orçamentista por obra, exige `idRefurbish` e `historico` (`server.ts:367-452`).
- `POST /api/ai/diario`: motor semântico de RDO, exige `idRefurbish` e `transcricao`, retorna eventos, entidades, impactos e `necessitaValidacaoHumana` (`server.ts:455-543`).
- `POST /api/ai/whatsapp/analyze`: classifica mensagem de WhatsApp e retorna `systemAction` (`CREATE_TASK`, `UPDATE_CRM_STAGE`, `LOG_NOTE`, `REPLY_ONLY`) (`server.ts:701-776`).

Rotas relacionadas fora de `/api/ai/*`:
- `POST /api/chat`: assistente EVIS genérico (`server.ts:53-100`).
- `POST /api/whatsapp/cron-analyze`: analisa mensagens em memória e retorna `lembretes`, `materiais`, `decisoes` (`server.ts:620-663`).
- `POST /api/whatsapp/send` e `POST /api/webhook/zappfy`: envio/webhook WhatsApp, mas sem integração de agentes nos arquivos auditados.

Encadeamento real observado:
- Não há rota chamando outra rota.
- O frontend chama `/api/ai/extract-lead` em Oportunidades.
- `WorkspaceView` chama `/api/whatsapp/cron-analyze` e cria tasks locais a partir de `lembretes` e `materiais`.
- `OportunidadeDetail` tenta chamar `/api/ai/chat`, que não existe no servidor auditado.
- `/api/ai/assistente`, `/api/ai/orcamentista`, `/api/ai/diario` e `/api/ai/whatsapp/analyze` existem, mas não foram vistos sendo consumidos pelos componentes auditados, exceto `extract-lead`.

## Gaps principais

1. Handoff sem payload: os agentes trocam de drawer e mostram toast, mas não passam contexto estruturado.
2. Maestro visual, não orquestrador: não existe serviço central persistente de roteamento de agentes.
3. Escalada sem persistência: criticidade aparece na UI, mas não vira notificação/decisão em banco.
4. HITL majoritariamente simulado: aprovações setam estados locais e toasts.
5. Firestore ausente nos fluxos auditados: dados vivem em estado React inicial/local.
6. Rota do Otto divergente: componente chama `/api/ai/chat`; servidor oferece `/api/chat` e `/api/ai/orcamentista`.
7. Contexto global/obra inconsistente no chat: o cabeçalho muda por rota, mas a lista mantém globais + mensagens da obra ativa.
8. Agentes citados por textos estáticos: Sentinela/Nina/Cronos aparecem em evidências e recomendações sem integração real.
