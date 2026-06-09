# Auditoria de Agentes e Contratos - AI Studio

Data: 2026-06-09
Projeto auditado: C:\Users\User\Evis-AiStudio
Escopo: leitura dos arquivos solicitados, sem alteracao de codigo e sem commit.

## Arquivos lidos

- `src/utils/agentesConfig.ts`
- `server.ts`
- `src/components/assistente/EvisChat.tsx`
- `src/components/modules/OportunidadeDetail.tsx`
- `src/components/modules/ObrasView.tsx`
- `src/components/modules/WorkspaceView.tsx`
- `src/components/modules/DashboardView.tsx`
- `src/lib/whatsapp/agent-pipeline.ts`

## Observacao geral

O projeto possui 13 perfis declarados em `AGENT_PROFILES`. Na pratica, a maior parte dos agentes aparece como UX simulada/hardcoded, com drawers, cards, toasts e mensagens predefinidas. As rotas reais de IA no `server.ts` cobrem principalmente Lia, Otto e Diario IA, alem de uma extracao de lead sem agente do `agentesConfig` claramente amarrado. Quando `GEMINI_API_KEY` nao existe, as rotas retornam payloads simulados.

## Matriz por agente

| Agente | Campo | Detalhe |
|---|---|---|
| EVA | Nome e papel | EVA - EVA Executiva. Mestra de aprovacoes e resumo executivo. |
| EVA | Telas onde aparece | `EvisChat.tsx` mensagens globais; `WorkspaceView.tsx` card de agentes atentos e drawer `decisoes`; `DashboardView.tsx` mensagem recebida no dashboard. |
| EVA | Trigger | Mensagem inicial hardcoded no chat; clique em `openMaestro("EVA")`; abertura do drawer de decisoes no workspace. |
| EVA | Rota server.ts | Nao existe `/api/ai/eva`. Pode usar somente rotas genericas se alguem integrar no futuro, mas nao ha contrato especifico. |
| EVA | Input necessario | Para ser real precisaria portfolio, obras, tarefas, compras, documentos, agenda, riscos e decisoes pendentes. Hoje usa dados fixos do componente. |
| EVA | Output atual | Cards/mensagens hardcoded, handoffs para Nina, Diario IA, Dora e Agenda, e toasts simulados. Nao chama Gemini. |
| EVA | requiresHumanApproval | No campo formal do `EvisChat`, a mensagem inicial esta como `false`. No workspace ha decisoes aguardando homologacao, mas sem flag formal por agente. |
| EVA | Status real | SIMULADO. |
| EVA | O que falta para ser real | Criar endpoint agregador de briefing executivo, modelo de decisoes, fontes reais e fluxo de aprovacao persistido. |
| Sentinela | Nome e papel | Sentinela - Sentinela de Riscos. Compliance, riscos criticos e auditoria cruzada. |
| Sentinela | Telas onde aparece | `EvisChat.tsx`; `WorkspaceView.tsx` card de agente e drawer `evidencias`; `DashboardView.tsx` alerta critico. |
| Sentinela | Trigger | Mensagem inicial hardcoded; clique em abrir Maestro/Sentinela; plano de mitigacao no drawer. |
| Sentinela | Rota server.ts | Nao existe `/api/ai/sentinela`. |
| Sentinela | Input necessario | Compras, cronograma, WhatsApp, SINAPI/orcamento, estoque, evidencias e regras de risco/compliance. |
| Sentinela | Output atual | Alerta hardcoded de risco de Aco CA-50, cadeia de evidencias simulada, checklist de mitigacao e handoffs para Nina/Agenda. |
| Sentinela | requiresHumanApproval | Sim no `EvisChat` para acionar Nina ou simular mitigacao. No workspace exige checklist marcado antes de criar mitigacao simulada. |
| Sentinela | Status real | SIMULADO. |
| Sentinela | O que falta para ser real | Motor de risco com regras, consultas reais aos modulos e endpoint proprio para produzir evidencias e severidade. |
| Lia | Nome e papel | Lia - Lia Comercial. CRM, follow-up com clientes e negociacoes. |
| Lia | Telas onde aparece | `OportunidadeDetail.tsx` card Lia Comercial; `server.ts` rotas de assistente/WhatsApp; `agent-pipeline.ts` pipeline WhatsApp. Nao aparece no `EvisChat` inicial. |
| Lia | Trigger | No detalhe da oportunidade, card visual de lead quente. No back-end, POST em `/api/ai/assistente` ou `/api/ai/whatsapp/analyze`; no pipeline, chegada de mensagem WhatsApp. |
| Lia | Rota server.ts | Sim: `/api/ai/assistente` e `/api/ai/whatsapp/analyze`. Tambem existe `/api/whatsapp/cron-analyze`, embora nao seja `/api/ai/*`. |
| Lia | Input necessario | Mensagens do chat, contexto de obras/tarefas/pagamentos/clientes; no WhatsApp: contactId, nome, texto e contexto de obras; no pipeline: telefone, texto e contexto do cliente. |
| Lia | Output atual | Com Gemini: JSON com `reply`, `type`, possivel `idRefurbish`; no WhatsApp: `intent`, `systemAction`, `extractedData`, `suggestedReply`, `confidence`. Sem chave, retorna simulacao. No card de oportunidade, output e hardcoded/alert. |
| Lia | requiresHumanApproval | Nao ha flag formal nas rotas. O card comercial diz que o humano confirma antes; o pipeline descreve execucao automatica, mas `executeAiAction` e stub com `console.log`. |
| Lia | Status real | PARCIAL. |
| Lia | O que falta para ser real | Conectar telas ao endpoint, adicionar HITL para `systemAction`, persistir CRM/tarefas/notas e unificar pipeline com `server.ts`. |
| Otto | Nome e papel | Otto - Otto Orcamentista. BIM 5D, orcamentos e memorias de calculo. |
| Otto | Telas onde aparece | `OportunidadeDetail.tsx` aba Orcamento e slide-over Otto; `server.ts` rota de orcamentista. |
| Otto | Trigger | Clique em Ativar Simulador de Custos/Orcar com IA; envio de pergunta no chat lateral. |
| Otto | Rota server.ts | Sim: `/api/ai/orcamentista`. Porem `OportunidadeDetail.tsx` chama `/api/ai/chat`, que nao existe no `server.ts`; portanto a tela esta desencaixada do contrato real. |
| Otto | Input necessario | `idRefurbish`, nome, cidade, estado e `historico` array. A tela atual envia `message` e `context`, incompatíveis com a rota real. |
| Otto | Output atual | Back-end real retorna JSON com `reply` e possiveis `itens`. Tela atual tende a erro por endpoint inexistente ou depende de uma rota nao auditada. Existem textos hardcoded de baixa confianca e revisao humana. |
| Otto | requiresHumanApproval | Sim conceitual: prompt do servidor exige confirmacao a cada etapa; UI afirma que itens de baixa confianca e orcamento final exigem revisao/aprovacao. Nao ha `requiresHumanApproval` formal. |
| Otto | Status real | PARCIAL. |
| Otto | O que falta para ser real | Corrigir endpoint e payload da tela para `/api/ai/orcamentista`, persistir itens aplicados e ligar bases SINAPI/BIM/orcamento. |
| Cronos | Nome e papel | Cronos - Cronos Planejador. BIM 4D, cronogramas e alertas de atrasos. |
| Cronos | Telas onde aparece | `ObrasView.tsx` aba Cronograma; citado em `WorkspaceView.tsx` como Modulo Cronos Agenda dentro da evidencia do Sentinela. |
| Cronos | Trigger | Abrir subaba `cronograma`; clicar Simular Replanejamento ou Ver Caminho Critico. |
| Cronos | Rota server.ts | Nao existe `/api/ai/cronos`. |
| Cronos | Input necessario | Cronograma Gantt, frentes, dependencias, caminho critico, marcos, clima, equipe e eventos de campo. |
| Cronos | Output atual | Card hardcoded de atraso de 12 dias e alerts/toasts de ambiente simulado. |
| Cronos | requiresHumanApproval | Nao formal. A UI indica simulacao sem alterar cronograma oficial. |
| Cronos | Status real | SIMULADO. |
| Cronos | O que falta para ser real | Modelo de cronograma, calculo de caminho critico, endpoint de simulacao e gravacao com aprovacao. |
| Diario IA | Nome e papel | Diario IA - Diario de Obra IA. Geracao de RDOs a partir de audios e imagens. |
| Diario IA | Telas onde aparece | `EvisChat.tsx`; `ObrasView.tsx` aba RDO com chamada real; `WorkspaceView.tsx` card Diario de Obra IA e drawer `rdo`; server route `/api/ai/diario`. |
| Diario IA | Trigger | No ObrasView: usuario cola transcricao e clica Gerar Diario de Obra com IA; no Workspace: abre Maestro/Registrar RDO e gera rascunho simulado; no EvisChat: mensagem inicial quando ha obra ativa. |
| Diario IA | Rota server.ts | Sim: `/api/ai/diario`. |
| Diario IA | Input necessario | `idRefurbish`, `transcricao` e opcional `dataReferencia`; no workspace tambem clima, efetivo, ocorrencias, anexos e relato. |
| Diario IA | Output atual | Na rota: JSON estruturado com tipo, eventos, entidades, dominios, impactos, acoes sugeridas, validacao humana, confianca e resumo. No ObrasView preenche campos do RDO. No Workspace gera rascunho e publicacao simulada. |
| Diario IA | requiresHumanApproval | Sim. `EvisChat` marca `true`; a rota retorna `necessitaValidacaoHumana`; Workspace exige checkbox para publicar RDO simulado. |
| Diario IA | Status real | PARCIAL. |
| Diario IA | O que falta para ser real | Persistir RDO, tarefas sugeridas, anexos e auditoria de aprovacao; integrar transcricao/audio e imagens reais. |
| Nina | Nome e papel | Nina - Nina Compras. Cotacoes ativas, mapas comparativos e fornecedores. |
| Nina | Telas onde aparece | `EvisChat.tsx`; `WorkspaceView.tsx` card de agente e drawer `cotacao`; referenciada por EVA/Sentinela/Diario/Vera. |
| Nina | Trigger | Obra ativa no chat; abrir agente no Maestro; handoff de EVA/Sentinela; selecionar fornecedor/gerar solicitacao no drawer. |
| Nina | Rota server.ts | Nao existe `/api/ai/nina`. |
| Nina | Input necessario | Insumos criticos, fornecedores, prazos, precos, risco, compras pendentes, estoque e regras de aprovacao. |
| Nina | Output atual | Mapa de fornecedores hardcoded, comparativo visual, negociacao premium bloqueada e solicitacao/aprovacao simulada por toast. |
| Nina | requiresHumanApproval | Sim no `EvisChat` para preparar cotacao/comparar fornecedores; no Workspace exige selecionar fornecedor e checkbox para enviar para aprovacao comercial. |
| Nina | Status real | SIMULADO. |
| Nina | O que falta para ser real | Endpoint de cotacao, base de fornecedores, criacao real de solicitacao/ordem, logs de negociacao e aprovacao. |
| Radar | Nome e papel | Radar - Radar de Insumos. Lead time, curva ABC e tendencias de custo. |
| Radar | Telas onde aparece | Apenas `agentesConfig.ts` nos arquivos auditados. Nao aparece em `EvisChat`, `WorkspaceView`, `DashboardView`, `ObrasView`, `OportunidadeDetail` ou pipeline. |
| Radar | Trigger | Nenhum trigger encontrado. |
| Radar | Rota server.ts | Nao existe `/api/ai/radar`. |
| Radar | Input necessario | Catalogo de insumos, consumo historico, fornecedores, lead times, curva ABC e tendencias de preco. |
| Radar | Output atual | Nenhum output encontrado. |
| Radar | requiresHumanApproval | Nao aplicavel; nao ha fluxo. |
| Radar | Status real | VAZIO. |
| Radar | O que falta para ser real | Tela/trigger, endpoint, fontes de dados de insumos e modelo de alertas. |
| Vera | Nome e papel | Vera - Vera Financeira. Otimizacao de fluxo de caixa, pagamentos e recebimentos. |
| Vera | Telas onde aparece | `EvisChat.tsx`; `WorkspaceView.tsx` card e drawer `financeiro`; referencias financeiras no dashboard e obras, mas como dados, nao agente ativo. |
| Vera | Trigger | Mensagem inicial global no EvisChat; abrir Maestro/Vera; clique em consentir compensacao de aditivos no drawer. |
| Vera | Rota server.ts | Nao existe `/api/ai/vera`. |
| Vera | Input necessario | Lancamentos, contas a pagar/receber, medições, caixa, compras pendentes, impostos e limites de margem. |
| Vera | Output atual | Alerta hardcoded de vencimento, fluxo/DRE projetado hardcoded, lembretes locais e compensacao simulada por toast. |
| Vera | requiresHumanApproval | No `EvisChat` esta `false`; no Workspace ha botao de consentimento para compensacao, mas sem flag formal. |
| Vera | Status real | SIMULADO. |
| Vera | O que falta para ser real | Endpoint financeiro, consultas reais a lancamentos, simulador de caixa, gravacao de lembretes/acoes e aprovacao auditavel. |
| Auditor | Nome e papel | Auditor - Auditor de Margem. Protecao de margem de lucro e custo indireto. |
| Auditor | Telas onde aparece | Apenas `agentesConfig.ts` nos arquivos auditados. Nao ha tela ou drawer especifico. |
| Auditor | Trigger | Nenhum trigger encontrado. |
| Auditor | Rota server.ts | Nao existe `/api/ai/auditor`. |
| Auditor | Input necessario | Orcamentos, custos diretos/indiretos, BDI, margem prevista/real, contratos e aditivos. |
| Auditor | Output atual | Nenhum output encontrado. |
| Auditor | requiresHumanApproval | Nao aplicavel; nao ha fluxo. |
| Auditor | Status real | VAZIO. |
| Auditor | O que falta para ser real | Criar superficies de uso, endpoint de auditoria de margem e regras de comparacao orcado x realizado. |
| Dora | Nome e papel | Dora - Dora Documentos. Gestao documental, OCR e identificacao de LGPD. |
| Dora | Telas onde aparece | `EvisChat.tsx`; `WorkspaceView.tsx` card Arquivos da Obra e drawer `classificacao`; referenciada por EVA e no drawer de RDO ha texto incorreto `Dora IA processando fotos e relatos`. |
| Dora | Trigger | Obra ativa no EvisChat; abrir Maestro/Dora; clique para classificar documentos, marcar sensivel, revisar manualmente ou confirmar OCR. |
| Dora | Rota server.ts | Nao existe `/api/ai/dora`. |
| Dora | Input necessario | Arquivos do Drive, OCR/texto, metadados, vinculo com obra, classificacao documental e regras LGPD. |
| Dora | Output atual | Lista simulada de documentos, classificacao sugerida, confianca OCR, marcacao sensivel e confirmacao de metadados local. |
| Dora | requiresHumanApproval | Sim no `EvisChat`; no Workspace o humano confirma classificacao, sensibilidade ou metadado. |
| Dora | Status real | SIMULADO. |
| Dora | O que falta para ser real | OCR real, endpoint de classificacao, Drive/files persistidos, politicas LGPD e log de aprovacao. |
| Agenda | Nome e papel | Agenda - Agenda Inteligente. Resolucao de conflitos de cronograma e reunioes. |
| Agenda | Telas onde aparece | `EvisChat.tsx`; `WorkspaceView.tsx` card Proximas Reunioes e drawer `reagendar`; `OportunidadeDetail.tsx` tem Google Meet, mas nao como agente Agenda. |
| Agenda | Trigger | Obra ativa no EvisChat; abrir Maestro/Agenda; conflito detectado no workspace; checkbox e botao de confirmar reagendamento. |
| Agenda | Rota server.ts | Nao existe `/api/ai/agenda`. |
| Agenda | Input necessario | Google Calendar/eventos, responsaveis, marcos, restricoes de obra, clima e horarios disponiveis. |
| Agenda | Output atual | Conflito hardcoded, sugestao de novo horario, slots simulados e toast de reagendamento simulado. |
| Agenda | requiresHumanApproval | Sim no `EvisChat`; no Workspace exige checkbox antes de confirmar reagendamento simulado. |
| Agenda | Status real | SIMULADO. |
| Agenda | O que falta para ser real | Endpoint de resolucao, escrita real no Calendar com consentimento, deteccao de conflito e auditoria. |
| Automador | Nome e papel | Automador - Automador EVIS. Workflows automaticos e integracoes de sistema. |
| Automador | Telas onde aparece | Apenas `agentesConfig.ts` nos arquivos auditados. |
| Automador | Trigger | Nenhum trigger encontrado. |
| Automador | Rota server.ts | Nao existe `/api/ai/automador`. |
| Automador | Input necessario | Definicoes de workflow, eventos do sistema, permissoes, conectores e historico de execucao. |
| Automador | Output atual | Nenhum output encontrado. |
| Automador | requiresHumanApproval | Nao aplicavel; nao ha fluxo. |
| Automador | Status real | VAZIO. |
| Automador | O que falta para ser real | Criar motor de workflows, UI de automacoes, endpoints de execucao e controles HITL. |

