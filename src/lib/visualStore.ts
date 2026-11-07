const DB_NAME = "raumwerk-visuals";
const STORE = "images";

const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const visualKey = (roomId: string, bodenId: string, wandId: string) => `${roomId}|${bodenId}|${wandId}`;

/** Liefert ein gespeichertes Bild oder undefined (auch wenn IndexedDB nicht verfügbar ist). */
export async function getImage(key: string): Promise<Blob | undefined> {
  try {
    const db = await openDb();
    return await new Promise<Blob | undefined>((resolve, reject) => {
      const request = db.transaction(STORE).objectStore(STORE).get(key);
      request.onsuccess = () => resolve(request.result as Blob | undefined);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return undefined;
  }
}

export async function putImage(key: string, blob: Blob): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(blob, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Speichern ist nur ein Cache – ohne IndexedDB wird einfach neu erzeugt.
  }
}
