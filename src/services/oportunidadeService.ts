import { db } from "../lib/firebase";
import {
    collection,
    doc,
    getDocs,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import type { Oportunidade } from "../types";

type OportunidadeDocument = Oportunidade & {
    createdAt?: unknown;
    updatedAt?: unknown;
    deletedAt?: unknown;
};

type OportunidadeInput = Omit<Oportunidade, "id">;

function oportunidadesCollection(companyId: string) {
    return collection(db, "companies", companyId, "oportunidades");
}

function removeUndefined<T extends Record<string, unknown>>(data: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
    ) as Partial<T>;
}

export async function createOportunidade(
    companyId: string,
    data: OportunidadeInput
): Promise<Oportunidade> {
    const ref = doc(oportunidadesCollection(companyId));
    const oportunidade: Oportunidade = {
        id: ref.id,
        ...data,
    };

    await setDoc(ref, {
        ...removeUndefined(oportunidade as unknown as Record<string, unknown>),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
    });

    return oportunidade;
}

export async function getOportunidades(companyId: string): Promise<Oportunidade[]> {
    const snap = await getDocs(oportunidadesCollection(companyId));

    return snap.docs
        .map((documentSnapshot) => {
            const data = documentSnapshot.data() as OportunidadeDocument;
            return {
                ...data,
                id: data.id || documentSnapshot.id,
            };
        })
        .filter((oportunidade) => oportunidade.deletedAt === null || oportunidade.deletedAt === undefined);
}

export async function updateOportunidade(
    companyId: string,
    oportunidadeId: string,
    data: Partial<OportunidadeInput>
): Promise<void> {
    await updateDoc(doc(db, "companies", companyId, "oportunidades", oportunidadeId), {
        ...removeUndefined(data as Record<string, unknown>),
        updatedAt: serverTimestamp(),
    });
}

export async function softDeleteOportunidade(
    companyId: string,
    oportunidadeId: string
): Promise<void> {
    await updateDoc(doc(db, "companies", companyId, "oportunidades", oportunidadeId), {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}