## Rotas `/api/ai/*` encontradas em `server.ts`

- `POST /api/ai/assistente`: agente comentado como LIA/chat global; chama Gemini se houver chave; fallback simulado.
- `POST /api/ai/extract-lead`: extrator de oportunidade/lead; chama Gemini se houver chave; nao esta claramente ligado a um dos 13 perfis por nome, mas e do dominio CRM/Lia.
- `POST /api/ai/orcamentista`: agente Orcamentista/Otto; chama Gemini se houver chave; fallback simulado.
- `POST /api/ai/diario`: Diario de Obras IA/RDO; chama Gemini se houver chave; fallback simulado.
- `POST /api/ai/whatsapp/analyze`: LIA omnichannel WhatsApp; chama Gemini se houver chave; fallback simulado.

Rotas relacionadas, mas fora de `/api/ai/*`:

- `POST /api/chat`: assistente EVIS generico com Gemini.
- `POST /api/whatsapp/cron-analyze`: analise de mensagens WhatsApp recentes com Gemini.
- `POST /api/whatsapp/start`, `/status`, `/messages`, `/send`, `/api/webhook/zappfy`: infraestrutura WhatsApp/Zappfy, nao agentes nomeados por perfil.

## Agentes com rota real no `server.ts`

- Lia: `/api/ai/assistente`, `/api/ai/whatsapp/analyze`.
- Otto: `/api/ai/orcamentista`.
- Diario IA: `/api/ai/diario`.

