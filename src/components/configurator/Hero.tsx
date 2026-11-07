import { useState } from "react";
import { formatArea } from "@/lib/format";

interface HeroProps {
  roomCount: number;
  totalFloorArea: number;
}

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=80";

const Hero = ({ roomCount, totalFloorArea }: HeroProps) => {
  const [imageOk, setImageOk] = useState(true);

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-10 pt-10 md:grid-cols-[1.1fr_1fr] md:items-center md:pt-16">
      <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-clay">Ausstattung wählen</p>
        <h1 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight md:text-6xl">
          Ihr Zuhause,
          <br />
          <span className="italic text-primary">Raum für Raum.</span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
          Wählen Sie Böden, Wände und Technik. Jeder Aufpreis wird exakt aus den Raummaßen berechnet – transparent
          und auf den Cent genau.
        </p>
        <dl className="mt-8 flex gap-8 border-t border-border pt-6">
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Räume</dt>
            <dd className="mt-1 font-serif text-3xl tabular-nums">{roomCount}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Wohnfläche</dt>
            <dd className="mt-1 font-serif text-3xl tabular-nums">{formatArea(totalFloorArea)}</dd>
          </div>
        </dl>
      </div>

      <div className="relative animate-in fade-in zoom-in-95 delay-150 duration-700 fill-mode-both">
        <div className="aspect-[4/3] overflow-hidden rounded-[2rem] bg-secondary">
          {imageOk && (
            <img
              src={HERO_IMAGE}
              alt="Helles Wohnzimmer im Neubau mit großem Fenster"
              className="h-full w-full object-cover"
              onError={() => setImageOk(false)}
            />
          )}
        </div>
        <div className="absolute -bottom-4 left-5 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">Berechnung</p>
          <p className="text-sm font-semibold">Fläche × Preis je Einheit</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
