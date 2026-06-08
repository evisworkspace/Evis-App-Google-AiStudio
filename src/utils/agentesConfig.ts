import React from "react";
import { 
  Bot, Briefcase, ShieldAlert, Users, Calculator, 
  Clock, ClipboardList, ShoppingCart, Boxes, 
  DollarSign, PieChart, FileText, Calendar, Zap 
} from "lucide-react";

export type AgentId = 
  | "ag-eva" 
  | "ag-sentinela" 
  | "ag-lia" 
  | "ag-otto" 
  | "ag-cronos" 
  | "ag-diario" 
  | "ag-nina" 
  | "ag-radar" 
  | "ag-vera" 
  | "ag-auditor" 
  | "ag-dora" 
  | "ag-agenda" 
  | "ag-automador";

export interface AgentProfile {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  icon: React.ComponentType<any>;
  themeColor: "indigo" | "rose" | "emerald" | "amber" | "blue" | "purple" | "slate";
}

export const AGENT_PROFILES: Record<AgentId, AgentProfile> = {
  "ag-eva": { id: "ag-eva", name: "EVA", role: "EVA Executiva", description: "Mestra de aprovações e resumo executivo", icon: Briefcase, themeColor: "indigo" },
  "ag-sentinela": { id: "ag-sentinela", name: "Sentinela", role: "Sentinela de Riscos", description: "Compliance, riscos críticos e auditoria cruzada", icon: ShieldAlert, themeColor: "rose" },
  "ag-lia": { id: "ag-lia", name: "Lia", role: "Lia Comercial", description: "CRM, follow-up com clientes e negociações", icon: Users, themeColor: "blue" },
  "ag-otto": { id: "ag-otto", name: "Otto", role: "Otto Orçamentista", description: "BIM 5D, orçamentos e memórias de cálculo", icon: Calculator, themeColor: "slate" },
  "ag-cronos": { id: "ag-cronos", name: "Cronos", role: "Cronos Planejador", description: "BIM 4D, cronogramas e alertas de atrasos", icon: Clock, themeColor: "amber" },
  "ag-diario": { id: "ag-diario", name: "Diário IA", role: "Diário de Obra IA", description: "Geração de RDOs a partir de áudios e imagens", icon: ClipboardList, themeColor: "emerald" },
  "ag-nina": { id: "ag-nina", name: "Nina", role: "Nina Compras", description: "Cotações ativas, mapas comparativos e fornecedores", icon: ShoppingCart, themeColor: "amber" },
  "ag-radar": { id: "ag-radar", name: "Radar", role: "Radar de Insumos", description: "Lead time, curva ABC e tendências de custo", icon: Boxes, themeColor: "blue" },
  "ag-vera": { id: "ag-vera", name: "Vera", role: "Vera Financeira", description: "Otimização de fluxo de caixa, pagamentos e recebimentos", icon: DollarSign, themeColor: "emerald" },
  "ag-auditor": { id: "ag-auditor", name: "Auditor", role: "Auditor de Margem", description: "Proteção de margem de lucro e custo indireto", icon: PieChart, themeColor: "rose" },
  "ag-dora": { id: "ag-dora", name: "Dora", role: "Dora Documentos", description: "Gestão documental, OCR e identificação de LGPD", icon: FileText, themeColor: "slate" },
  "ag-agenda": { id: "ag-agenda", name: "Agenda", role: "Agenda Inteligente", description: "Resolução de conflitos de cronograma e reuniões", icon: Calendar, themeColor: "blue" },
  "ag-automador": { id: "ag-automador", name: "Automador", role: "Automador EVIS", description: "Workflows automáticos e integrações de sistema", icon: Zap, themeColor: "purple" },
};

export const getAgentProfile = (id: string): AgentProfile => {
  return AGENT_PROFILES[id as AgentId] || { id: "ag-unknown" as AgentId, name: "Assistente", role: "Assistente IA", description: "Assistente de uso geral EVIS", icon: Bot, themeColor: "slate" };
};

export const getAgentProfileByRole = (role: string): AgentProfile => {
  const profile = Object.values(AGENT_PROFILES).find(p => role.toLowerCase().includes(p.name.toLowerCase()));
  return profile || { id: "ag-unknown" as AgentId, name: "Assistente", role: "Assistente IA", description: "Assistente de uso geral EVIS", icon: Bot, themeColor: "slate" };
};
