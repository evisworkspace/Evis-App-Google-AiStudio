import { GoogleGenAI } from "@google/genai";

/**
 * ARQUITETURA DO AGENTE WHATSAPP (LIA) - SEM CUSTOS (VIA WHATSAPP-WEB.JS / BAILEYS)
 * 
 * Como funciona o fluxo:
 * 1. O servidor Node.js cria um cliente local do WhatsApp Web.
 * 2. O usuário escaneia o QR Code gerado pelo EVIS.
 * 3. O evento `client.on('message')` intercepta todas as mensagens recebidas.
 * 4. O `WhatsappAgentPipeline` envia o texto para a IA (Lia).
 * 5. A IA devolve um JSON Estruturado.
 * 6. O EVIS executa a ação (Salvar no CRM, Criar Tarefa, Atualizar Status da Obra).
 */

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Tipagem de Intenções que a Lia consegue decodificar
export type AiIntent = 
  | "DUVIDA_GERAL"
  | "SOLICITACAO_ORCAMENTO"
  | "PROBLEMA_OBRA_SUPRIMENTO"
  | "AGENDAMENTO_VISITA"
  | "ENVIO_COMPROVANTE";

export interface AiActionTemplate {
  intent: AiIntent;
  confidence: number;
  extractedData: {
    project_name?: string;
    task_title?: string;
    urgency?: "BAIXA" | "MEDIA" | "ALTA";
    budget_value?: number;
  };
  systemAction: "CREATE_TASK" | "UPDATE_CRM_STAGE" | "LOG_NOTE" | "REPLY_ONLY";
  suggestedReply: string;
}

export async function processIncomingMessageConfig(phone: string, text: string, customerContext: any): Promise<AiActionTemplate | null> {
  try {
    // 1. Prompt estruturado instruindo a LIA a agir como o Cérebro do EVIS
    const prompt = `
      Você é LIA, a assistente inteligente do sistema EVIS (ERP/CRM de Engenharia).
      Você acabou de interceptar uma mensagem de WhatsApp do cliente/fornecedor.
      
      Dados do Remetente conhecidos no Banco:
      - Nome: ${customerContext.name}
      - Obra vinculada: ${customerContext.currentProject}
      
      Mensagem recebida: "${text}"
      
      Sua tarefa é diagnosticar sobre o que se trata o escopo da mensagem e determinar qual ação o sistema EVIS deve tomar automaticamente.
      Retorne APENAS um objeto JSON válido seguindo a estrutura:
      {
        "intent": "QUAL_A_INTENCAO",
        "systemAction": "AÇÃO_TECNICA" (CREATE_TASK, UPDATE_CRM_STAGE, LOG_NOTE, REPLY_ONLY),
        "extractedData": { "project_name": "Nome da obra", "task_title": "Titulo de tarefa resumido", "urgency": "ALTA|MEDIA|BAIXA" },
        "suggestedReply": "Uma resposta amigável em português para mandar de volta no WhatsApp"
      }
    `;

    // 2. Chamada à API da Gemini (Processamento Server-side)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) return null;

    // 3. O JSON retornado já contém a instrução exata do que o EVIS fará
    const aiDecision = JSON.parse(response.text) as AiActionTemplate;
    
    return aiDecision;

  } catch (error) {
    console.error("Erro no pipeline da Lia:", error);
    return null;
  }
}

/**
 * Função simulada do motor de execução no server.ts
 */
export async function executeAiAction(decision: AiActionTemplate) {
  if (decision.systemAction === "CREATE_TASK") {
    console.log(`[EVIS MOTOR] Criando tarefa automaticamente: ${decision.extractedData.task_title}`);
    // await db.tasks.insert({ ... })
  } else if (decision.systemAction === "UPDATE_CRM_STAGE") {
    console.log(`[EVIS MOTOR] Movendo card no Kanban CRM de Oportunidades`);
    // await db.crm.update({ ... })
  }
  
  // Após executar as rotinas silenciosas de banco de dados, enviamos a resposta gerada
  // await whatsappClient.sendMessage(phone, decision.suggestedReply);
}
