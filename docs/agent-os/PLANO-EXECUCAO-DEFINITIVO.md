# Plano de Execução Definitivo — EVIS AiStudio SaaS

Criado em: 2026-06-09
Fonte: 8 blocos de auditoria UI + auditoria de agentes + comparativo apps/saas
Status: APROVADO pelo Arquiteto

---

## Decisão Estratégica (ADR-007)

AiStudio e o produto principal definitivo.
apps/saas e referencia de dominio — congelado.
Stack: React 19 + Vite + Firebase + Gemini + Express.

---

## Estado Real do Produto (pos-auditoria)

### Dados
Todos os modulos ainda usam INITIAL_* (estado React in-memory).
Firestore existe apenas para empresa e auth (onboarding).
Zero persistencia transacional.

### Agentes IA
- 3 com rota Gemini real: Lia (/api/ai/assistente), Otto (/api/ai/orcamentista), Diario IA (/api/ai/diario)
- 7 visuais/hardcoded: EVA, Sentinela, Cronos, Nina, Vera, Dora, Agenda
- 3 config-only/vazios: Radar, Auditor, Automador
- Maestro: UI funciona, zero Gemini, respostas sao setTimeout
- Bug critico: OportunidadeDetail chama /api/ai/chat (nao existe) em vez de /api/ai/orcamentista

### Integrações Google (ja reais, nao mock)
- Google Meet: criacao real via Calendar API
- Gmail: envio real
- Calendar: leitura real de eventos
- Drive: leitura real de arquivos
- Google Sheets: exportacao real
- Obs: todos mostram toast "simulado" — corrigir mensagem

---

## Sprint 2 — Fundação de Dados

Objetivo: nenhum dado importante reseta ao recarregar.
Bloqueante para tudo. Sem isso, produto nao e utilizavel.

### Tarefas (ordem de execucao)

1. P0 — Corrigir rota Otto
   Arquivo: src/components/modules/OportunidadeDetail.tsx
   Trocar fetch("/api/ai/chat") por fetch("/api/ai/orcamentista")
   Ajustar payload: { idRefurbish, historico } em vez de { message, context }

2. P0 — Clientes CRUD no Firestore
   Arquivos: src/components/modules/AdminView.tsx + src/services/customerService.ts (novo)
   Collection: companies/{companyId}/customers/{customerId}
   Campos: nome, email, telefone, personType, doc, endereco, isActive, deletedAt
   CRUD: listar, criar, editar, arquivar (soft delete)

3. P0 — Oportunidades no Firestore
   Arquivos: src/context/AppContext.tsx + src/services/oportunidadeService.ts (novo)
   Collection: companies/{companyId}/oportunidades/{id}
   Substituir INITIAL_OPORTUNIDADES por reads/writes Firestore
   Campos: title, clientId (ref customers), value, stage, probability, owner, deletedAt

4. P0 — Obras no Firestore
   Arquivos: src/context/AppContext.tsx + src/services/obraService.ts (novo)
   Collection: companies/{companyId}/obras/{id}
   Substituir INITIAL_OBRAS por reads/writes Firestore
   Campos completos do apps/saas: endereco, m2, tipo, status, datas, manager, equipe

5. P0 — Virar Obra com vinculo correto
   Arquivo: src/components/modules/OportunidadeDetail.tsx
   Ao converter: criar Obra no Firestore com oportunidadeId
   Atualizar Oportunidade com obraId
   Orçamento da oportunidade migra para a obra

6. P1 — Corrigir toasts enganosos Google
   Arquivo: OportunidadeDetail.tsx, WorkspaceView.tsx
   Google Meet, Gmail, Drive ja sao reais — remover "ambiente simulado" dessas acoes

7. P1 — Sidebar com usuario real
   Arquivo: src/components/layout/Sidebar.tsx
   Substituir "Engenheiro Berti" por currentUser.displayName e currentUser.email

8. P1 — Aplicar Firestore Security Rules
   Acao manual: Firebase Console -> Firestore -> Regras
   Colar conteudo de firestore.rules do repo

9. P2 — Tarefas CRUD + Firestore
   Collection: companies/{companyId}/tasks/{id}
   Criar/editar/excluir tarefa, mudar status persiste

10. P2 — Lancamentos financeiros no Firestore
    Collection: companies/{companyId}/payments/{id}
    Substituir INITIAL_LANCAMENTOS, INITIAL_ACCOUNTS

---

## Sprint 3 — Agentes Operacionais

Objetivo: os 3 agentes com rota real passam a operar com dados do Firestore.

1. Maestro: persistir AgentMessage no Firestore
   Collection: companies/{companyId}/agent_messages/{id}
   + companies/{companyId}/obras/{obraId}/agent_messages/{id}
   Mensagens sobrevivem ao reload

2. actionStr dispatcher real
   Mapeamento: acionar_nina -> setActiveDrawer("cotacao"), gerar_rdo -> addRdo(), etc.
   Aprovar RDO chama funcao real, nao so toast

