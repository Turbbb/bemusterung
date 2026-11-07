import { useCallback, useEffect, useRef, useState } from "react";
import { catalog } from "@/data";
import type { Selection } from "@/data/schemas";
import { generateVisual } from "@/lib/visualizeApi";
import { getImage, visualKey } from "@/lib/visualStore";

export type VisualStatus = "idle" | "loading" | "error";

export interface DemoState {
  done: number;
  total: number;
  error: string | null;
}

const options = (categoryId: string) => catalog.categories.find((c) => c.id === categoryId)?.options ?? [];
const bodenOptions = options("boden");
const wandOptions = options("wand");

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : "Das Raumbild konnte nicht erzeugt werden.");

/**
 * Raumbild zur Auswahl: erst aus IndexedDB, sonst per /api/visualize.
 * Die Standardauswahl entspricht dem Basisbild und wird nicht automatisch erzeugt.
 */
export function useRoomVisual(roomId: string, selection: Selection, enabled: boolean) {
  const bodenId = selection.boden;
  const wandId = selection.wand;
  const key = visualKey(roomId, bodenId, wandId);
  const defaultKey = visualKey(roomId, bodenOptions[0].id, wandOptions[0].id);

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<VisualStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState<DemoState | null>(null);

  const keyRef = useRef(key);
  const urlRef = useRef<string | null>(null);
  const aliveRef = useRef(true);

  const showBlob = useCallback((blob: Blob | null) => {
    const old = urlRef.current;
    // Verzögert freigeben, damit die Überblendung das alte Bild noch zeigen kann.
    if (old) setTimeout(() => URL.revokeObjectURL(old), 1000);
    urlRef.current = blob ? URL.createObjectURL(blob) : null;
    setImageUrl(urlRef.current);
  }, []);

  const run = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const blob = await generateVisual(roomId, bodenId, wandId);
      if (keyRef.current === key) {
        showBlob(blob);
        setStatus("idle");
      }
    } catch (e) {
      if (keyRef.current === key) {
        setError(errorMessage(e));
        setStatus("error");
      }
    }
  }, [roomId, bodenId, wandId, key, showBlob]);

  useEffect(() => {
    keyRef.current = key;
    showBlob(null);
    setError(null);
    setStatus("idle");
    if (!enabled) return;

    let cancelled = false;
    getImage(key).then((blob) => {
      if (cancelled) return;
      if (blob) showBlob(blob);
      else if (key !== defaultKey) void run();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const prepareDemo = useCallback(async () => {
    const combos = bodenOptions.flatMap((b) => wandOptions.map((w) => [b.id, w.id] as const));
    const total = combos.length;
    let done = 0;
    setDemo({ done, total, error: null });

    for (const [b, w] of combos) {
      if (!aliveRef.current) return;
      try {
        const k = visualKey(roomId, b, w);
        const blob = (await getImage(k)) ?? (await generateVisual(roomId, b, w));
        if (aliveRef.current && keyRef.current === k) {
          showBlob(blob);
          setStatus("idle");
          setError(null);
        }
      } catch (e) {
        if (aliveRef.current) setDemo({ done, total, error: errorMessage(e) });
        return;
      }
      done += 1;
      if (aliveRef.current) setDemo({ done, total, error: null });
    }
  }, [roomId, showBlob]);

  const demoRunning = demo !== null && demo.error === null && demo.done < demo.total;

  return { imageUrl, status, error, retry: run, demo, demoRunning, prepareDemo };
}
