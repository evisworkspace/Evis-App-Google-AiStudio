import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../lib/auth";
import { createCompany } from "../services/companyService";
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
  INITIAL_OBRAS,
  INITIAL_OPORTUNIDADES,
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
  setCurrentRoute: (route: MenuRoute) => void;
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
  addOportunidade: (title: string, client: string, value: number, initialStage: Oportunidade["stage"]) => void;

  // Premium Toast System
  toasts: Toast[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;

  activeSubTab: string;
  setActiveSubTab: (tab: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(
    () => localStorage.getItem("evis_company_id")
  );
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentRoute, setCurrentRoute] = useState<MenuRoute>("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("ob_1");
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

  // Domain states
  const [obras, setObras] = useState<Obra[]>(INITIAL_OBRAS);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>(INITIAL_OPORTUNIDADES);
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>(INITIAL_LANCAMENTOS);
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(INITIAL_PURCHASES);
  const [insumos, setInsumos] = useState<Insumo[]>(INITIAL_INSUMOS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const getActiveProject = () => {
    return obras.find((o) => o.id === selectedProjectId) || obras[0];
  };

  const addRdo = (obraId: string, weather: string, workers: number, progressNote: string, observations: string) => {
    setObras((prev) =>
      prev.map((o) => {
        if (o.id === obraId) {
          const newRdo = {
            id: `rdo_${Date.now()}`,
            date: new Date().toISOString().split("T")[0],
            weather,
            workers,
            progressNote,
            observations,
          };
          return {
            ...o,
            rdoList: [newRdo, ...o.rdoList],
          };
        }
        return o;
      })
    );
  };

  const addMedicao = (obraId: string, amount: number, description: string) => {
    setObras((prev) =>
      prev.map((o) => {
        if (o.id === obraId) {
          const newMedicao = {
            id: `med_${Date.now()}`,
            date: new Date().toISOString().split("T")[0],
            amount,
            description,
            status: "Pendente" as const,
          };
          return {
            ...o,
            medicoesList: [newMedicao, ...o.medicoesList],
          };
        }
        return o;
      })
    );
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
            return {
              ...o,
              budgetSpent: o.budgetSpent + amount,
              progress: Math.min(Math.round(((o.budgetSpent + amount) / o.budgetTotal) * 100), 100),
            };
          }
          return o;
        })
      );
    }
  };

  const addOportunidade = (title: string, client: string, value: number, initialStage: Oportunidade["stage"]) => {
    const newOp: Oportunidade = {
      id: `op_${Date.now()}`,
      title,
      client,
      value,
      stage: initialStage,
      date: new Date().toISOString().split("T")[0],
      owner: "Eng. Berti",
      probability: initialStage === "Ganho" ? 100 : initialStage === "Negociação" ? 75 : 50,
    };
    setOportunidades((prev) => [newOp, ...prev]);
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
        setCurrentRoute,
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
