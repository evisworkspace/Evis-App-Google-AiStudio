import { db } from "../lib/firebase";
import {
    collection,
    doc,
    getDocs,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";

export interface Cliente {
    id: string;
    name: string;
    cnpj: string;
    type: string;
    contracts: number;
    email?: string;
    phone?: string;
    createdAt?: unknown;
    updatedAt?: unknown;
    deletedAt?: unknown;
}

type ClienteInput = Omit<Cliente, "id" | "createdAt" | "updatedAt" | "deletedAt">;

function clientesCollection(companyId: string) {
    return collection(db, "companies", companyId, "clientes");
}

function removeUndefined<T extends Record<string, unknown>>(data: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(data).filter(([, value]) => value !== undefined)
    ) as Partial<T>;
}

export async function createCliente(companyId: string, data: ClienteInput): Promise<Cliente> {
    const ref = doc(clientesCollection(companyId));
    const cliente: Cliente = {
        id: ref.id,
        ...data,
    };

    await setDoc(ref, {
        ...removeUndefined(cliente as unknown as Record<string, unknown>),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
    });

    return cliente;
}

export async function getClientes(companyId: string): Promise<Cliente[]> {
    const snap = await getDocs(clientesCollection(companyId));

    return snap.docs
        .map((documentSnapshot) => {
            const data = documentSnapshot.data() as Cliente;
            return {
                ...data,
                id: data.id || documentSnapshot.id,
            };
        })
        .filter((cliente) => cliente.deletedAt === null || cliente.deletedAt === undefined);
}

export async function updateCliente(
    companyId: string,
    clienteId: string,
    data: Partial<ClienteInput>
): Promise<void> {
    await updateDoc(doc(db, "companies", companyId, "clientes", clienteId), {
        ...removeUndefined(data as Record<string, unknown>),
        updatedAt: serverTimestamp(),
    });
}

export async function softDeleteCliente(companyId: string, clienteId: string): Promise<void> {
    await updateDoc(doc(db, "companies", companyId, "clientes", clienteId), {
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}
