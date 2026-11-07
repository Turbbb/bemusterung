import houseJson from "./houseMainz.json";
import catalogJson from "./catalog.json";
import { CatalogSchema, HouseSchema, type Catalog, type Selection } from "./schemas";

export const house = HouseSchema.parse(houseJson);
export const catalog = CatalogSchema.parse(catalogJson);

/** Standardauswahl: jeweils die erste Option jeder Kategorie. */
export function defaultSelection(cat: Catalog): Selection {
  return Object.fromEntries(cat.categories.map((c) => [c.id, c.options[0].id]));
}
