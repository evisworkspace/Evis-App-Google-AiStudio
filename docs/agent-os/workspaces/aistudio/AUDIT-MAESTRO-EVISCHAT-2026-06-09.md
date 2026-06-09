# AUDIT - MAESTRO EVISCHAT - 2026-06-09

Projeto auditado: `C:\Users\User\Evis-AiStudio`

Arquivos lidos:
- `src/components/assistente/EvisChat.tsx` completo
- `src/utils/agentesConfig.ts` completo
- `src/context/AppContext.tsx` com foco no estado usado pelo Maestro
- Busca complementar em `src/App.tsx`, `DashboardView.tsx` e `WorkspaceView.tsx` para abertura do Maestro

Escopo: auditoria somente leitura do projeto. Este arquivo e o relatorio solicitado sao a unica saida gerada.

## 1. TIPOS DE MENSAGEM DO MAESTRO

### Tipos auxiliares

```ts
export type AgentMessageStatus = "nova" | "lida" | "pendente" | "resolvida" | "simulada";
export type ChatScope = "Global" | "Obra";
```

### Interface completa

```ts
export interface AgentMessage {
  id: string;
  agentId: string;
  agentName: string;
  agentRole: string;
  obraId?: string;
  obraName?: string;
  scope: ChatScope;
  module: string;
  severity: "info" | "warning" | "critical" | "success";
  title: string;
  message: string;
  evidence?: string[];
  suggestedActions: { label: string; actionStr: string; type: "primary" | "secondary" }[];
  requiresHumanApproval: boolean;
  status: AgentMessageStatus;
  createdAt: string;
  isUser?: boolean;
}
```

### Campos e controles

- `id`: identificador unico da mensagem. Nos seeds usa IDs fixos para globais e IDs com `activeProj.id` para Obra; nas mensagens do usuario/IA usa `Date.now()`.
- `agentId`: vincula a mensagem ao agente/thread. Valores seedados: `ag-eva`, `ag-sentinela`, `ag-vera`, `ag-nina`, `ag-dora`, `ag-diario`, `ag-agenda`. A configuracao global tambem define `ag-lia`, `ag-otto`, `ag-cronos`, `ag-radar`, `ag-auditor`, `ag-automador`.
- `agentName`: nome curto exibido no chat/lista, por exemplo `EVA`, `Sentinela`, `Nina`.
- `agentRole`: papel exibido na lista/cabecalho, por exemplo `Sentinela de Riscos`, `Nina Compras`.
- `obraId?`: escopo tecnico da mensagem de Obra. Quando existe, precisa bater com `activeProj.id` para a mensagem aparecer. Mensagens globais nao usam.
- `obraName?`: nome da obra ativa, usado apenas como metadado nos seeds de Obra. Nao participa do filtro.
- `scope`: controla se a mensagem e `Global` ou `Obra`. `Global` aparece independentemente da obra ativa; `Obra` depende de `obraId` igual a obra ativa.
- `module`: area funcional textual da mensagem, como `Resumo`, `Riscos`, `Financeiro`, `Compras`, `Documentos`, `RDO`, `Agenda`. E usado na resposta simulada para compor texto.
- `severity`: controla cor/badge visual. Valores: `info`, `warning`, `critical`, `success`. Na UI, `critical` vira `CRITICO`, `warning` vira `ALERTA`, demais caem como `INFO`; `success` tem cor propria mas tambem exibe `INFO` no texto do badge.
- `title`: titulo da mensagem exibido no bubble quando nao e mensagem de usuario.
- `message`: corpo textual exibido na lista e no chat.
- `evidence?`: lista opcional de evidencias. Quando presente, exibe bloco de evidencias. So o seed global do Sentinela usa.
- `suggestedActions`: array de botoes. Cada acao tem `label` exibido, `actionStr` tecnico e `type` visual (`primary` ou `secondary`). Hoje `actionStr` nao altera o comportamento real; e passado para o handler mas nao e interpretado.
- `requiresHumanApproval`: sinal semantico de HITL. No codigo atual nao bloqueia nem muda o handler; as acoes aparecem para qualquer mensagem com `suggestedActions` e status diferente de `simulada`.
- `status`: controla estado local. `nova` mostra indicador e pode virar `lida` ao abrir thread; `simulada` oculta acoes e mostra confirmacao humana concluida. `pendente` e `resolvida` existem no tipo, mas nao sao usados no fluxo atual.
- `createdAt`: string exibida como horario/data curta na lista/chat. Seeds usam horario fixo; mensagens dinamicas usam `toLocaleTimeString`.
- `isUser?`: quando `true`, renderiza a mensagem como usuario, alinhada a direita e sem titulo/acoes. Ausente ou `false` renderiza como agente.

