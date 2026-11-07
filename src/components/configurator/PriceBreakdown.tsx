import type { SurchargeLine } from "@/calculations";
import { formatEuro } from "@/lib/format";

export interface RoomBreakdown {
  roomId: string;
  roomName: string;
  lines: SurchargeLine[];
  total: number;
}

interface PriceBreakdownProps {
  rooms: RoomBreakdown[];
}

const PriceBreakdown = ({ rooms }: PriceBreakdownProps) => (
  <div className="space-y-5">
    {rooms.map((room) => (
      <div key={room.roomId}>
        <div className="mb-2 flex items-baseline justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{room.roomName}</p>
          <p className="text-sm font-semibold tabular-nums">{formatEuro(room.total)}</p>
        </div>
        <ul className="space-y-2">
          {room.lines.map((line) => (
            <li key={line.categoryId} className="flex items-start justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span className="block text-muted-foreground">{line.categoryName}</span>
                <span className="block truncate font-medium">{line.option.name}</span>
              </span>
              <span className="shrink-0 tabular-nums">{line.amount > 0 ? formatEuro(line.amount) : "inkl."}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

export default PriceBreakdown;