3. Diario IA 100% operacional
   Ja tem rota, ja tem HITL, ja tem chamada correta em ObrasView
   Falta: persistir RDO no Firestore + tarefas sugeridas + aprovacao auditada

4. Otto operacional
   Conectar OportunidadeDetail ao /api/ai/orcamentista
   Persistir itens de orcamento em companies/{companyId}/oportunidades/{id}/orcamento/

5. Lia operacional
   Conectar card de oportunidade ao /api/ai/assistente
   addOportunidade escreve no Firestore
   HITL real para systemAction (CREATE_TASK, UPDATE_CRM_STAGE)

6. Function calling: Lia cria oportunidade, Diario cria tarefa
   Usar @google/genai tools para acoes estruturadas

7. Memoria de conversa por agente
   Collection: companies/{companyId}/agent_threads/{agentId}/messages/
   Contexto persiste entre sessoes

8. SINAPI como collection Firestore
   Importar base SINAPI (16k+ itens) como companies/global/sinapi/
   Otto consulta para estimativas — sem RAG ainda

---

## Sprint 4 — Inteligência e Orquestração

Objetivo: Firebase Genkit + RAG + agentes visuais tornam-se operacionais.

1. Firebase Genkit como orquestrador de agentes
2. RAG para SINAPI: text-embedding-004 + Firestore Vector Search
3. Prompt templates por agente no Firestore (editaveis por empresa)
4. Streaming nas respostas longas (generateContentStream)
5. Nina operacional: cotacao real + fornecedores do Firestore
6. Vera operacional: DRE e Fluxo calculados de dados reais
7. Sentinela operacional: regras de risco sobre dados reais
8. Audit trail: toda decisao IA registrada (quem aprovou, quando, payload)
9. Contexto compartilhado entre agentes (handoff com payload estruturado)

---

## Sprint 5 — Produto Completo

1. Asaas: billing real, planos, limites por agente/obra/usuario
2. Multi-tenant: Security Rules completas por empresa
3. Equipe: convite, permissoes, roles
4. Deploy: Cloud Run (server.ts) + Firebase Hosting (frontend)
5. Onboarding completo: empresa -> usuario -> cliente -> obra
6. Push notifications para mensagens de agentes

---

## Sequencia Natural dos Agentes

Lead chega
  -> Lia extrai e qualifica (CRM)
     -> Otto analisa escopo e orcamento (pre-obra)
        -> Humano aprova -> Virar Obra
           -> Dora classifica documentacao inicial
           -> Agenda organiza cronograma e vistorias
              -> Diario registra campo diariamente (RDO)
              -> Nina gerencia suprimentos criticos
                 -> Sentinela cruza desvios de custo/prazo
                 -> Vera analisa impacto financeiro
                    -> EVA consolida e escala decisoes ao gestor
                       -> Maestro entrega ao humano certo, no contexto certo

---

## Decisoes Arquiteturais dos Agentes

- Maestro nao e um servidor — e um hub de mensagens UI + Firestore real-time
- Agentes nao chamam uns aos outros diretamente — escrevem em agent_messages e o Maestro distribui
- actionStr e o contrato de dominio: cada string mapeia para uma funcao real do AppContext
- requiresHumanApproval = true significa que nenhuma funcao e chamada sem checkbox confirmado
- Toda acao de agente gera entrada em audit_logs antes de executar
- Gemini nao decide — recomenda. Humano confirma. Sistema executa.

---

## Riscos Ativos

| Risco | Nivel | Mitigacao |
|---|---|---|
| Otto chama rota errada — funcionalidade central quebrada | P0 | Fix imediato no Sprint 2 item 1 |
| Dados todos in-memory — produto nao utilizavel em producao | P0 | Sprint 2 completa |
| Maestro sem persistencia — historico de decisoes perdido | P1 | Sprint 3 item 1 |
| GEMINI_API_KEY exposta no chat da sessao | P1 | Rotacionar em aistudio.google.com/apikey |
| Firestore em modo teste — sem Security Rules | P1 | Sprint 2 item 8 |
| Google Workspace mostra "simulado" em acoes reais — confunde usuario | P2 | Sprint 2 item 6 |

---

## Fontes desta Decisao

- AUDIT-DASHBOARD-SIDEBAR-2026-06-09.md
- AUDIT-OPORTUNIDADES-ORCAMENTO-2026-06-09.md
- AUDIT-OBRAS-WORKSPACE-2026-06-09.md
- AUDIT-FINANCEIRO-2026-06-09.md
- AUDIT-COMPRAS-TAREFAS-CADASTROS-2026-06-09.md
- AUDIT-MAESTRO-EVISCHAT-2026-06-09.md
- AUDIT-AGENTES-CONTRATOS-2026-06-09.md
- AUDIT-FLUXOS-AGENTES-2026-06-09.md
- docs/agent-os/adrs/ADR-007-aistudio-saas-ai-native.md
- docs/agent-os/workspaces/aistudio/INVENTORY-APPSAAS.md