## 2. MENSAGENS INICIAIS HARDCODED

As mensagens sao carregadas dentro de um `useEffect` em `EvisChat.tsx`. O array inicial sempre inclui 3 mensagens globais. Se existir `activeProj`, adiciona 4 mensagens de Obra usando `activeProj.id` e `activeProj.name`.

### 1. EVA - Resumo do Portfolio

- `agentId`: `ag-eva`
- `scope`: `Global`
- `severity`: `info`
- `titulo`: `Resumo do Portfólio`
- `conteudo resumido`: Residencial Kairo concentra o maior risco operacional e ha 3 decisoes aguardando chancela.
- `requiresHumanApproval`: `false`
- `suggestedActions`: `Ver decisões globais` -> `ver_decisoes`

### 2. Sentinela - Risco Detalhado

- `agentId`: `ag-sentinela`
- `scope`: `Global`
- `severity`: `critical`
- `titulo`: `Risco Detalhado - Batel Tower`
- `conteudo resumido`: emissao atipica de SC para Aco CA-50 no Batel Tower, acima da curva S provavel e referenciais SINAPI.
- `requiresHumanApproval`: `true`
- `suggestedActions`: `Acionar Nina Compras` -> `acionar_nina`; `Simular mitigação` -> `plano_mitigacao`
- `evidence`: `SC #10294 para Aço CA-50 excedeu limite mensal`; `Histórico de orçamento Batel Tower`

### 3. Vera - Vencimento Cruzado

- `agentId`: `ag-vera`
- `scope`: `Global`
- `severity`: `warning`
- `titulo`: `Alerta de Vencimento Cruzado`
- `conteudo resumido`: fluxo de caixa consolidado indica saidas criticas amanha de R$ 84.000, com maior fatia em fornecedor Votorantim.
- `requiresHumanApproval`: `false`
- `suggestedActions`: `Ver fluxo consolidado` -> `ver_resumo_financeiro`

### 4. Nina - Insumo Critico da Obra

- `agentId`: `ag-nina`
- `scope`: `Obra`
- `obraId`: `activeProj.id`
- `obraName`: `activeProj.name`
- `severity`: `warning`
- `titulo`: `Insumo Crítico da Obra`
- `conteudo resumido`: necessidade de fechar cotacao de Cimento CP-II hoje para evitar atraso de concretagem.
- `requiresHumanApproval`: `true`
- `suggestedActions`: `Preparar cotação` -> `preparar_cotacao`; `Comparar fornecedores` -> `comparar_fornecedores`

### 5. Dora - Documentos Sensiveis

- `agentId`: `ag-dora`
- `scope`: `Obra`
- `obraId`: `activeProj.id`
- `obraName`: `activeProj.name`
- `severity`: `warning`
- `titulo`: `Documentos Sensíveis Aguardando`
- `conteudo resumido`: 4 anexos fiscais da prefeitura exigem confirmacao de classificacao por sigilo.
- `requiresHumanApproval`: `true`
- `suggestedActions`: `Classificar documentos` -> `classificar_docs`; `Ver anexos da obra` -> `ver_anexos`

### 6. Diario - RDO Pendente

- `agentId`: `ag-diario`
- `scope`: `Obra`
- `obraId`: `activeProj.id`
- `obraName`: `activeProj.name`
- `severity`: `warning`
- `titulo`: `RDO Pendente - Mestre de Obras`
- `conteudo resumido`: apropriacao de horas e clima de ontem ainda nao foram formalizados; sugere gerar rascunho com audio do mestre.
- `requiresHumanApproval`: `true`
- `suggestedActions`: `Gerar rascunho do RDO` -> `gerar_rdo`

