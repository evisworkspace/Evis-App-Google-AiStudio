import { db } from "../lib/firebase";
import {
    collection,
    doc,
    getDocs,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import type { Obra } from "../types";

type ObraDocument = Obra & {
    createdAt?: unknown;
    updatedAt?: unknown;
    deletedAt?: unknown;
};

type ObraInput = Omit<Obra, "id" | "obraId"> & {
    id?: string;
    obraId?: string;
};

function obrasCollection(companyId: string) {
    return collection(db, "companies", companyId, "obras");
}

function removeUndefined<T extends Record<string, unknown>>(data: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
    ) as Partial<T>;
}

export async function createObra(companyId: string, data: ObraInput): Promise<Obra> {
    const ref = data.id ? doc(db, "companies", companyId, "obras", data.id) : doc(obrasCollection(companyId));
    const obra: Obra = {
        ...data,
        id: ref.id,
        obraId: data.obraId || ref.id,
    };

    await setDoc(ref, {
        ...removeUndefined(obra as unknown as Record<string, unknown>),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
    });

    return obra;
}

export async function getObras(companyId: string): Promise<Obra[]> {
    const snap = await getDocs(obrasCollection(companyId));

    return snap.docs
        .map((documentSnapshot) => {
            const data = documentSnapshot.data() as ObraDocument;
            return {
                ...data,
                id: data.id || documentSnapshot.id,
                obraId: data.obraId || data.id || documentSnapshot.id,
            };
        })
        .filter((obra) => obra.deletedAt === null || obra.deletedAt === undefined);
}

export async function updateObra(
    companyId: string,
    obraId: string,
    data: Partial<ObraInput>
): Promise<void> {
    await updateDoc(doc(db, "companies", companyId, "obras", obraId), {
        ...removeUndefined(data as Record<string, unknown>),
        updatedAt: serverTimestamp(),
    });
}

export async function softDeleteObra(companyId: string, obraId: string): Promise<void> {
    await updateDoc(doc(db, "companies", companyId, "obras", obraId), {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}
