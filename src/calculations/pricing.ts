import type { AreaBasis, Catalog, CatalogOption, Category, Room, Selection } from "@/data/schemas";
import { floorArea, netWallArea } from "./geometry";

/** Rundet auf ganze Cent. */
export function roundCents(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Fläche, die eine Kategorie bei Einheit „m2“ zugrunde legt. */
export function areaForBasis(room: Room, basis: AreaBasis): number {
  if (basis === "boden") return floorArea(room);
  if (basis === "wand") return netWallArea(room);
  return 0;
}

/** Aufpreis einer Option nach Einheit: m² × Fläche, Stück × Anzahl oder pauschal. */
export function optionSurcharge(option: CatalogOption, areaM2: number): number {
  switch (option.unit) {
    case "m2":
      return roundCents(option.price * areaM2);
    case "stk":
      return roundCents(option.price * (option.quantity ?? 1));
    case "pauschal":
      return roundCents(option.price);
  }
}

/** Aufpreis einer Kategorie für einen Raum. Ohne Auswahl: 0 €. */
export function categorySurcharge(room: Room, category: Category, optionId: string | undefined): number {
  if (!optionId) return 0;
  const option = category.options.find((o) => o.id === optionId);
  if (!option) {
    throw new Error(`Unbekannte Option "${optionId}" in Kategorie "${category.id}"`);
  }
  return optionSurcharge(option, areaForBasis(room, category.areaBasis));
}

export interface SurchargeLine {
  categoryId: string;
  categoryName: string;
  option: CatalogOption;
  amount: number;
}

/** Aufpreise eines Raums, je Kategorie. */
export function roomSurcharges(room: Room, catalog: Catalog, selection: Selection): SurchargeLine[] {
  return catalog.categories.flatMap((category) => {
    const optionId = selection[category.id];
    const option = category.options.find((o) => o.id === optionId);
    if (!option) return [];
    return [
      {
        categoryId: category.id,
        categoryName: category.name,
        option,
        amount: categorySurcharge(room, category, optionId),
      },
    ];
  });
}

/** Summe der Aufpreise eines Raums. */
export function roomTotal(room: Room, catalog: Catalog, selection: Selection): number {
  return roundCents(roomSurcharges(room, catalog, selection).reduce((s, l) => s + l.amount, 0));
}

/** Gesamtsumme über alle Räume. selections: Raum-ID → Auswahl. */
export function totalSurcharge(
  rooms: Room[],
  catalog: Catalog,
  selections: Record<string, Selection>,
): number {
  return roundCents(rooms.reduce((sum, room) => sum + roomTotal(room, catalog, selections[room.id] ?? {}), 0));
}
