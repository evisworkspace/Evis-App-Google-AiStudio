import { db } from "../lib/firebase";
import {
    collection,
    doc,
    getDocs,
    serverTimestamp,
    setDoc,
    updateDoc,
    query,
    orderBy,
    limit,
} from "firebase/firestore";
import type { LancamentoFinanceiro } from "../types";

type LancamentoDocument = LancamentoFinanceiro & {
    createdAt?: unknown;
    updatedAt?: unknown;
    deletedAt?: unknown;
};

function lancamentosCollection(companyId: string) {
    return collection(db, "companies", companyId, "lancamentos");
}

export async function getLancamentos(companyId: string): Promise<LancamentoFinanceiro[]> {
    const q = query(lancamentosCollection(companyId), orderBy("date", "desc"), limit(200));
    const snap = await getDocs(q);
    return snap.docs
        .map((d) => {
            const data = d.data() as LancamentoDocument;
            return { ...data, id: data.id || d.id };
        })
        .filter((l) => l.deletedAt === null || l.deletedAt === undefined);
}

export async function createLancamento(
    companyId: string,
    data: LancamentoFinanceiro
): Promise<void> {
    await setDoc(doc(db, "companies", companyId, "lancamentos", data.id), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
    });
}

export async function softDeleteLancamento(companyId: string, lancamentoId: string): Promise<void> {
    await updateDoc(doc(db, "companies", companyId, "lancamentos", lancamentoId), {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}
