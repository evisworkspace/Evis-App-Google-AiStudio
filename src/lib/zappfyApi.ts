export interface ZappfyMessagePayload {
  phone: string;
  message: string;
}

/**
 * Serviço de integração com Zappfy API para envio de mensagens via WhatsApp
 * Transposição do módulo 'disparo.py' da arquitetura original.
 */

// A chave será buscada em tempo de execução via backend proxy, para não expor tokens no frontend
export async function sendWhatsAppMessage(payload: ZappfyMessagePayload) {
  try {
    // Faremos o proxy via backend para ocultar a chave Zappfy no server.ts em producao
    const response = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erro ao enviar mensagem: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erro no Zappfy API:", error);
    throw error;
  }
}
