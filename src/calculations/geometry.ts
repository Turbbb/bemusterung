import type { Point, Room } from "@/data/schemas";

/** Bodenfläche in m² (Gaußsche Trapezformel, unabhängig von der Umlaufrichtung). */
export function floorArea(room: Pick<Room, "polygon">): number {
  const pts = room.polygon;
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) / 2;
}

const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

/** Umfang des Grundrisses in m. */
export function perimeter(room: Pick<Room, "polygon">): number {
  const pts = room.polygon;
  return pts.reduce((sum, p, i) => sum + distance(p, pts[(i + 1) % pts.length]), 0);
}

/** Wandfläche brutto in m² (Umfang × Raumhöhe). */
export function grossWallArea(room: Pick<Room, "polygon" | "height">): number {
  return perimeter(room) * room.height;
}

/** Summe aller Öffnungen (Fenster, Türen) in m². */
export function openingsArea(room: Pick<Room, "openings">): number {
  return room.openings.reduce((sum, o) => sum + o.width * o.height, 0);
}

/** Wandfläche netto in m² (brutto abzüglich Öffnungen, nie negativ). */
export function netWallArea(room: Room): number {
  return Math.max(0, grossWallArea(room) - openingsArea(room));
}
