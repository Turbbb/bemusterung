import { putImage, visualKey } from "./visualStore";

const inflight = new Map<string, Promise<Blob>>();

/** Fragt /api/visualize an und speichert das Bild. Gleiche Kombinationen laufen nur einmal gleichzeitig. */
export function generateVisual(roomId: string, bodenId: string, wandId: string): Promise<Blob> {
  const key = visualKey(roomId, bodenId, wandId);
  const running = inflight.get(key);
  if (running) return running;

  const promise = (async () => {
    let response: Response;
    try {
      response = await fetch("/api/visualize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raumId: roomId, bodenId, wandId }),
      });
    } catch {
      throw new Error("Keine Verbindung zum Server. Bitte Internetverbindung prüfen.");
    }

    if (!response.ok) {
      let message = "Das Raumbild konnte nicht erzeugt werden.";
      try {
        const data = await response.json();
        if (typeof data?.message === "string") message = data.message;
      } catch {
        // keine JSON-Antwort – allgemeine Meldung bleibt
      }
      throw new Error(message);
    }

    if (!response.headers.get("content-type")?.startsWith("image/")) {
      throw new Error("Die Visualisierung ist hier nicht verfügbar (Serverfunktion nicht erreichbar).");
    }

    const blob = await response.blob();
    await putImage(key, blob);
    return blob;
  })().finally(() => inflight.delete(key));

  inflight.set(key, promise);
  return promise;
}