Observacao: `/api/ai/extract-lead` e real e usa Gemini, mas nao ha agente correspondente claro em `agentesConfig.ts` por esse nome.

## Agentes que chamam Gemini de verdade

- Lia: nas rotas `/api/ai/assistente` e `/api/ai/whatsapp/analyze`; tambem em `src/lib/whatsapp/agent-pipeline.ts` com `gemini-2.5-flash`.
- Otto: no servidor via `/api/ai/orcamentista`, embora a tela `OportunidadeDetail.tsx` chame endpoint incorreto (`/api/ai/chat`).
- Diario IA: via `/api/ai/diario`, chamado corretamente em `ObrasView.tsx`.

Tambem chamam Gemini, mas nao sao um dos 13 agentes de forma limpa: `/api/chat`, `/api/ai/extract-lead` e `/api/whatsapp/cron-analyze`.

## Agentes 100% visuais/hardcoded

- EVA
- Sentinela
- Cronos
- Nina
- Vera
- Dora
- Agenda

Config-only/vazios nos arquivos auditados:

- Radar
- Auditor
- Automador

Parciais com back-end real, mas contrato incompleto ou UI ainda simulada:

- Lia
- Otto
- Diario IA

## Agentes com potencial de virar reais com menor esforco

1. Diario IA: ja tem endpoint, payload estruturado, chamada correta no `ObrasView` e HITL. Falta persistencia de RDO/tarefas/anexos.
2. Otto: ja tem endpoint e schema; falta corrigir a tela para chamar `/api/ai/orcamentista` com `idRefurbish` e `historico`.
3. Lia: ja tem rotas e pipeline; falta plugar o chat/cards, persistir acoes e colocar aprovacao humana para `systemAction`.
4. Nina: o drawer ja modela fornecedor, comparativo e aprovacao; falta endpoint e gravacao real de solicitacao/ordem.
5. Dora: a UX ja modela OCR/classificacao/revisao; falta OCR real e persistencia dos metadados.
6. Agenda: o drawer ja tem conflito, slots e confirmacao; falta leitura/escrita real no Google Calendar.
7. Vera: a UX ja tem fluxo de caixa, DRE e consentimento; falta conectar a dados financeiros reais.

## Gaps criticos de contrato

- `OportunidadeDetail.tsx` chama `/api/ai/chat`, mas `server.ts` nao declara essa rota. Para Otto, o contrato real e `/api/ai/orcamentista`.
- `EvisChat.tsx` nao chama nenhuma rota de IA; o envio de mensagem gera resposta por `setTimeout` com texto `(Simulacao Gemini)`.
- `requiresHumanApproval` existe formalmente so no modelo local de mensagens do `EvisChat`; nas rotas de servidor quase nao ha contrato de aprovacao, exceto `necessitaValidacaoHumana` do Diario IA.
- Muitos agentes aparecem por `openMaestro`/drawer, mas sem endpoint, sem persistencia e com microcopy de ambiente simulado.
- `agent-pipeline.ts` inicializa `GoogleGenAI` no import com `process.env.GEMINI_API_KEY`; se a chave estiver ausente, diferente do `server.ts`, nao ha fallback antes da instanciacao.
