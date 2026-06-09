# AUDIT - OPORTUNIDADES, OPORTUNIDADEDETAIL E ORCAMENTO - 2026-06-09

Auditoria somente leitura concluida. Nenhum arquivo foi alterado durante a auditoria.

Observacao: `apps/saas` nao existe neste checkout (`apps/saas = False`), entao a comparacao abaixo usa a lista de capacidades esperadas fornecida no prompt como referencia.

## 1. Listagem de Oportunidades

| Item | Estado no AiStudio | Conectado? |
|---|---|---|
| Fonte dos dados | `useApp()` le `oportunidades` do `AppContext`; o estado inicial vem de `INITIAL_OPORTUNIDADES` em `src/types.ts`. | Local/in-memory. Nao ha Firestore/API para oportunidades. |
| Persistencia | `setOportunidades` altera o estado React em memoria. | Nao persiste apos reload. |
| Filtro de busca | Busca por `title` e `client`, aplicado em lista e quadro. | Funciona localmente. |
| Filtro por estagio | O Kanban separa por estagios fixos: `Proposta`, `Negociacao`, `Apresentacao`, `Ganho`, `Perdido`. | Funciona localmente. |
| `activeStagePreset` | Existe como estado, mas nao e usado. | Morto/incompleto. |
| Lista | Tabela com proposta, cliente, estagio, valor e owner. Clique abre detalhe. | Conectada ao estado local. |
| Kanban | Colunas por estagio e cards reais do estado local. | Conectado ao estado local, mas sem drag-and-drop. |
| Mover card | Botoes seta anterior/proximo alteram `stage`; `Ganho` forca 100%, `Perdido` forca 0%. | Funciona localmente. |
| Arquivar | Nao existe acao de arquivar. | Falta. |
| Excluir | Lixeira remove do estado local. | Funciona localmente, sem persistencia. |
| Probabilidade | Slider altera `probability`. | Funciona localmente. |
| Nova proposta manual | Cria oportunidade via `addOportunidade`. | Funciona localmente. |
| Extracao IA de lead | Modal chama `/api/ai/extract-lead`; servidor tem essa rota e fallback simulado se nao houver Gemini. | Parcialmente conectado. |

## 2. Detalhe da Oportunidade

`src/components/modules/OportunidadeDetail.tsx` existe.

| Aba | Campos/conteudo | Dados reais? | Status |
|---|---|---|---|
| Geral | Titulo, cliente, estagio, valor, probabilidade. | Sim, da `Oportunidade`. | Parcial. |
| Geral | Localizacao `Curitiba/PR`. | Nao. Hardcoded. | Mock. |
| Geral | Area estimada `0 m2`. | Nao. Hardcoded/vazio. | Vazio. |
| Geral | Lia Comercial com temperatura do lead. | Mensagem hardcoded; temperatura usa `probability`. | Parcial. |
| Orcamento | Banner Otto, BDI Produto 10%, BDI M.O. 25%, busca item, adicionar grupo, tabela. | BDI e input solto; busca/adicionar grupo nao tem acao real. | Visual/incompleto. |
| Orcamento | Tabela de orcamento. | Comeca com linha "Resumo / Novo grupo" e total R$ 0. Pode receber `orcamentosList` se IA retornar itens. | Parcial, mas rota do chat esta errada. |
| Orcamento | Chat Otto. | Chama `/api/ai/chat`, mas o servidor nao tem essa rota; existe `/api/ai/orcamentista`. | Quebrado. |
| Tarefas | Aba aparece no menu. | Nao ha renderizacao para `activeTab === "tarefas"`. | Vazio. |
| Arquivos | Aba aparece no menu. | Nao ha renderizacao nem uploader; nao conecta Drive. | Vazio. |
| Propostas | Aba aparece no menu. | Nao ha renderizacao. | Vazio. |
| Google Meet | Modal agenda via `createGoogleMeetEvent`. | Chamada real ao Google Calendar com token, mas toast diz "simulado". | Conectado com mensagem contraditoria. |
| Gmail | Modal envia via `sendGmail`. | Chamada real ao Gmail com token, mas toast diz "simulado". | Conectado com mensagem contraditoria. |
| Virar Obra | Cria obra em `setObras`, remove oportunidade, tenta criar pasta Drive. | Local/in-memory; Drive real se token existir; obra criada com varios campos mock. | Parcial. |

