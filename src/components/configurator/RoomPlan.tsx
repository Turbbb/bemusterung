import type { Room } from "@/data/schemas";
import { floorArea, grossWallArea, netWallArea, openingsArea } from "@/calculations";
import { formatArea, formatNumber } from "@/lib/format";
import { DoorOpen, RectangleHorizontal } from "lucide-react";

interface RoomPlanProps {
  room: Room;
}

const PAD = 1;

const RoomPlan = ({ room }: RoomPlanProps) => {
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
              <pattern id="grid" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
                <path d="M0.5 0H0V0.5" fill="none" className="stroke-primary/15" strokeWidth="0.02" />
              </pattern>
            </defs>
            <polygon points={points} fill="url(#grid)" className="stroke-primary" strokeWidth="0.12" strokeLinejoin="round" />
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
            <text
              x={minX + width / 2}
              y={minY + height / 2 + 0.2}
              textAnchor="middle"
              className="fill-primary font-serif"
              fontSize="0.6"
            >
              {formatArea(floorArea(room))}
            </text>
          </svg>
        </div>
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
