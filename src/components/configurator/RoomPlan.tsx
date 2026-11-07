import type { CatalogOption, Room, Selection } from "@/data/schemas";
import { catalog } from "@/data";
import { floorArea, grossWallArea, netWallArea, openingsArea } from "@/calculations";
import { formatArea, formatNumber } from "@/lib/format";
import { DoorOpen, RectangleHorizontal } from "lucide-react";

interface RoomPlanProps {
  room: Room;
  selection: Selection;
}

const PAD = 1;
const WALL = 0.24;

const findOption = (categoryId: string, optionId: string | undefined) =>
  catalog.categories.find((c) => c.id === categoryId)?.options.find((o) => o.id === optionId);

const FloorPatternContent = ({ option }: { option: CatalogOption }) => {
  const color = option.swatch ?? "#CCCCCC";
  const line = "rgba(0,0,0,0.28)";
  switch (option.pattern) {
    case "dielen-schmal":
      return (
        <>
          <rect width="1.2" height="0.9" fill={color} />
          <path d="M0 0.3H1.2M0 0.6H1.2M0 0.9H1.2M0.5 0V0.3M0.9 0.3V0.6M0.2 0.6V0.9" stroke={line} strokeWidth="0.015" />
        </>
      );
    case "dielen-breit":
      return (
        <>
          <rect width="1.6" height="0.9" fill={color} />
          <path d="M0 0.45H1.6M0 0.9H1.6M1 0V0.45M0.4 0.45V0.9" stroke={line} strokeWidth="0.02" />
        </>
      );
    case "fliese-raster":
      return (
        <>
          <rect width="0.6" height="0.6" fill={color} />
          <path d="M0 0H0.6M0 0H0V0.6" stroke="rgba(255,255,255,0.65)" strokeWidth="0.03" fill="none" />
        </>
      );
    default:
      return <rect width="1" height="1" fill={color} />;
  }
};

const patternSize = (option: CatalogOption) =>
  option.pattern === "dielen-schmal"
    ? { w: 1.2, h: 0.9 }
    : option.pattern === "dielen-breit"
      ? { w: 1.6, h: 0.9 }
      : option.pattern === "fliese-raster"
        ? { w: 0.6, h: 0.6 }
        : { w: 1, h: 1 };

