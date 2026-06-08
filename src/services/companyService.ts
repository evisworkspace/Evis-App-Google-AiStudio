import { db } from "../lib/firebase";
import {
  doc, getDoc, setDoc, collection,
  serverTimestamp
} from "firebase/firestore";

export interface CompanyData {
  name: string;
  email: string;
  plan: "essencial" | "profissional" | "premium";
  userLimit: number;
  obraLimit: number;
  configuration: Record<string, unknown>;
  onboarding: Record<string, unknown>;
  createdAt?: unknown;
  updatedAt?: unknown;
  deletedAt: null;
}

export interface CompanyMember {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isOwner: boolean;
  isActive: boolean;
  role: "owner" | "admin" | "operator" | "viewer";
  permissions: string[];
  createdAt?: unknown;
  deletedAt: null;
}

export async function createCompany(
  companyId: string,
  data: Omit<CompanyData, "createdAt" | "updatedAt">,
  owner: { uid: string; name: string; email: string; avatarUrl?: string | null }
): Promise<void> {
  await setDoc(doc(db, "companies", companyId), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await setDoc(doc(db, "companies", companyId, "users", owner.uid), {
    uid: owner.uid,
    name: owner.name || owner.email,
    email: owner.email,
    avatarUrl: owner.avatarUrl || null,
    isOwner: true,
    isActive: true,
    role: "owner",
    permissions: ["*"],
    createdAt: serverTimestamp(),
    deletedAt: null,
  } as CompanyMember);
}

export async function getCompany(companyId: string): Promise<CompanyData | null> {
  const snap = await getDoc(doc(db, "companies", companyId));
  return snap.exists() ? (snap.data() as CompanyData) : null;
}
