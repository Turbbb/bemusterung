import type { Room } from "@/data/schemas";
import { cn } from "@/lib/utils";

interface RoomTabsProps {
  rooms: Room[];
  activeId: string;
  onChange: (id: string) => void;
}

const RoomTabs = ({ rooms, activeId, onChange }: RoomTabsProps) => (
  <div role="tablist" aria-label="Räume" className="flex gap-2 overflow-x-auto pb-1">
    {rooms.map((room) => {
      const active = room.id === activeId;
      return (
        <button
          key={room.id}
          role="tab"
          aria-selected={active}
          onClick={() => onChange(room.id)}
          className={cn(
            "shrink-0 rounded-full border px-5 py-2 text-sm font-semibold transition-colors",
            active
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:border-primary/40",
          )}
        >
          {room.name}
        </button>
      );
    })}
  </div>
);

export default RoomTabs;
