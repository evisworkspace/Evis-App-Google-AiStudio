import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../lib/auth";
import { createOportunidade, getOportunidades } from "../services/oportunidadeService";
import { getObras, updateObra } from "../services/obraService";
import {
  Obra,
  Oportunidade,
  BankAccount,
  LancamentoFinanceiro,
  PurchaseOrder,
  Insumo,
  Task,
  MenuRoute,
  AppTheme,
  INITIAL_ACCOUNTS,
  INITIAL_LANCAMENTOS,
  INITIAL_PURCHASES,
  INITIAL_INSUMOS,
  INITIAL_TASKS,
} from "../types";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface AppContextType {
  currentUser: User | null;
  authLoading: boolean;
  companyId: string | null;
  setCompanyId: (id: string | null) => void;
  needsOnboarding: boolean;
  setNeedsOnboarding: (v: boolean) => void;

  // Navigation & Shell Layout
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentRoute: MenuRoute;
  activeRoute: MenuRoute;
  setCurrentRoute: (route: MenuRoute) => void;
  navigate: (route: MenuRoute) => void;
  isWhatsAppOpen: boolean;
  setIsWhatsAppOpen: (open: boolean) => void;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;

  // Active states
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  getActiveProject: () => Obra;

  // Core Business entities
  obras: Obra[];
  setObras: React.Dispatch<React.SetStateAction<Obra[]>>;
  oportunidades: Oportunidade[];
  setOportunidades: React.Dispatch<React.SetStateAction<Oportunidade[]>>;
  accounts: BankAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  lancamentos: LancamentoFinanceiro[];
  setLancamentos: React.Dispatch<React.SetStateAction<LancamentoFinanceiro[]>>;
  purchases: PurchaseOrder[];
  setPurchases: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  insumos: Insumo[];
  setInsumos: React.Dispatch<React.SetStateAction<Insumo[]>>;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;

  // In-app Action helpers
  addRdo: (obraId: string, weather: string, workers: number, progressNote: string, observations: string) => void;
  addMedicao: (obraId: string, amount: number, description: string) => void;
  addLancamento: (description: string, amount: number, type: "receita" | "despesa", category: string, bankAccountId: string, projectId?: string) => void;
  addOportunidade: (title: string, client: string, value: number, initialStage: Oportunidade["stage"], probability?: number) => Promise<Oportunidade | null>;

  // Premium Toast System
  toasts: Toast[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;

  activeSubTab: string;
  setActiveSubTab: (tab: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const EMPTY_OBRA: Obra = {
  id: "",
  obraId: "",
  name: "Nenhuma obra selecionada",
  location: "",
  description: "",
  progress: 0,
  budgetTotal: 0,
  budgetSpent: 0,
  status: "Planejamento",
  startDate: "",
  endDate: "",
  manager: "",
  equipe: [],
  documentos: [],
  rdoList: [],
  medicoesList: [],
  orcamentoInsumos: [],
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(
    () => localStorage.getItem("evis_company_id")
  );
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<MenuRoute>("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [activeSubTab, setActiveSubTab] = useState<string>("geral");

  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem("evis_theme") as AppTheme;
    return saved === "claro" || saved === "escuro" || saved === "hibrido" ? saved : "claro";
  });

  useEffect(() => {
    localStorage.setItem("evis_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setNeedsOnboarding(false);
      return;
    }
    const stored = localStorage.getItem("evis_company_id");
    if (stored) {
      setCompanyId(stored);
      setNeedsOnboarding(false);
    } else {
      setNeedsOnboarding(true);
    }
  }, [currentUser]);

  const setTheme = (t: AppTheme) => {
    setThemeState(t);
  };

  const navigate = useCallback((route: MenuRoute) => {
    setCurrentRoute(route);
  }, []);

  // Domain states
  const [obras, setObras] = useState<Obra[]>([]);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>(INITIAL_LANCAMENTOS);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(INITIAL_PURCHASES);
  const [insumos, setInsumos] = useState<Insumo[]>(INITIAL_INSUMOS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  useEffect(() => {
    let cancelled = false;

    if (!companyId) {
      setObras([]);
      setOportunidades([]);
      setSelectedProjectId("");
      return;
    }

    const loadFirestoreData = async () => {
      try {
        const [loadedObras, loadedOportunidades] = await Promise.all([
          getObras(companyId),
          getOportunidades(companyId),
        ]);

        if (cancelled) return;

        setObras(loadedObras);
        setOportunidades(loadedOportunidades);
        setSelectedProjectId((current) => {
          if (current && loadedObras.some((obra) => obra.id === current)) return current;
          return loadedObras[0]?.id || "";
        });
      } catch (error) {
        console.error("Erro ao carregar dados do Firestore:", error);
      }
    };

    loadFirestoreData();

    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const getActiveProject = () => {
    return obras.find((o) => o.id === selectedProjectId) || obras[0] || EMPTY_OBRA;
  };

  const addRdo = (obraId: string, weather: string, workers: number, progressNote: string, observations: string) => {
    const obraAtual = obras.find((o) => o.id === obraId);
    const newRdo = {
      id: `rdo_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      weather,
      workers,
      progressNote,
      observations,
    };

    setObras((prev) =>
      prev.map((o) => {
        if (o.id === obraId) {
          return {
            ...o,
            rdoList: [newRdo, ...o.rdoList],
          };
        }
        return o;
      })
    );

    if (companyId && obraAtual) {
      updateObra(companyId, obraId, { rdoList: [newRdo, ...obraAtual.rdoList] }).catch((error) => {
        console.error("Erro ao persistir RDO:", error);
      });
    }
  };

  const addMedicao = (obraId: string, amount: number, description: string) => {
    const obraAtual = obras.find((o) => o.id === obraId);
    const newMedicao = {
      id: `med_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      amount,
      description,
      status: "Pendente" as const,
    };

    setObras((prev) =>
      prev.map((o) => {
        if (o.id === obraId) {
          return {
            ...o,
            medicoesList: [newMedicao, ...o.medicoesList],
          };
        }
        return o;
      })
    );

    if (companyId && obraAtual) {
      updateObra(companyId, obraId, { medicoesList: [newMedicao, ...obraAtual.medicoesList] }).catch((error) => {
        console.error("Erro ao persistir medição:", error);
      });
    }
  };

  const addLancamento = (
    description: string,
    amount: number,
    type: "receita" | "despesa",
    category: string,
    bankAccountId: string,
    projectId?: string
  ) => {
    const newLancamento: LancamentoFinanceiro = {
      id: `lan_${Date.now()}`,
      description,
      amount,
      type,
      category,
      date: new Date().toISOString().split("T")[0],
      bankAccount: bankAccountId,
      status: "Realizado",
      project: projectId,
    };

    setLancamentos((prev) => [newLancamento, ...prev]);

    // Update corresponding Bank Account balance automatically
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) => {
        if (acc.id === bankAccountId) {
          const delta = type === "receita" ? amount : -amount;
          return {
            ...acc,
            balance: acc.balance + delta,
          };
        }
        return acc;
      })
    );

    // If linked to a project, update project spent budget
    if (projectId && type === "despesa") {
      setObras((prevObras) =>
        prevObras.map((o) => {
          if (o.id === projectId) {
            const updatedObra = {
              ...o,
              budgetSpent: o.budgetSpent + amount,
              progress: Math.min(Math.round(((o.budgetSpent + amount) / o.budgetTotal) * 100), 100),
            };
            if (companyId) {
              updateObra(companyId, o.id, {
                budgetSpent: updatedObra.budgetSpent,
                progress: updatedObra.progress,
              }).catch((error) => {
                console.error("Erro ao persistir orçamento da obra:", error);
              });
            }
            return {
              ...updatedObra,
            };
          }
          return o;
        })
      );
    }
  };

  const addOportunidade = async (
    title: string,
    client: string,
    value: number,
    initialStage: Oportunidade["stage"],
    probability?: number
  ) => {
    if (!companyId) {
      throw new Error("Empresa não selecionada para salvar a oportunidade.");
    }

    const owner = currentUser?.displayName || currentUser?.email || "Usuário EVIS";
    const newOp: Oportunidade = {
      id: "",
      title,
      client,
      value,
      stage: initialStage,
      date: new Date().toISOString().split("T")[0],
      owner,
      probability: probability ?? (initialStage === "Ganho" ? 100 : initialStage === "Negociação" ? 75 : 50),
    };

    const created = await createOportunidade(companyId, newOp);
    setOportunidades((prev) => [created, ...prev]);
    return created;
  };

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = `toast_${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        authLoading,
        companyId,
        setCompanyId,
        needsOnboarding,
        setNeedsOnboarding,
        sidebarOpen,
        setSidebarOpen,
        currentRoute,
        activeRoute: currentRoute,
        setCurrentRoute,
        navigate,
        isWhatsAppOpen,
        setIsWhatsAppOpen,
        theme,
        setTheme,
        selectedProjectId,
        setSelectedProjectId,
        activeSubTab,
        setActiveSubTab,
        getActiveProject,
        obras,
        setObras,
        oportunidades,
        setOportunidades,
        accounts,
        setAccounts,
        lancamentos,
        setLancamentos,
        purchases,
        setPurchases,
        insumos,
        setInsumos,
        tasks,
        setTasks,
        addRdo,
        addMedicao,
        addLancamento,
        addOportunidade,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