### 7. Agenda - Conflito de Cronograma

- `agentId`: `ag-agenda`
- `scope`: `Obra`
- `obraId`: `activeProj.id`
- `obraName`: `activeProj.name`
- `severity`: `warning`
- `titulo`: `Conflito de Cronograma`
- `conteudo resumido`: conflito de vistoria das 12h as 14h com entrega de concreto na frente de servico.
- `requiresHumanApproval`: `true`
- `suggestedActions`: `Sugerir novo horário` -> `sugerir_horario`; `Confirmar reagendamento simulado` -> `reagendar`

## 3. ROTEAMENTO GLOBAL vs OBRA

O Maestro nao consulta backend nem permissao de modulo para decidir mensagens. Ele decide localmente por `scope` e `obraId`.

Na lista de threads (`agentsWithMessages`):

```ts
if (m.scope === "Obra" && m.obraId !== activeProj?.id) return;
```

No chat aberto (`activeThread`):

```ts
agentMessages.filter(m =>
  m.agentId === activeChatId && (m.scope === "Global" || m.obraId === activeProj?.id)
)
```

Diferenca entre Global e Obra:
- Mensagem `Global`: `scope: "Global"`, normalmente sem `obraId`/`obraName`, aparece em qualquer contexto de obra.
- Mensagem `Obra`: `scope: "Obra"`, deve carregar `obraId` igual ao projeto ativo para aparecer.

Influencia da obra ativa:
- `activeProj` vem de `getActiveProject()` do `AppContext`, que usa `selectedProjectId` e cai para `obras[0]` se nao encontrar.
- O `useEffect` de seed depende de `activeProj?.id`. Ao trocar de obra, ele recria `initialMessages` e chama `setAgentMessages(initialMessages)`, resetando mensagens, status e conversas locais.
- A UI mostra o filtro ativo no cabecalho. `activeRoute` so altera o texto visual (`Visão Global / Portfólio` em `dashboard`/`oportunidades`, ou nome da obra nos demais); nao filtra de verdade.

Observacao critica: `setCurrentRoute` e `setSelectedProjectId` sao importados do contexto em `EvisChat`, mas nao sao usados. Portanto nenhuma acao sugerida navega ou troca de obra.

## 4. FLUXO DE INTERACAO DO USUARIO

### Clique em "Abrir Conversa"

Ha dois fluxos:

1. Dentro do proprio Maestro, a lista de threads renderiza cada agente como botao. Ao clicar, executa `setActiveChatId(thread.agentId)`. Em seguida, um `useEffect` marca mensagens desse agente com `status: "nova"` como `status: "lida"`.

2. Em telas externas, botoes como `Abrir Conversa`, `Abrir no Maestro` e `Abrir Alerta no Maestro` chamam `openMaestro(agentRole)`, que dispara:

```ts
window.dispatchEvent(new CustomEvent("open-maestro", { detail: { agentRole } }));
```

O `EvisChat` escuta `open-maestro`, chama `setIsOpen(true)` e mapeia `agentRole` por `includes`:
- contem `Sentinela` -> `ag-sentinela`
- contem `Financeira` -> `ag-vera`
- contem `Compras` -> `ag-nina`
- contem `Dora` -> `ag-dora`
- contem `Agenda` -> `ag-agenda`
- contem `Diário` ou `RDO` -> `ag-diario`
- contem `EVA` -> `ag-eva`
- sem match -> abre a lista (`activeChatId = null`)

### Clique em `suggestedAction`

Todos os botoes de acao chamam:

```ts
handleAction(act.actionStr, m.id)
```

O handler:
- exibe toast: `Ambiente simulado: Ação confirmada via Hub. Nenhuma rotina real acionada.`
- altera apenas o estado local da mensagem para `status: "simulada"`
- nao interpreta `actionStr`
- nao chama API
- nao navega
- nao chama funcoes reais do `AppContext`
- nao modifica dados de negocio

Depois disso, a UI oculta os botoes e mostra `Confirmação Humana Concluída`.

### Campo de resposta livre

