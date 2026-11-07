import { z } from "zod";

/** Punkt im Grundriss, Angaben in Metern. */
export const PointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

/** Öffnung in einer Wand (Fenster, Tür …), Maße in Metern. */
export const OpeningSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
});

export const RoomSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** Raumhöhe in Metern */
  height: z.number().positive(),
  /** Grundriss als geschlossenes Polygon (Punkte in Metern, Reihenfolge entlang der Wände) */
  polygon: z.array(PointSchema).min(3),
  openings: z.array(OpeningSchema).default([]),
});

export const HouseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rooms: z.array(RoomSchema).min(1),
});

export const UnitSchema = z.enum(["m2", "stk", "pauschal"]);

export const CatalogOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** Preis in Euro je Einheit */
  price: z.number().nonnegative(),
  unit: UnitSchema,
  /** Nur für Einheit „stk“: Anzahl Stück (Standard 1) */
  quantity: z.number().int().positive().optional(),
  description: z.string().optional(),
  /** Farbfeld (Hex), nur Boden und Wand */
  swatch: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  /** Name des Darstellungsmusters im Grundriss, nur Boden und Wand */
  pattern: z
    .enum(["dielen-schmal", "dielen-breit", "fliese-raster", "glatt", "koernung"])
    .optional(),
});

/** Welche Fläche bei Einheit „m2“ zugrunde gelegt wird. */
export const AreaBasisSchema = z.enum(["boden", "wand", "keine"]);

export const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  areaBasis: AreaBasisSchema,
  options: z.array(CatalogOptionSchema).min(1),
});

export const CatalogSchema = z.object({
  categories: z.array(CategorySchema).min(1),
});

/** Auswahl: Kategorie-ID → Options-ID */
export const SelectionSchema = z.record(z.string(), z.string());

export type Point = z.infer<typeof PointSchema>;
export type Opening = z.infer<typeof OpeningSchema>;
export type Room = z.infer<typeof RoomSchema>;
export type House = z.infer<typeof HouseSchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type CatalogOption = z.infer<typeof CatalogOptionSchema>;
export type AreaBasis = z.infer<typeof AreaBasisSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Catalog = z.infer<typeof CatalogSchema>;
export type Selection = z.infer<typeof SelectionSchema>;
