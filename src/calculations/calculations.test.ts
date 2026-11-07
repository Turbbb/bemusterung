import { describe, expect, it } from "vitest";
import { catalog, house } from "@/data";
import type { CatalogOption } from "@/data/schemas";
import {
  categorySurcharge,
  floorArea,
  grossWallArea,
  netWallArea,
  openingsArea,
  optionSurcharge,
  roomTotal,
  totalSurcharge,
} from "./index";

const wohnzimmer = house.rooms.find((r) => r.id === "wohnzimmer")!;

const fliese: CatalogOption = { id: "fliese", name: "Fliese", price: 30, unit: "m2" };
const wandfarbe: CatalogOption = { id: "farbe", name: "Wandfarbe", price: 5, unit: "m2" };

describe("Geometrie – Wohnzimmer 5 × 4 m, Höhe 2,5 m", () => {
  it("Bodenfläche = 20 m²", () => {
    expect(floorArea(wohnzimmer)).toBeCloseTo(20, 6);
  });

  it("Wandfläche brutto = 45 m²", () => {
    expect(grossWallArea(wohnzimmer)).toBeCloseTo(45, 6);
  });

  it("Öffnungen = 3,9 m² (Fenster 1,8 + Tür 2,1)", () => {
    expect(openingsArea(wohnzimmer)).toBeCloseTo(3.9, 6);
  });

  it("Wandfläche netto = 41,1 m²", () => {
    expect(netWallArea(wohnzimmer)).toBeCloseTo(41.1, 6);
  });
});

describe("Aufpreise nach Einheit", () => {
  it("Fliese 30 €/m² auf 20 m² Boden = 600 €", () => {
    expect(optionSurcharge(fliese, floorArea(wohnzimmer))).toBe(600);
  });

  it("Wandfarbe 5 €/m² auf 41,1 m² Wand = 205,50 €", () => {
    expect(optionSurcharge(wandfarbe, netWallArea(wohnzimmer))).toBe(205.5);
  });

  it("Stück: Preis × Anzahl", () => {
    expect(optionSurcharge({ id: "s", name: "S", price: 65, unit: "stk", quantity: 4 }, 0)).toBe(260);
  });

  it("Pauschal: unabhängig von der Fläche", () => {
    expect(optionSurcharge({ id: "p", name: "P", price: 890, unit: "pauschal" }, 999)).toBe(890);
  });
});

describe("Katalog und Gesamtsumme", () => {
  const boden = catalog.categories.find((c) => c.id === "boden")!;
  const wand = catalog.categories.find((c) => c.id === "wand")!;

  it("Kategorie Boden nutzt die Bodenfläche", () => {
    expect(categorySurcharge(wohnzimmer, boden, "fliese")).toBe(600);
  });

  it("Kategorie Wand nutzt die Netto-Wandfläche", () => {
    expect(categorySurcharge(wohnzimmer, wand, "farbton")).toBe(205.5);
  });

  it("Gesamtsumme = Fliese + Wandfarbe = 805,50 €", () => {
    const selection = { boden: "fliese", wand: "farbton" };
    expect(roomTotal(wohnzimmer, catalog, selection)).toBe(805.5);
    expect(totalSurcharge(house.rooms, catalog, { wohnzimmer: selection })).toBe(805.5);
  });

  it("Unbekannte Option wirft einen Fehler", () => {
    expect(() => categorySurcharge(wohnzimmer, boden, "gibt-es-nicht")).toThrow();
  });
});