O form so envia se `messageInput.trim()` existir e houver `activeChatId`.

Fluxo:
- busca uma mensagem existente do agente ativo com `agentMessages.find(m => m.agentId === activeChatId)`
- cria uma nova `AgentMessage` com `isUser: true`, `status: "lida"`, `severity: "info"`, `message` igual ao input, e `suggestedActions: []`
- adiciona ao estado local
- limpa input
- seta `isTyping: true`
- apos 2 segundos, adiciona resposta simulada do agente com titulo `Raciocínio IA Concluído`, mensagem iniciada por `(Simulação Gemini)`, `severity: "success"`, `requiresHumanApproval: true` e acao `Confirmar Simulação` -> `confirmar_simulacao_gemini`

Bug importante: nas respostas livres, o codigo copia `scope`, `module`, `agentName` e `agentRole`, mas nao copia `obraId`/`obraName`. Em chats de Obra, essas novas mensagens ficam com `scope: "Obra"` sem `obraId`; como o filtro exige `m.obraId === activeProj?.id`, a mensagem do usuario e a resposta simulada podem desaparecer do thread ativo.

### API / Gemini / server.ts

O `EvisChat` nao chama nenhuma API. Nao ha `fetch`, rota HTTP, chamada ao Gemini nem chamada a `server.ts` nesse componente. A referencia a Gemini e apenas texto/comentario: `// Simulated Gemini AI Response Framework` e mensagem `(Simulação Gemini)`.

Ha arquivo separado com pipeline Gemini para WhatsApp (`src/lib/whatsapp/agent-pipeline.ts`), mas ele nao e usado pelo `EvisChat` neste fluxo.

## 5. HITL - APROVACAO HUMANA

Mensagens iniciais com `requiresHumanApproval: true`:
- `msg_global_sentinela` (`ag-sentinela`): risco detalhado do Batel Tower.
- `msg_obra_nina_${activeProj.id}` (`ag-nina`): insumo critico da obra.
- `msg_obra_dora_${activeProj.id}` (`ag-dora`): documentos sensiveis aguardando.
- `msg_obra_diario_${activeProj.id}` (`ag-diario`): RDO pendente.
- `msg_obra_agenda_${activeProj.id}` (`ag-agenda`): conflito de cronograma.

Mensagens dinamicas simuladas depois de resposta livre tambem sao criadas com `requiresHumanApproval: true`.

Quando o usuario aprova/clica uma acao:
- o mesmo `handleAction` roda para qualquer acao, com ou sem `requiresHumanApproval`
- a mensagem vira `status: "simulada"`
- aparece toast de simulacao
- nada mais acontece

Nao existe acao que realmente modifica dados. Todas sao simuladas. Mesmo acoes com nomes operacionais (`gerar_rdo`, `preparar_cotacao`, `classificar_docs`, `reagendar`) nao chamam `addRdo`, `setPurchases`, `setTasks`, `setObras`, `setLancamentos`, API, Firebase ou servidor.

## 6. ABERTURA DO MAESTRO POR OUTROS MODULOS

### Montagem global

`src/App.tsx` monta `<EvisChat />` uma vez no shell autenticado, junto do widget flutuante. Por isso o botao flutuante do Maestro aparece globalmente nas telas do app renderizadas por `AppContent`.

### Abertura interna do EvisChat

Em `EvisChat.tsx`:
- botao flutuante `btn_evis_chat_trigger`: `onClick={() => setIsOpen(!isOpen)}`
- listener de evento `open-maestro`: chama `setIsOpen(true)` e seleciona o agente conforme `detail.agentRole`
- botao X do painel: `setIsOpen(false)`

A unica chamada literal a `setIsOpen(true)` encontrada fica no handler do evento `open-maestro`.

### Disparos de `open-maestro`

`src/components/modules/DashboardView.tsx`:
- define `openMaestro(agentRole)` com `window.dispatchEvent(new CustomEvent("open-maestro", { detail: { agentRole } }))`
- botao `Abrir Conversa` no card de risco do Sentinela: `openMaestro("Sentinela")`
- botao `Abrir Conversa` no card/resumo da EVA: `openMaestro("EVA")`

