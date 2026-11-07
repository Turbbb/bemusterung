import type { IncomingMessage, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import houseJson from "../src/data/houseMainz.json";
import catalogJson from "../src/data/catalog.json";

// Vercel: Bildgenerierung dauert länger als das Standardlimit.
export const config = { maxDuration: 60 };

type Req = IncomingMessage & { body?: unknown };

interface Asset {
  base64: string;
  mime: string;
}

interface Option {
  id: string;
  name: string;
  swatch?: string;
  texture?: string;
}

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function sendError(res: ServerResponse, status: number, message: string) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify({ message }));
}

function parseBody(req: Req): Record<string, unknown> | null {
  try {
    const raw = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    return raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Lädt eine Datei aus public/ – lokal von der Platte, sonst über die eigene Domain (Vercel). */
async function loadAsset(req: Req, urlPath: string): Promise<Asset | null> {
  const publicDir = path.resolve(process.cwd(), "public");
  const filePath = path.resolve(publicDir, "." + urlPath);
  if (!filePath.startsWith(publicDir + path.sep)) return null;

  try {
    const mime = MIME_BY_EXT[path.extname(filePath).toLowerCase()];
    if (mime) {
      const data = await readFile(filePath);
      return { base64: data.toString("base64"), mime };
    }
  } catch {
    // nicht auf der Platte vorhanden → über HTTP versuchen
  }

  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  if (!host) return null;
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  try {
    const response = await fetch(`${proto}://${host}${urlPath}`);
    const mime = response.headers.get("content-type")?.split(";")[0] ?? "";
    if (!response.ok || !mime.startsWith("image/")) return null;
    return { base64: Buffer.from(await response.arrayBuffer()).toString("base64"), mime };
  } catch {
    return null;
  }
}

function buildPrompt(boden: Option, wand: Option): string {
  const hint = (o: Option) => (o.swatch ? ` (Grundfarbe ca. ${o.swatch})` : "");
  return [
    "Du bekommst ein Basisbild eines Raums und Produktfotos von Materialien.",
    "Ändere ausschließlich den Bodenbelag und die Wandflächen des Basisbildes, sodass sie zu den Produktfotos passen.",
    `Bodenbelag: ${boden.name}${hint(boden)}.`,
    `Wandfläche: ${wand.name}${hint(wand)}.`,
    "Alles andere bleibt exakt unverändert: Möbel, Fenster, Türen, Perspektive, Bildausschnitt, Licht und Schatten.",
    "Gib ausschließlich das bearbeitete Bild zurück.",
  ].join("\n");
}

export default async function handler(req: Req, res: ServerResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendError(res, 405, "Nur POST ist erlaubt.");
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;
  if (!apiKey || !model) {
    return sendError(res, 500, "Die Visualisierung ist nicht eingerichtet (GEMINI_API_KEY oder GEMINI_MODEL fehlt).");
  }

  // Nur bekannte IDs aus dem Katalog – keine freien Texte.
  const body = parseBody(req);
  const room = houseJson.rooms.find((r) => r.id === body?.raumId);
  const categories = catalogJson.categories as { id: string; options: Option[] }[];
  const boden = categories.find((c) => c.id === "boden")?.options.find((o) => o.id === body?.bodenId);
  const wand = categories.find((c) => c.id === "wand")?.options.find((o) => o.id === body?.wandId);
  if (!room || !boden || !wand) {
    return sendError(res, 400, "Unbekannter Raum oder unbekannte Auswahl.");
  }

  const base = await loadAsset(req, `/rooms/${room.id}/base.jpg`);
  if (!base) {
    return sendError(res, 404, `Das Basisbild des Raums „${room.name}“ fehlt (public/rooms/${room.id}/base.jpg).`);
  }
  const [bodenFoto, wandFoto] = await Promise.all([
    boden.texture ? loadAsset(req, boden.texture) : null,
    wand.texture ? loadAsset(req, wand.texture) : null,
  ]);

  const image = (a: Asset) => ({ inline_data: { mime_type: a.mime, data: a.base64 } });
  const parts: object[] = [
    { text: buildPrompt(boden, wand) },
    { text: "Basisbild (immer von diesem Bild ausgehen):" },
    image(base),
  ];
  if (bodenFoto) parts.push({ text: `Produktfoto Bodenbelag – ${boden.name}:` }, image(bodenFoto));
  if (wandFoto) parts.push({ text: `Produktfoto Wandfläche – ${wand.name}:` }, image(wandFoto));

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
        signal: AbortSignal.timeout(55_000),
      },
    );
  } catch {
    return sendError(res, 504, "Der Bilddienst hat nicht rechtzeitig geantwortet. Bitte erneut versuchen.");
  }

  if (!response.ok) {
    if (response.status === 429) return sendError(res, 429, "Das Kontingent des Bilddienstes ist gerade ausgeschöpft. Bitte später erneut versuchen.");
    if (response.status === 400 || response.status === 403 || response.status === 404) {
      return sendError(res, 502, "Der Bilddienst hat die Anfrage abgelehnt. Bitte Schlüssel und Modell-ID prüfen.");
    }
    return sendError(res, 502, "Der Bilddienst ist derzeit nicht erreichbar.");
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: Record<string, any>[] } }[];
    promptFeedback?: { blockReason?: string };
  };
  const outPart = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
  const inline = outPart?.inlineData ?? outPart?.inline_data;
  if (!inline?.data) {
    const blocked = data.promptFeedback?.blockReason;
    return sendError(
      res,
      502,
      blocked
        ? "Die Anfrage wurde vom Bilddienst blockiert. Bitte eine andere Auswahl versuchen."
        : "Der Bilddienst hat kein Bild zurückgegeben. Bitte erneut versuchen.",
    );
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", inline.mimeType ?? inline.mime_type ?? "image/png");
  res.setHeader("Cache-Control", "no-store");
  res.end(Buffer.from(inline.data, "base64"));
}
