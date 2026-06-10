import { db } from "../lib/firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import type { AgentMessage } from "../types";

function maestroMessagesCol(companyId: string) {
  return collection(db, "companies", companyId, "maestro_messages");
}

export async function getMaestroMessages(companyId: string): Promise<AgentMessage[]> {
  const q = query(maestroMessagesCol(companyId), orderBy("timestamp", "desc"), limit(100));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id } as AgentMessage))
    .filter((m) => m.deletedAt === null || m.deletedAt === undefined);
}

export async function createMaestroMessage(
  companyId: string,
  message: Omit<AgentMessage, "id">
): Promise<AgentMessage> {
  const ref = await addDoc(maestroMessagesCol(companyId), {
    ...message,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    deletedAt: null,
  });
  return { ...message, id: ref.id };
}

export async function softDeleteMaestroMessage(
  companyId: string,
  messageId: string
): Promise<void> {
  await updateDoc(doc(db, "companies", companyId, "maestro_messages", messageId), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

const MOCK_MESSAGES: Omit<AgentMessage, "id" | "timestamp">[] = [
  {
    agentId: "ag-cronos",
    agentName: "Cronos",
    avatar: "amber",
    scope: "obra",
    obraId: "ob_1",
    severity: "alerta",
    text: "A concretagem da laje do 13º nível está prevista para 12/06, mas a locação da grua vence dia 10/06. Sem renovação, o cronograma do Residencial Belle Vue atrasa 4 dias úteis.",
    actions: [
      { id: "act_ver_tarefas", label: "Ver tarefas da obra", route: "tarefas" },
      { id: "act_ver_obra", label: "Abrir obra", route: "obra-detail" },
    ],
  },
  {
    agentId: "ag-vera",
    agentName: "Vera",
    avatar: "emerald",
    scope: "global",
    severity: "info",
    text: "Fluxo de caixa consolidado da semana fechou positivo: R$ 1,46 mi de receitas realizadas contra R$ 285 mil de despesas. A medição pendente de R$ 520 mil entra na projeção de 15/06.",
    actions: [
      { id: "act_fluxo", label: "Ver fluxo de caixa", route: "financeiro-fluxo-de-caixa" },
    ],
  },
  {
    agentId: "ag-sentinela",
    agentName: "Sentinela",
    avatar: "rose",
    scope: "obra",
    obraId: "ob_2",
    severity: "critico",
    text: "Residencial Kairo: categoria Fundações & Estacas estourou o planejado em R$ 240 mil (-4,4%) e a licença ambiental de instalação vence em 30 dias. Risco combinado de custo e compliance.",
    actions: [
      { id: "act_dre", label: "Abrir DRE da obra", route: "financeiro-dre" },
      { id: "act_obra_kairo", label: "Ver obra", route: "obra-detail" },
    ],
  },
];

export async function seedMockMaestroMessages(companyId: string): Promise<AgentMessage[]> {
  const created: AgentMessage[] = [];
  const base = Date.now();
  for (let i = 0; i < MOCK_MESSAGES.length; i++) {
    const message: Omit<AgentMessage, "id"> = {
      ...MOCK_MESSAGES[i],
      timestamp: new Date(base - (MOCK_MESSAGES.length - 1 - i) * 1000 * 60 * 17).toISOString(),
    };
    created.push(await createMaestroMessage(companyId, message));
  }
  return created;
}
