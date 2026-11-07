import type { Room, Selection } from "@/data/schemas";
import { catalog } from "@/data";
import { floorArea, grossWallArea, netWallArea, openingsArea } from "@/calculations";
import { formatArea, formatNumber } from "@/lib/format";
import { DoorOpen, RectangleHorizontal } from "lucide-react";
import RoomVisual from "./RoomVisual";

interface RoomPlanProps {
  room: Room;
  selection: Selection;
}

const findOption = (categoryId: string, optionId: string | undefined) =>
  catalog.categories.find((c) => c.id === categoryId)?.options.find((o) => o.id === optionId);

const RoomPlan = ({ room, selection }: RoomPlanProps) => {
  const floor = findOption("boden", selection.boden);
  const wall = findOption("wand", selection.wand);

  const metrics = [
    { label: "Bodenfläche", value: formatArea(floorArea(room)) },
    { label: "Wand brutto", value: formatArea(grossWallArea(room)) },
    { label: "Öffnungen", value: `− ${formatArea(openingsArea(room))}` },
    { label: "Wand netto", value: formatArea(netWallArea(room)), highlight: true },
  ];

  return (
    <div className="grid gap-6 rounded-[1.75rem] border border-border bg-card p-5 md:grid-cols-[1.1fr_1fr] md:p-7">
      <div className="flex flex-col">
        <div className="mb-5 flex items-baseline justify-between">
          <h2 className="font-serif text-3xl font-medium tracking-tight">{room.name}</h2>
          <span className="text-sm text-muted-foreground">Höhe {formatNumber(room.height)} m</span>
        </div>
        <RoomVisual room={room} selection={selection} />
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
