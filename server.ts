import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
// whatsapp-web.js e qrcode — instalar quando ativar integração WhatsApp
// npm install whatsapp-web.js qrcode @types/qrcode
const Client: any = class { on() {} initialize() { return Promise.resolve(); } };
const LocalAuth: any = class {};
const qrcode = { toDataURL: async (_: string) => "" };

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const PORT = 3000;

// In-memory Database for WhatsApp Messages
const whatsappDB: { sender: string; body: string; timestamp: Date; groupId?: string }[] = [];
let whatsappStatus = "DISCONNECTED";
let whatsappQrCodeUrl = "";
let wppClient: InstanceType<typeof Client> | null = null;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Server-side Gemini client validation and lazy lookup
  const getAiClient = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      return null;
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API endpoint for system status / config
  app.get("/api/health", (req, res) => {
    res.json({
      status: "alive",
      timestamp: new Date().toISOString(),
      hasGeminiKey: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
    });
  });

  // API endpoint for interactive Gemini-powered EvisChat Assistant
  app.post("/api/chat", async (req, res) => {
    const { messages, siteContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Parâmetro 'messages' é obrigatório e deve ser um array." });
    }

    const ai = getAiClient();
    if (!ai) {
      const lastMessage = messages[messages.length - 1]?.content || "";
      const text = `⚠️ **Nota do Sistema EVIS**: O assistente está operando em modo offline porque a chave \`GEMINI_API_KEY\` não foi configurada nas configurações do AI Studio (Secrets Panel).

Aqui está uma simulação inteligente de como eu, o assistente **EVIS**, responderia à sua pergunta sobre: *"${lastMessage}"*

Como especialista em **Planejamento de Obras e Controle Financeiro**, meu objetivo é acelerar sua operação na construtora. No fluxo ativo, posso rastrear desvios de orçamento, calcular a curva S de concreto armado ou extrair insumos para o próximo RDO.

Acesse o painel de segredos (Secrets) em seu AI Studio Workspace e adicione sua chave de API para habilitar consultas em tempo real!`;
      return res.json({ content: text });
    }

    try {
      const formattedContents = messages.map((m: any) => {
        const roleStr = m.role === "user" ? "user" : "model";
        return `${roleStr === "user" ? "Usuário" : "Assistente EVIS"}: ${m.content}`;
      }).join("\n\n");

      const systemInstruction = `Você é o EVIS, um assistente de inteligência artificial de elite integrado a um software SaaS ERP de engenharia civil e gestão de obras de alto padrão para a Curitiba Construtora.
Seu interlocutor é o Engenheiro Berti (email: berti@curitibaconstrutora.com.br).
Você deve se comunicar de forma extremamente profissional, técnica, inspiradora e direta.

Contexto da Obra Atual Ativa: ${siteContext || "Visão Geral de Portfólio de Obras"}
Interaja em português do Brasil e ofereça sugestões executivas úteis.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents + "\n\nResponda como o Assistente EVIS:",
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ content: response.text || "Desculpe, não consegui processar essa resposta." });
    } catch (err: any) {
      console.error("Gemini API Error in EVIS Chat service:", err);
      res.status(500).json({ error: "Erro de processamento no serviço assistente Gemini: " + err.message });
    }
  });

  // AGENTE 1 — LIA (chat global)
  // Rota: POST /api/ai/assistente
  app.post("/api/ai/assistente", async (req, res) => {
    const { messages, siteContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages é obrigatório e deve ser um array." });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        reply: `MODO DE SIMULAÇÃO ATIVO (CHAVE DE API AUSENTE)

Olá! Sou o Maestro Operacional (Roteador de IA). Como seu orquestrador central executivo de obras, posso ler suas obras ativas (Residencial Belle Vue, Residencial Kairo e Smart Tower Corporate), tarefas pendentes e status financeiro.

Experimente sugerir comandos de redirecionamento como:
- "Ir para o diário do Residencial Belle Vue"
- "Abrir orçamentista do Residencial Kairo"

*Adicione sua chave de API nas configurações do AI Studio para ativar as consultas operadas por LLM!*`,
        type: "geral"
      });
    }

    try {
      const historyContext = messages.map((m: any) => {
        const roleStr = m.role === "user" ? "user" : "model";
        return `${roleStr === "user" ? "Usuário" : "Assistente EVIS"}: ${m.content}`;
      }).join("\n\n");

      const systemInstruction = `Você é LIA (Operado por EVIS AI), a assistente corporativa central de inteligência artificial de Curitiba Construtora.
Seu interlocutor é o Engenheiro Berti.
Você tem acesso aos seguintes dados de banco do ERP/SaaS:

1. OBRAS ATIVAS (refurbish.list):
   - id: "ob_1" | Residencial Belle Vue (Batel, Curitiba - PR) | Progresso: 68% | Orçado: R$ 18.500.000 | Gasto: R$ 12.640.000 | Status: Estrutura | Gestor: Roberto Berti
   - id: "ob_2" | Residencial Kairo (Cabral, Curitiba - PR) | Progresso: 32% | Orçado: R$ 34.200.000 | Gasto: R$ 11.050.000 | Status: Fundação | Gestor: Amanda Costa
   - id: "ob_3" | Smart Tower Corporate (Centro, Curitiba - PR) | Progresso: 10% | Orçado: R$ 48.000.000 | Gasto: R$ 4.850.000 | Status: Planejamento | Gestor: Pedro Alencar

2. TAREFAS ATRASADAS / OPERAÇÕES DO DIA (task.list):
   - tsk_1: Concretar laje do 13º nível (Obra ob_1, Progresso, Alta prioridade, Eng. Berti, Vence 2026-06-12)
   - tsk_2: Realizar medição mensal para liberação do banco (Obra ob_1, Progresso, Alta prioridade, Eng. Berti, Vence 2026-06-15)
   - tsk_3: Enviar relatórios de ensaio geotécnico do solo (Obra ob_2, Fazer, Média prioridade, Amanda Costa, Vence 2026-06-10)
   - tsk_4: Revisar prancha do projeto elétrico do Bloco C (Obra ob_2, Revisão, Baixa prioridade, Carlos Drummond, Vence 2026-06-08)
   - tsk_5: Aprovar compras pendentes de caixaria de madeira (Obra ob_2, Fazer, Média prioridade, Eng. Berti, Vence 2026-06-07)

3. PAGAMENTOS VENCIDOS / VENCENDO HOJE (payment.list):
   - Compra Concreto Usinado fck 30 MPa (ob_1): Despesa R$ 94.000 em 2026-06-04 (Realizado)
   - Compra de Vergalhão de Aço CA-50 Gerdau (ob_1): Despesa R$ 152.000 em 2026-06-02 (Realizado)
   - Fatura de Energia Celesc Canteiro Principal (ob_1): Despesa R$ 4.850 em 2026-06-06 (Pendente)
   - Adiantamento Contrato Projeto Paisagístico (ob_2): Despesa R$ 28.000 em 2026-06-05 (Pendente)

4. CLIENTES CADASTRO BUSCA FUZZY (companyCustomer.list):
   - Ambev S.A. (Retrofit Galpão Logístico Ambev - Proposta, Valor R$ 8.75M)
   - Grupo Sugisawa S/S (Ampliação Hospital Sugisawa - Negociação, Valor R$ 14.2M)
   - Sicoob Central (Construção Sede Sicoob Sul - Apresentação, Valor R$ 6.4M)
   - Invescon Incorporadora (Residencial Quinta do Sol - Ganho, Valor R$ 29.5M)
   - Clube Curitibano (Complexo Esportivo Curitibano - Perdido, Valor R$ 3.8M)

Suas tarefas:
- Responda perguntas sobre obras ativas, tarefas urgentes, pagamentos, orçamentos, ou clientes. Você é determinística e apenas acessa esses dados. Nunca invente ou gere texto criativo irreal. Se a query retornar vazia, diga com clareza.
- Identifique se o usuário deseja realizar um redirecionamento físico na interface (routing):
  * Se o usuário pede para "ver o diário", "escrever diário", "ir para rdo", "rdo da Belle Vue", mude o type para "redirect_diario".
  * Se o usuário pede para "orçar a obra", "orçamento da Belle Vue", "orçamentista com IA", "fazer orçamento", mude o type para "redirect_orcamentista".
  * Para esses dois redirecionamentos, você deve obrigatoriamente fornecer o idRefurbish no JSON correspondente (ex: "ob_1", "ob_2" ou "ob_3").
- Retorne obrigatoriamente um JSON correspondendo à estrutura declarada no responseSchema.
- REGRA CRÍTICA: ZERO MARKDOWN NA RESPOSTA (reply). NUNCA use asteriscos, hashtags ou negritos. Use apenas MAIÚSCULAS para títulos e traço simples (-) para listas ou tópicos. Texto puro.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: historyContext + "\n\nResponda estruturado no formato JSON requerido:",
        config: {
          systemInstruction,
          temperature: 0.3,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING, description: "O diálogo principal em português do Brasil com as respostas extraídas do seu banco de dados ERP." },
              type: { type: Type.STRING, description: "O tipo de conteúdo detectado. Valores: geral, briefing, financeiro, tarefa, cliente, obra, redirect_diario, redirect_orcamentista" },
              idRefurbish: { type: Type.STRING, description: "O ID correspondente da obra se aplicável (ob_1, ob_2, ob_3). Obrigatório para tipos redirect_diario e redirect_orcamentista." },
              copyText: { type: Type.STRING, description: "Conteúdo textual extraído para rápida cópia pelo usuário." }
            },
            required: ["reply", "type"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini Agente LIA Error:", err);
      res.status(550).json({ error: "Erro na central LIA: " + err.message });
    }
  });

  // AGENTE 2 — EXTRACT-LEAD (oportunidade)
  // Rota: POST /api/ai/extract-lead
  app.post("/api/ai/extract-lead", async (req, res) => {
    const { text, imageBase64, mimeType } = req.body;

    const ai = getAiClient();
    if (!ai) {
      // Return a full simulated complex extraction payload so the front-end HITL interface can still be fully previewed
      return res.json({
        data: {
          opportunityName: "Retrofit Galpão Logístico Ambev",
          customerName: "Ambev S.A.",
          customerEmail: "gestao.ativos@ambev.com.br",
          customerPhone: "(41) 99245-1200",
          customerDoc: "12.345.678/0001-90",
          customerPersonType: "Jurídica",
          budget: 8750000,
          expectedRevenue: 1200000,
          startPrediction: "2026-08-01",
          m2: 12500,
          zipcode: "80010-010",
          street: "Rua das Flores",
          number: "192",
          complement: "Galpão Central",
          neighborhood: "Centro",
          city: "Curitiba",
          state: "PR",
          origem: "WhatsApp",
          etiqueta: "Retrofit Comercial",
          necessityDescription: "Necessidade de renovação asfáltica de altíssima resistência para movimentação de empilhadeiras pesadas, reparo estrutural em tesouras de aço e renovação na fiação subterrânea."
        },
        confidence: {
          opportunityName: 0.95,
          customerName: 0.98,
          customerEmail: 0.92,
          customerPhone: 0.88,
          customerDoc: 0.85,
          customerPersonType: 0.99,
          budget: 0.90,
          expectedRevenue: 0.80,
          startPrediction: 0.75,
          m2: 0.86,
          zipcode: 0.90,
          street: 0.92,
          number: 0.94,
          complement: 0.80,
          neighborhood: 0.88,
          city: 0.95,
          state: 0.95,
          origem: 0.70,
          etiqueta: 0.85,
          necessityDescription: 0.95
        },
        provider: "google-gemini-offline-sim",
        sourceDetails: {
          ocrUsed: false,
          ocrStatus: "simulated-offline-mode",
          totalDurationMs: 250
        }
      });
    }

    try {
      let contents: any[] = [];
      const prompt = `Você é um refinado extrator de dados comerciais de construção civil para criação de Oportunidades Leads no CRM da Curitiba Construtora.
Analise o texto ou imagem anexados e extraia as informações estruturadas de propostas comerciais de empreiteiras, memoriais descritivos, mensagens do WhatsApp, e preencha a estrutura de dados JSON.
Para cada campo extraído, atribua um fator de confiança entre 0.00 e 1.00 com base na clareza do texto fonte.
Se a confiança de um campo for zero ou o campo não existir na mensagem original, DEIXE o campo em NULO ou VAZIO. NUNCA invente dados hipotéticos para preencher lacunas.
Determine se o tipo de pessoa é "Física" ou "Jurídica" baseado em CNPJ/CPF ou nome corporativo. Em caso de dúvidas, selecione "Jurídica" para empresas.`;

      contents.push({ text: prompt });

      if (imageBase64 && mimeType) {
        contents.push({
          inlineData: {
            mimeType: mimeType,
            data: imageBase64
          }
        });
      }

      if (text) {
        contents.push({ text: `Texto comercial enviado para análise:\n"""\n${text}\n"""` });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              data: {
                type: Type.OBJECT,
                properties: {
                  opportunityName: { type: Type.STRING, description: "Nome do empreendimento ou obra (ex: Retrofit Ambev)" },
                  customerName: { type: Type.STRING, description: "Nome do cliente comprador / tomador" },
                  customerEmail: { type: Type.STRING, description: "E-mail de contato do lead" },
                  customerPhone: { type: Type.STRING, description: "Telefone de contato do lead" },
                  customerDoc: { type: Type.STRING, description: "CPF ou CNPJ comercial" },
                  customerPersonType: { type: Type.STRING, description: "Valor 'Física' ou 'Jurídica'" },
                  budget: { type: Type.NUMBER, description: "Orçamento financeiro estimado da obra em Reais" },
                  expectedRevenue: { type: Type.NUMBER, description: "Receita contratual estimada esperada em Reais" },
                  startPrediction: { type: Type.STRING, description: "Data de início estimada (formato YYYY-MM-DD)" },
                  m2: { type: Type.NUMBER, description: "Metragem quadrada total construída" },
                  zipcode: { type: Type.STRING, description: "CEP do local de obras" },
                  street: { type: Type.STRING, description: "Logradouro ou rua" },
                  number: { type: Type.STRING, description: "Número do imóvel" },
                  complement: { type: Type.STRING, description: "Complemento residencial" },
                  neighborhood: { type: Type.STRING, description: "Bairro do local de obras" },
                  city: { type: Type.STRING, description: "Cidade de execução" },
                  state: { type: Type.STRING, description: "Sigla do estado" },
                  origem: { type: Type.STRING, description: "Origem (WhatsApp, Email, etc.)" },
                  etiqueta: { type: Type.STRING, description: "Etiqueta comercial (Alto Padrão, Comercial, Loteamento)" },
                  necessityDescription: { type: Type.STRING, description: "Descrição sumarizada técnica das necessidades" }
                },
                required: ["opportunityName", "customerName"]
              },
              confidence: {
                type: Type.OBJECT,
                properties: {
                  opportunityName: { type: Type.NUMBER },
                  customerName: { type: Type.NUMBER },
                  customerEmail: { type: Type.NUMBER },
                  customerPhone: { type: Type.NUMBER },
                  customerDoc: { type: Type.NUMBER },
                  customerPersonType: { type: Type.NUMBER },
                  budget: { type: Type.NUMBER },
                  expectedRevenue: { type: Type.NUMBER },
                  startPrediction: { type: Type.NUMBER },
                  m2: { type: Type.NUMBER },
                  zipcode: { type: Type.NUMBER },
                  street: { type: Type.NUMBER },
                  number: { type: Type.NUMBER },
                  complement: { type: Type.NUMBER },
                  neighborhood: { type: Type.NUMBER },
                  city: { type: Type.NUMBER },
                  state: { type: Type.NUMBER },
                  origem: { type: Type.NUMBER },
                  etiqueta: { type: Type.NUMBER },
                  necessityDescription: { type: Type.NUMBER }
                }
              },
              provider: { type: Type.STRING },
              sourceDetails: {
                type: Type.OBJECT,
                properties: {
                  ocrUsed: { type: Type.BOOLEAN },
                  ocrStatus: { type: Type.STRING },
                  totalDurationMs: { type: Type.NUMBER }
                }
              }
            },
            required: ["data", "confidence", "provider", "sourceDetails"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini Agente Extract-lead Error:", err);
      res.status(500).json({ error: "Erro na extração de lead comercial: " + err.message });
    }
  });

  // AGENTE 3 — ORÇAMENTISTA IA (por obra)
  // Rota: POST /api/ai/orcamentista
  app.post("/api/ai/orcamentista", async (req, res) => {
    const { idRefurbish, nome, cidade, estado, historico } = req.body;
    if (!idRefurbish || !historico || !Array.isArray(historico)) {
      return res.status(400).json({ error: "idRefurbish e historico (array) são obrigatórios." });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.json({
        reply: `MODO DE SIMULAÇÃO ATIVO (GEMINI KEY AUSENTE)

Analisamos a obra ${nome} em ${cidade}-${estado} de forma local.

Sugiro adicionarmos os seguintes insumos hidráulicos e estruturais de concreto usinado fck 30 MPa com base nos valores vigentes do SINAPI para Curitiba. Deseja realizar a apropriação desses custos?`,
        itens: [
          { category: "Estrutura (Concreto/Aço)", planned: 80000, actual: 78000, margin: 2000 },
          { category: "Instalações Prediais", planned: 45000, actual: 43500, margin: 1500 }
        ]
      });
    }

    try {
      const chatConversation = historico.map((m: any) => {
        const roleStr = m.role === "user" ? "user" : "model";
        return `${roleStr === "user" ? "Usuário" : "Orçamentista IA"}: ${m.content}`;
      }).join("\n\n");

      const systemInstruction = `Você é o Engenheiro Orçamentista de Elite de Curitiba Construtora.
Sua especialidade é o cálculo fino de margens de lucro, dimensionamento de insumos e tabela SINAPI regional em conformidade técnica.
Você está prestando consultoria em tempo real para a obra:
- ID: "${idRefurbish}"
- Obra: "${nome}"
- Local: "${cidade} - ${estado}"

Seu objetivo é orientar o Engenheiro Berti nas cotações. Você deve seguir estritamente um fluxo de 7 etapas obrigatórias, pedindo confirmação do desenvolvedor a cada passo e nunca pulando etapas:
- Etapa 1: Análise Estrutural — tipo de estrutura, cargas, fundação
- Etapa 2: Análise Arquitetônica — planta, ambientes, metragem, especificações
- Etapa 3: Quantitativos — tabela ITEM | UNIDADE | QUANTIDADE | VALOR UNITÁRIO
- Etapa 4: Composição de Custos — mão de obra e materiais por disciplina
- Etapa 5: BDI — percentual por categoria (padrão: 10% produto, 25% MO)
- Etapa 6: Cronograma — fases, duração estimada, dependências
- Etapa 7: JSON Final — estrutura pronta para salvar no banco

Ao final, você poderá extrair frentes de orçamento no array "itens" otimizadas para Commitar no ERP em formato estruturado. O campo 'category' deve pertencer preferencialmente às macro-categorias: "Infraestrutura & Fundação", "Estrutura (Concreto/Aço)", "Alvenarias & Divisórias", "Instalações Prediais", "Acabamentos & Revestimentos".

REGRA CRÍTICA COMPORTAMENTAL: Ao fornecer suas respostas e pareceres, NUNCA utilize formatação markdown externa. NUNCA utilize asteriscos para negrito ou numerações via markdown. Utilize apenas MAIÚSCULAS para títulos e subtítulos visuais e traço simples (-) para representar listas e itens estruturados, como se fosse um texto puro gerado para um terminal legado.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatConversation + "\n\nResponda em formato estruturado JSON com o parecer textual e eventuais insumos a commitar:",
        config: {
          systemInstruction,
          temperature: 0.3,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING, description: "O diálogo principal da Etapa atual em texto formatado APENAS com MAIÚSCULAS e traços para listas. Sem markdown." },
              itens: {
                type: Type.ARRAY,
                description: "Eventuais linhas de orçamentos macro-estruturais estimadas na conversa que o usuário pode adicionar ao seu planejamento físico-financeiro no ERP.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING, description: "Macro-categoria correspondente do orçamento ERP." },
                    planned: { type: Type.NUMBER, description: "Custo planejado total estimado em Reais" },
                    actual: { type: Type.NUMBER, description: "Gasto real consumido até o momento" },
                    margin: { type: Type.NUMBER, description: "Diferença/margem líquida em Reais" }
                  },
                  required: ["category", "planned", "actual", "margin"]
                }
              }
            },
            required: ["reply"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini Agente Orcamentista Error:", err);
      res.status(500).json({ error: "Erro de processamento no orçamento analítico: " + err.message });
    }
  });

  // AGENTE 4 — DIÁRIO DE OBRAS IA (Motor Semântico de RDO)
  // Rota: POST /api/ai/diario
  app.post("/api/ai/diario", async (req, res) => {
    const { idRefurbish, transcricao, dataReferencia } = req.body;
    if (!idRefurbish || !transcricao) {
      return res.status(400).json({ error: "idRefurbish e transcricao são obrigatórios." });
    }

    const ai = getAiClient();
    if (!ai) {
      // Simulação estruturada baseada no Motor Semântico
      return res.json({
        tipoRegistro: "AVANCO_OBRA",
        eventos: ["CONCRETAGEM_EXECUTADA", "INTERRUPCAO_POR_FALTA_MATERIAL"],
        entidades: {
          servico: "Concretagem de laje",
          pavimento: "Segundo pavimento",
          materialFaltante: "Brita"
        },
        dominios: ["PRODUCAO", "SUPRIMENTOS", "CRONOGRAMA"],
        impactos: ["Possível atraso parcial da atividade", "Interrupção operacional da equipe"],
        acoesSugeridas: ["Validar impacto no cronograma", "Registrar falta de material", "Atualizar avanço estrutural"],
        necessitaValidacaoHumana: true,
        confidenceScore: "ALTO",
        resumoOperacional: "[SIMULAÇÃO OFFLINE] Concretagem parcial executada com interrupção causada por falta de brita."
      });
    }

    try {
      const systemInstruction = `Você é o agente operacional "Diário de Obras IA" do sistema EVIS.
Sua função NÃO é conversar genericamente. Você é o motor semântico operacional da obra.
Seu papel é estruturar semanticamente informações (texto, transcrição de áudio, observações da obra) para capturar o estado real da obra.

OBJETIVOS:
1. Detectar eventos operacionais.
2. Extrair entidades relevantes.
3. Classificar o domínio do evento.
4. Identificar impactos.
5. Gerar propostas estruturadas.
6. Informar nível de confiança.
7. Solicitar validação humana quando necessário.

ENTIDADES (Extraia): serviços, equipes, materiais, pavimentos, ambientes, fornecedores, equipamentos, quantidades, datas, problemas, atrasos, retrabalhos, clima, produtividade.

DOMÍNIOS: PRODUCAO, CRONOGRAMA, FINANCEIRO, QUALIDADE, SEGURANCA, SUPRIMENTOS, CLIMA, RISCO, RETRABALHO.

REGRAS:
- Nunca invente informações ausentes.
- Quando houver baixa confiança: sinalize ambiguidade, solicite confirmação, evite decisões automáticas.
- Você NÃO PODE atualizar dados permanentemente, você apenas PROPÕE alterações.

SCORE DE CONFIANÇA: ALTO, MEDIO, BAIXO.
NÃO use markdown na resposta json.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `ID de Obra: "${idRefurbish}"\nData de Referência: "${dataReferencia || new Date().toISOString()}"\nInformação/Transcrição do campo:\n"""\n${transcricao}\n"""`,
        config: {
          systemInstruction,
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tipoRegistro: { type: Type.STRING, description: "AVANCO_OBRA, OCORRENCIA_DIARIA, ENTRADA_MATERIAL, etc." },
              eventos: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de eventos identificados formatados (ex: CONCRETAGEM_EXECUTADA)" },
              entidades: { type: Type.OBJECT, description: "Chave-valor de entidades identificadas", additionalProperties: { type: Type.STRING } },
              dominios: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Domínios classificados (PRODUCAO, CRONOGRAMA, etc)" },
              impactos: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Impactos descritivos na obra ou prazo" },
              acoesSugeridas: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Ações a realizar" },
              necessitaValidacaoHumana: { type: Type.BOOLEAN, description: "Se as alterações propostas precisam de HITL (Sempre true para ações críticas)" },
              confidenceScore: { type: Type.STRING, description: "Nível de confiança: ALTO, MEDIO, ou BAIXO" },
              resumoOperacional: { type: Type.STRING, description: "Descrição compacta e amigável da situação" }
            },
            required: ["tipoRegistro", "eventos", "entidades", "dominios", "impactos", "acoesSugeridas", "necessitaValidacaoHumana", "confidenceScore", "resumoOperacional"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini Agente Diario Motor RDO Error:", err);
      res.status(500).json({ error: "Erro de parsing do motor semântico RDO: " + err.message });
    }
  });

// ==========================================
  // ZAPPFY WHATSAPP INTEGRATIONS (OMNICHANNEL EVIS)
  // ==========================================

  // Inicializa o Motor do WhatsApp (Microservico Embutido)
  app.post("/api/whatsapp/start", async (req, res) => {
    if (wppClient && whatsappStatus === "CONNECTED") {
      return res.json({ status: whatsappStatus, message: "Já conectado." });
    }
    
    if (whatsappStatus === "INITIALIZING") {
      return res.json({ status: whatsappStatus });
    }

    whatsappStatus = "INITIALIZING";

    try {
      wppClient = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      });

      wppClient.on("qr", async (qr) => {
        whatsappStatus = "QR_READY";
        whatsappQrCodeUrl = await qrcode.toDataURL(qr);
      });

      wppClient.on("ready", () => {
        whatsappStatus = "CONNECTED";
        whatsappQrCodeUrl = "";
        console.log("WhatsApp Client is ready!");
      });

      wppClient.on("message", async (msg) => {
        // Save to our in-memory DB (simulating real DB)
        const contact = await msg.getContact();
        whatsappDB.push({
          sender: contact.name || contact.number,
          body: msg.body,
          timestamp: new Date(),
          groupId: msg.from
        });
      });

      wppClient.on("disconnected", () => {
        whatsappStatus = "DISCONNECTED";
        whatsappQrCodeUrl = "";
        wppClient = null;
      });

      wppClient.initialize().catch(err => {
        console.error("WhatsApp Init Error:", err);
        whatsappStatus = "ERROR";
      });

      res.json({ status: "INITIALIZING", message: "Inicializando navegador Chrome headless..." });
    } catch (err: any) {
      whatsappStatus = "ERROR";
      res.status(500).json({ error: err.message });
    }
  });

  // Rota para o frontend buscar o status e o QR Code
  app.get("/api/whatsapp/status", (req, res) => {
    res.json({
      status: whatsappStatus,
      qrCode: whatsappQrCodeUrl,
      messagesCount: whatsappDB.length
    });
  });

  // Rota para ler as mensagens salvas via API (Chat Interno)
  app.get("/api/whatsapp/messages", (req, res) => {
    // Retorna as ultimas 50
    res.json(whatsappDB.slice(-50));
  });

  // Função Simulada do Cron Job de Inteligência
  app.post("/api/whatsapp/cron-analyze", async (req, res) => {
    const ai = getAiClient();
    if (!ai) {
      return res.json({
         lembretes: ["Lembrete de fazer a medição (Simulado)"],
         materiais: ["Cimento CP-II (Simulado)"],
         decisoes: ["Entrega remarcada p/ 8h (Simulado)"]
      });
    }

    const messagesText = whatsappDB.slice(-50).map(m => `[${m.timestamp.toLocaleTimeString()}] ${m.sender}: ${m.body}`).join("\n");
    if (!messagesText) {
      return res.json({ message: "Nenhuma mensagem recente para analisar." });
    }

    const prompt = `Você é um assistente de engenharia civil. Leia o registro de chat abaixo entre a equipe da obra.
Extraia exatamente as seguintes informações no formato JSON com as chaves "lembretes", "materiais", e "decisoes" (arrays de string).

Mensagens:
${messagesText}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              lembretes: { type: Type.ARRAY, items: { type: Type.STRING } },
              materiais: { type: Type.ARRAY, items: { type: Type.STRING } },
              decisoes: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });
      res.json(JSON.parse(response.text || "{}"));
      // Em um cenário real faria a deleção/arquivamento das mensagens já lidas.
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.post("/api/whatsapp/send", async (req, res) => {
    const { phone, message } = req.body;
    const ZAPPFY_TOKEN = process.env.ZAPPFY_TOKEN;
  
    if (!ZAPPFY_TOKEN) {
      return res.status(500).json({ error: "Token da Zappfy não configurado no servidor" });
    }
  
    try {
      const response = await fetch("https://api.zappfy.io/send/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ZAPPFY_TOKEN}`
        },
        body: JSON.stringify({
          phone: phone,
          text: message
        }),
      });
  
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.post("/api/webhook/zappfy", express.json(), (req, res) => {
    console.log("📨 Novo Webhook recebido da Zappfy:", req.body);
    // Aqui cruzaremos o número do celular para vincular a mensagem à oportunidade respectiva do CRM.
    res.status(200).send("Webhook processado");
  });

  // AGENTE 5 — WHATSAPP ANALISADOR OMNICHANNEL (LIA)
  // Rota: POST /api/ai/whatsapp/analyze
  app.post("/api/ai/whatsapp/analyze", async (req, res) => {
    const { contactId, name, text, contextObras } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "O texto da mensagem é obrigatório." });
    }

    const ai = getAiClient();
    if (!ai) {
      // Simulação para preview offline
      return res.json({
        intent: "PROBLEMA_OBRA_SUPRIMENTO",
        confidence: 0.95,
        extractedData: {
          project_name: "Residencial Belle Vue",
          task_title: "Verificar atraso entrega cimento - " + name,
          urgency: "ALTA"
        },
        systemAction: "CREATE_TASK",
        suggestedReply: `Olá ${name}! Entendi, vou registrar aqui no sistema a urgência sobre isso para que a equipe técnica analise imediatamente.`
      });
    }

    try {
      const prompt = `Você é LIA, a assistente inteligente do sistema EVIS (ERP/CRM de Engenharia).
Você acabou de interceptar uma mensagem de WhatsApp do cliente/fornecedor/engenheiro.

Dados da Mensagem:
- Remetente: ${name}
- Mensagem recebida: "${text}"

Obras ativas no sistema: ${contextObras || 'Não informadas'}

Sua tarefa é classificar a intenção e instruir o sistema EVIS a agir automaticamente (gerar tarefa, nota ou atualizar CRM).
As systemActions são: CREATE_TASK, UPDATE_CRM_STAGE, LOG_NOTE, ou REPLY_ONLY.
A intenção pode ser: DUVIDA_GERAL, SOLICITACAO_ORCAMENTO, PROBLEMA_OBRA_SUPRIMENTO, AGENDAMENTO_VISITA, ENVIO_COMPROVANTE, ATUALIZACAO_TAREFA.

Retorne APENAS um objeto JSON válido seguindo a estrutura exata do schema de resposta. O campo 'suggestedReply' é uma resposta curta amigável que a IA daria no WhatsApp.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
             type: Type.OBJECT,
             properties: {
               intent: { type: Type.STRING },
               systemAction: { type: Type.STRING, description: "CREATE_TASK, UPDATE_CRM_STAGE, LOG_NOTE, REPLY_ONLY" },
               extractedData: {
                 type: Type.OBJECT,
                 properties: {
                   project_name: { type: Type.STRING },
                   task_title: { type: Type.STRING },
                   opportunity_title: { type: Type.STRING },
                   urgency: { type: Type.STRING, description: "ALTA, MEDIA ou BAIXA" }
                 }
               },
               suggestedReply: { type: Type.STRING },
               confidence: { type: Type.NUMBER }
             },
             required: ["intent", "systemAction", "extractedData", "suggestedReply", "confidence"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini WhatsApp Analyze Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Setup Vite Dev server or production static serving
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EVIS server running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to bootstrap EVIS server infrastructure:", error);
  process.exit(1);
});