`src/components/modules/WorkspaceView.tsx`:
- define `openMaestro(agentRole)` com o mesmo dispatch
- botao `Registrar RDO (Via Maestro)`: `openMaestro("Diário")`
- card EVA: `openMaestro("EVA")`
- card Sentinela: `openMaestro("Sentinela")`
- card Vera Financeira: `openMaestro("Vera Financeira")`
- card Nina Compras: `openMaestro("Nina Compras")`
- card Agenda: `openMaestro("Agenda")`
- card Dora: `openMaestro("Dora")`

Nao foram encontrados outros `open-maestro` no `src`.

### Telas/componentes que podem abrir

- Qualquer tela autenticada: pelo botao flutuante global do `EvisChat`.
- `DashboardView`: abre Sentinela e EVA.
- `WorkspaceView`: abre Diario/RDO, EVA, Sentinela, Vera, Nina, Agenda e Dora.

## 7. GAPS CRITICOS DO MAESTRO

### Funcionando de verdade

- Widget flutuante abre/fecha.
- Evento global `open-maestro` abre o painel e seleciona agente por texto do role.
- Lista de threads agrupa mensagens por `agentId`.
- Filtro local remove mensagens de Obra que nao pertencem a obra ativa.
- Abrir thread marca mensagens `nova` como `lida`.
- Acoes sugeridas alteram status local para `simulada` e exibem toast.
- Campo livre cria mensagem local do usuario e resposta simulada apos delay.
- Perfis de agentes fornecem icones, nomes, roles e temas para renderizacao visual.

### Apenas visual/simulado

- Todas as mensagens iniciais sao hardcoded no componente.
- Evidencias, riscos, cotacoes, RDO, documentos, agenda e financeiro sao textos estaticos.
- Gemini nao roda no Maestro; a resposta e `setTimeout` local.
- HITL nao executa aprovacao real, nao registra auditoria e nao cria tarefa/ordem/documento.
- `actionStr` nao tem dispatcher real.
- O aviso de ambiente simulado e coerente com o comportamento: nenhuma rotina real e acionada.

### Impedimentos para ser operacional com dados reais

- Falta fonte real de mensagens/alertas por agente: nao ha query, assinatura, API ou backend alimentando `agentMessages`.
- Falta persistencia: mensagens, lidas, simuladas e conversas somem ao recarregar ou trocar obra.
- Troca de obra reseta todo o estado local porque o `useEffect` recria `initialMessages`.
- Falta action dispatcher por `actionStr` para executar workflows reais.
- Falta integracao com funcoes reais do `AppContext` (`addRdo`, `addLancamento`, `setTasks`, `setPurchases`, etc.).
- Falta rota de IA/servidor para chat do Maestro. O componente nao chama Gemini nem `server.ts`.
- Falta modelo de autorizacao/aprovacao humana: `requiresHumanApproval` e apenas flag visual/semantica, nao gate operacional.
- Falta trilha de auditoria: quem aprovou, quando aprovou, payload aprovado, resultado da execucao e rollback.
- Falta validacao por modulo/obra: qualquer evento externo com role compatível abre o agente, sem verificar se aquela mensagem existe, se pertence a obra ativa ou se o usuario tem permissao.
- Filtro por rota e superficial: `activeRoute` muda texto de contexto, mas nao controla quais mensagens aparecem.
- Bug de chat em Obra: mensagens livres e respostas simuladas nao carregam `obraId`, entao sao excluidas pelo filtro do proprio thread de Obra.
- O mapeamento de agente por `role.includes(...)` e fragil e ignora `getAgentProfileByRole`, podendo falhar com nomes diferentes ou agentes novos.

## CONCLUSAO

O Maestro atual funciona como hub visual local de agentes, com abertura contextual e simulacao de HITL. Ele ainda nao e operacional: nao consome dados reais, nao chama IA, nao persiste conversas, nao executa acoes e nao registra aprovacoes. O proximo salto tecnico seria separar `AgentMessage` e `actionStr` em contrato de dominio, persistir mensagens por obra/agente, criar dispatcher real de acoes aprovadas e conectar o chat a uma rota de IA com contexto controlado.