## 3. Agentes IA na Tela

| Tela | Agente/mensagem | Origem | Botoes | Conectado? |
|---|---|---|---|---|
| Listagem | Lia Comercial: lead "Residencial Kairo" quente, sugestao de contato em 24h. | Hardcoded. | "Preparar briefing para orcamento", "Gerar rascunho de engajamento (Gmail)". | Apenas `alert` simulado. |
| Modal nova proposta | "Extrair com IA", upload PNG/JPG, HITL com confianca. | Chama `/api/ai/extract-lead`; servidor tem fallback simulado. | "Mapear com Inteligencia Artificial", "Aplicar e Revisar Manualmente". | Parcialmente real; aplica so campos basicos ao formulario. |
| Detalhe Geral | Lia Comercial: lead quente + temperatura por probabilidade. | Texto hardcoded; temperatura dinamica. | "Preparar briefing para orcamento", "Ver contexto de risco da conta". | Apenas `alert` simulado. |
| Detalhe Orcamento | Otto Orcamentista: lacunas no escopo, fundacao profunda com baixa confianca. | Hardcoded. | "Ativar Simulador de Custos". | Abre painel local. |
| Detalhe Orcamento | "Enviar perguntas pendentes ao cliente". | Hardcoded. | Botao dedicado. | Apenas `alert` simulado. |
| Painel Otto | Mensagem inicial do Otto e chips "Gerar macro resumo", "Quais tributos?", "Sugira insumos". | Mensagem/chips hardcoded. | Envia pergunta ao chat. | Quebrado: chama `/api/ai/chat`, rota inexistente. |
| Painel Otto | "Aplicar Insumos". | Renderiza se `m.itens` existir. | Botao so mostra toast. | Visual; nao aplica de fato. |

## 4. Comparacao com apps/saas

| Capacidade esperada do `apps/saas` | Existe no AiStudio? | Vazio/incompleto | Falta completamente |
|---|---:|---:|---:|
| Pipeline Kanban | Sim, visual e conectado ao estado local. | Sem drag-and-drop; so setas. | Persistencia real. |
| Drag-and-drop | Nao. | - | Sim. |
| Estagios `Proposta`, `Negociacao`, `Apresentacao`, `Ganho`, `Perdido` | Sim. | - | - |
| Orcamento com itens hierarquicos `RefurbishItem` | Nao. | Tabela plana e zerada. | Sim. |
| BDI | Parcial. | Inputs 10/25 sem calculo/persistencia. | BDI real por orcamento. |
| SINAPI | So citado no texto do Otto. | Chat tenta estimar, mas rota esta errada. | Integracao SINAPI real. |
| Clientes vinculados `CompanyCustomer` | Nao. | `client` e string simples; `clientEmail` opcional no seed. | Sim. |
| Arquivos/Drive na oportunidade | Parcial so em "Virar Obra", criando pasta. | Aba Arquivos vazia. | Uploader/listagem Drive por oportunidade. |
| Tarefas vinculadas a oportunidade | Nao. | Aba Tarefas vazia. | Sim. |
| Propostas/documentos comerciais | Nao. | Aba Propostas vazia. | Sim. |

## 5. Gaps Prioritarios

| Prioridade | Gap | Impacto |
|---:|---|---|
| 1 | Persistir oportunidades em Firestore/API em vez de `INITIAL_OPORTUNIDADES` in-memory. | Hoje o CRM perde alteracoes no reload. |
| 2 | Corrigir Otto para usar a rota existente `/api/ai/orcamentista` ou criar `/api/ai/chat`. | Orcamento IA do detalhe esta quebrado. |
| 3 | Implementar orcamento real: itens hierarquicos, BDI calculado, totais e vinculo com oportunidade. | A aba mais critica esta so parcial/visual. |
| 4 | Implementar abas vazias: Tarefas, Arquivos e Propostas. | O detalhe promete funcionalidades que nao existem. |
| 5 | Vincular cliente real (`CompanyCustomer`) e arquivos Drive por oportunidade. | Hoje cliente e texto livre e Drive so aparece no fluxo "Virar Obra". |
