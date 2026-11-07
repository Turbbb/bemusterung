import { formatEuro } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ChevronUp } from "lucide-react";
import PriceBreakdown, { type RoomBreakdown } from "./PriceBreakdown";

interface PriceTickerProps {
  total: number;
  rooms: RoomBreakdown[];
}

const TotalValue = ({ total, className }: { total: number; className: string }) => (
  <span key={total} className={`block tabular-nums animate-in fade-in slide-in-from-bottom-1 duration-300 ${className}`}>
    {formatEuro(total)}
  </span>
);

/** Desktop: mitlaufende Seitenleiste. */
export const PriceTickerPanel = ({ total, rooms }: PriceTickerProps) => (
  <aside className="sticky top-24 hidden rounded-[1.75rem] border border-border bg-card p-6 lg:block">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay">Preis-Ticker</p>
    <p className="mt-3 text-sm text-muted-foreground">Mehrkosten gesamt</p>
    <TotalValue total={total} className="font-serif text-4xl font-medium text-primary" />
    <div className="my-6 h-px bg-border" />
    <PriceBreakdown rooms={rooms} />
    <p className="mt-6 rounded-2xl bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
      Alle Beträge inkl. MwSt., berechnet aus Bodenfläche bzw. Netto-Wandfläche des Raums.
    </p>
  </aside>
);

/** Mobil: fixierte Leiste am unteren Rand, Details im Sheet. */
export const PriceTickerBar = ({ total, rooms }: PriceTickerProps) => (
  <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-5 py-3 backdrop-blur-md lg:hidden">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
      <div>
        <p className="text-xs text-muted-foreground">Mehrkosten gesamt</p>
        <TotalValue total={total} className="font-serif text-2xl font-medium text-primary" />
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <Button className="rounded-full px-5">
            Details
            <ChevronUp className="ml-1 h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-[1.75rem]">
          <SheetHeader className="mb-5 text-left">
            <SheetTitle className="font-serif text-2xl font-medium">Preisübersicht</SheetTitle>
          </SheetHeader>
          <PriceBreakdown rooms={rooms} />
          <div className="mt-6 flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-semibold">Gesamt</span>
            <span className="font-serif text-2xl tabular-nums text-primary">{formatEuro(total)}</span>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </div>
);