const RoomPlan = ({ room, selection }: RoomPlanProps) => {
  const floorOptions = catalog.categories.find((c) => c.id === "boden")?.options ?? [];
  const wallOptions = catalog.categories.find((c) => c.id === "wand")?.options ?? [];
  const floor = findOption("boden", selection.boden);
  const wall = findOption("wand", selection.wand);
  const xs = room.polygon.map((p) => p.x);
  const ys = room.polygon.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const width = Math.max(...xs) - minX;
  const height = Math.max(...ys) - minY;
  const points = room.polygon.map((p) => `${p.x},${p.y}`).join(" ");

  const metrics = [
    { label: "Bodenfläche", value: formatArea(floorArea(room)) },
    { label: "Wand brutto", value: formatArea(grossWallArea(room)) },
    { label: "Öffnungen", value: `− ${formatArea(openingsArea(room))}` },
    { label: "Wand netto", value: formatArea(netWallArea(room)), highlight: true },
  ];

  return (
    <div className="grid gap-6 rounded-[1.75rem] border border-border bg-card p-5 md:grid-cols-[1fr_1.1fr] md:p-7">
      <div className="flex flex-col">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-3xl font-medium tracking-tight">{room.name}</h2>
          <span className="text-sm text-muted-foreground">Höhe {formatNumber(room.height)} m</span>
        </div>
        <div className="mt-5 flex flex-1 items-center justify-center rounded-2xl bg-muted/60 p-4">
          <svg
            viewBox={`${minX - PAD} ${minY - PAD} ${width + PAD * 2} ${height + PAD * 2}`}
            className="h-52 w-full"
            role="img"
            aria-label={`Grundriss ${room.name}`}
          >
            <defs>
              {floorOptions.map((o) => {
                const { w, h } = patternSize(o);
                return (
                  <pattern key={o.id} id={`floor-${o.id}`} width={w} height={h} patternUnits="userSpaceOnUse">
                    <FloorPatternContent option={o} />
                  </pattern>
                );
              })}
              <pattern id="wall-koernung" width="0.12" height="0.12" patternUnits="userSpaceOnUse">
                <circle cx="0.03" cy="0.04" r="0.012" fill="rgba(0,0,0,0.35)" />
                <circle cx="0.09" cy="0.08" r="0.01" fill="rgba(255,255,255,0.7)" />
                <circle cx="0.07" cy="0.02" r="0.008" fill="rgba(0,0,0,0.25)" />
              </pattern>
            </defs>
            {floorOptions.map((o) => (
              <polygon
                key={o.id}
                points={points}
                fill={`url(#floor-${o.id})`}
                className="transition-opacity duration-300 ease-in-out"
                style={{ opacity: floor?.id === o.id ? 1 : 0 }}
              />
            ))}
            <polygon
              points={points}
              fill="none"
              strokeWidth={WALL}
              strokeLinejoin="miter"
              className="transition-[stroke] duration-300 ease-in-out"
              style={{ stroke: wall?.swatch ?? "#FFFFFF" }}
            />
            {wallOptions.map((o) => (
              <polygon
                key={o.id}
                points={points}
                fill="none"
                stroke="url(#wall-koernung)"
                strokeWidth={WALL}
                strokeLinejoin="miter"
                className="transition-opacity duration-300 ease-in-out"
                style={{ opacity: o.pattern === "koernung" && wall?.id === o.id ? 1 : 0 }}
              />
            ))}
            <polygon
              points={points}
              fill="none"
              strokeWidth="0.02"
              strokeLinejoin="miter"
              style={{ stroke: "rgba(0,0,0,0.35)" }}
            />
            <text
              x={minX + width / 2}
              y={minY - 0.35}
              textAnchor="middle"
              className="fill-muted-foreground font-sans"
              fontSize="0.38"
            >
              {formatNumber(width)} m
            </text>
            <text
              x={minX - 0.35}
              y={minY + height / 2}
              textAnchor="middle"
              className="fill-muted-foreground font-sans"
              fontSize="0.38"
              transform={`rotate(-90 ${minX - 0.35} ${minY + height / 2})`}
            >
              {formatNumber(height)} m
            </text>
            <rect
              x={minX + width / 2 - 0.9}
              y={minY + height / 2 - 0.4}
              width="1.8"
              height="0.8"
              rx="0.4"
              fill="rgba(255,255,255,0.88)"
            />
            <text
              x={minX + width / 2}
              y={minY + height / 2 + 0.2}
              textAnchor="middle"
              className="fill-primary font-serif"
              fontSize="0.5"
            >
              {formatArea(floorArea(room))}
            </text>
          </svg>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Boden: <span className="font-semibold text-foreground">{floor?.name ?? "–"}</span> · Wand:{" "}
          <span className="font-semibold text-foreground">{wall?.name ?? "–"}</span>
        </p>
      </div>

      <div className="flex flex-col justify-between gap-6">
        <dl className="grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className={
                m.highlight
                  ? "rounded-2xl bg-primary px-4 py-4 text-primary-foreground"
                  : "rounded-2xl border border-border px-4 py-4"
              }
            >
              <dt className={m.highlight ? "text-xs opacity-80" : "text-xs text-muted-foreground"}>{m.label}</dt>
              <dd className="mt-1 font-serif text-2xl tabular-nums">{m.value}</dd>
            </div>
          ))}
        </dl>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Öffnungen</p>
          <ul className="divide-y divide-border rounded-2xl border border-border">
            {room.openings.map((o) => {
              const Icon = o.name.toLowerCase().includes("tür") ? DoorOpen : RectangleHorizontal;
              return (
                <li key={o.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-clay" />
                    {o.name}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatNumber(o.width)} × {formatNumber(o.height)} m
                  </span>
                </li>
              );
            })}
            {room.openings.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground">Keine Öffnungen erfasst</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RoomPlan;
