import { db } from "../lib/firebase";
import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import type { MemoryEvent, ImportRun } from "../types";

function memoryEventsCol(userId: string) {
  return collection(db, "users", userId, "memory_events");
}

function importRunsCol(userId: string) {
  return collection(db, "users", userId, "import_runs");
}

export async function getMemoryEvents(userId: string): Promise<MemoryEvent[]> {
  const q = query(memoryEventsCol(userId), orderBy("eventDate", "desc"), limit(500));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ ...d.data(), id: d.id } as MemoryEvent))
    .filter((e) => !e.deletedAt);
}

export async function getExistingHashes(userId: string): Promise<Set<string>> {
  const snap = await getDocs(memoryEventsCol(userId));
  const hashes = new Set<string>();
  snap.docs.forEach((d) => {
    const data = d.data() as MemoryEvent;
    if (data.contentHash && !data.deletedAt) hashes.add(data.contentHash);
  });
  return hashes;
}

export async function batchCreateMemoryEvents(
  userId: string,
  events: Omit<MemoryEvent, "id">[]
): Promise<string[]> {
  const ids: string[] = [];
  const CHUNK = 499;
  for (let i = 0; i < events.length; i += CHUNK) {
    const chunk = events.slice(i, i + CHUNK);
    const batch = writeBatch(db);
    for (const event of chunk) {
      const ref = doc(memoryEventsCol(userId));
      batch.set(ref, {
        ...event,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        deletedAt: null,
      });
      ids.push(ref.id);
    }
    await batch.commit();
  }
  return ids;
}

export async function getImportRuns(userId: string): Promise<ImportRun[]> {
  const q = query(importRunsCol(userId), orderBy("startedAt", "desc"), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as ImportRun));
}

export async function createImportRun(
  userId: string,
  run: Omit<ImportRun, "id">
): Promise<ImportRun> {
  const ref = await addDoc(importRunsCol(userId), {
    ...run,
    createdAt: serverTimestamp(),
  });
  return { ...run, id: ref.id };
}

export async function deleteAllUserData(userId: string): Promise<void> {
  const [eventsSnap, runsSnap] = await Promise.all([
    getDocs(memoryEventsCol(userId)),
    getDocs(importRunsCol(userId)),
  ]);
  const allDocs = [...eventsSnap.docs, ...runsSnap.docs];
  const CHUNK = 499;
  for (let i = 0; i < allDocs.length; i += CHUNK) {
    const batch = writeBatch(db);
    allDocs.slice(i, i + CHUNK).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}
