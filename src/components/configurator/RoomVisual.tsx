import { useEffect, useState } from "react";
import type { Room, Selection } from "@/data/schemas";
import { useRoomVisual } from "@/hooks/useRoomVisual";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ImageOff, Loader2, RefreshCw, Sparkles } from "lucide-react";
import FadeImage from "./FadeImage";

interface RoomVisualProps {
  room: Room;
  selection: Selection;
}

type BaseStatus = "pruefen" | "ok" | "fehlt";

const RoomVisual = ({ room, selection }: RoomVisualProps) => {
  const baseSrc = `/rooms/${room.id}/base.jpg`;
  const [base, setBase] = useState<BaseStatus>("pruefen");

  useEffect(() => {
    setBase("pruefen");
    const img = new Image();
    img.onload = () => setBase("ok");
    img.onerror = () => setBase("fehlt");
    img.src = baseSrc;
  }, [baseSrc]);

  const { imageUrl, status, error, retry, demo, demoRunning, prepareDemo } = useRoomVisual(
    room.id,
    selection,
    base === "ok",
  );

  const busy = status === "loading" || demoRunning;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        {base === "fehlt" ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <ImageOff className="h-8 w-8 text-muted-foreground" />
            <p className="font-serif text-2xl">{room.name}</p>
            <p className="text-xs text-muted-foreground">
              Basisbild fehlt: <code>public{baseSrc}</code>
            </p>
          </div>
        ) : (
          base === "ok" && <FadeImage src={imageUrl ?? baseSrc} alt={`Raumbild ${room.name}`} />
        )}

        {status === "loading" && (
          <div
            role="status"
            className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-card/95 px-3.5 py-1.5 text-xs font-semibold shadow-sm"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            Wird visualisiert …
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2 rounded-2xl bg-card/95 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-xs">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              {error}
            </p>
            <Button size="sm" className="shrink-0 rounded-full" onClick={() => void retry()}>
              Erneut versuchen
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={base !== "ok" || busy}
          onClick={() => void retry()}
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Neu erzeugen
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={base !== "ok" || busy}
          onClick={() => void prepareDemo()}
        >
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          Demo vorbereiten
        </Button>
      </div>

      {demo && (
        <div className="space-y-1.5">
          <Progress value={(demo.done / demo.total) * 100} className="h-1.5" />
          <p className="text-xs tabular-nums text-muted-foreground">
            {demo.error
              ? `Abgebrochen bei ${demo.done} von ${demo.total}: ${demo.error}`
              : demo.done < demo.total
                ? `Demo wird vorbereitet … ${demo.done} von ${demo.total} Varianten`
                : `Alle ${demo.total} Varianten sind bereit.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoomVisual;
