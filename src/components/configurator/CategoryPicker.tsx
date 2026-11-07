import type { Category, Room } from "@/data/schemas";
import { areaForBasis, optionSurcharge } from "@/calculations";
import { formatArea, formatEuro, unitSuffix } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Check, Grid3x3, Package, PaintRoller, Plug, type LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  boden: Grid3x3,
  wand: PaintRoller,
  elektro: Plug,
};

interface CategoryPickerProps {
  room: Room;
  category: Category;
  selectedId: string | undefined;
  onSelect: (optionId: string) => void;
}

const CategoryPicker = ({ room, category, selectedId, onSelect }: CategoryPickerProps) => {
  const Icon = ICONS[category.id] ?? Package;
  const area = areaForBasis(room, category.areaBasis);

  return (
    <section className="rounded-[1.75rem] border border-border bg-card p-5 md:p-7">
      <div className="mb-5 flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-clay-soft text-clay">
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h3 className="font-serif text-2xl font-medium tracking-tight">{category.name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {category.description}
            {category.areaBasis !== "keine" && (
              <span className="ml-1 font-semibold text-foreground">({formatArea(area)})</span>
            )}
          </p>
        </div>
      </div>

      <div role="radiogroup" aria-label={category.name} className="grid gap-3 sm:grid-cols-3">
        {category.options.map((option) => {
          const selected = option.id === selectedId;
          const amount = optionSurcharge(option, area);
          return (
            <button
              key={option.id}
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(option.id)}
              className={cn(
                "group relative flex flex-col rounded-2xl border p-4 text-left transition-all",
                selected
                  ? "border-primary bg-accent ring-1 ring-primary"
                  : "border-border hover:-translate-y-0.5 hover:border-primary/40",
              )}
            >
              <span
                className={cn(
                  "absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
              >
                {selected && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span className="flex items-center gap-2.5 pr-6">
                {option.swatch && (
                  <span
                    aria-hidden="true"
                    className="h-6 w-6 shrink-0 rounded-md border border-foreground/15"
                    style={{ backgroundColor: option.swatch }}
                  />
                )}
                <span className="text-sm font-semibold leading-snug">{option.name}</span>
              </span>
              {option.description && (
                <span className="mt-1 text-xs text-muted-foreground">{option.description}</span>
              )}
              <span className="mt-4 flex items-end justify-between gap-2 border-t border-border/80 pt-3">
                <span className="text-xs tabular-nums text-muted-foreground">
                  {formatEuro(option.price)}
                  {unitSuffix[option.unit]}
                  {option.unit === "stk" && ` × ${option.quantity ?? 1}`}
                </span>
                <span className={cn("text-sm font-bold tabular-nums", amount > 0 ? "text-primary" : "text-muted-foreground")}>
                  {amount > 0 ? `+ ${formatEuro(amount)}` : "inklusive"}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryPicker;
