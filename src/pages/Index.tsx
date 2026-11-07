import { useMemo, useState } from "react";
import { catalog, defaultSelection, house } from "@/data";
import type { Selection } from "@/data/schemas";
import { floorArea, roomSurcharges, roomTotal, totalSurcharge } from "@/calculations";
import SiteHeader from "@/components/configurator/SiteHeader";
import Hero from "@/components/configurator/Hero";
import RoomTabs from "@/components/configurator/RoomTabs";
import RoomPlan from "@/components/configurator/RoomPlan";
import CategoryPicker from "@/components/configurator/CategoryPicker";
import { PriceTickerBar, PriceTickerPanel } from "@/components/configurator/PriceTicker";
import type { RoomBreakdown } from "@/components/configurator/PriceBreakdown";

const initialSelections = (): Record<string, Selection> =>
  Object.fromEntries(house.rooms.map((room) => [room.id, defaultSelection(catalog)]));

const Index = () => {
  const [activeRoomId, setActiveRoomId] = useState(house.rooms[0].id);
  const [selections, setSelections] = useState(initialSelections);

  const activeRoom = house.rooms.find((r) => r.id === activeRoomId)!;
  const activeSelection = selections[activeRoomId];

  const total = totalSurcharge(house.rooms, catalog, selections);
  const breakdown: RoomBreakdown[] = house.rooms.map((room) => ({
    roomId: room.id,
    roomName: room.name,
    lines: roomSurcharges(room, catalog, selections[room.id]),
    total: roomTotal(room, catalog, selections[room.id]),
  }));
  const totalFloor = useMemo(() => house.rooms.reduce((sum, r) => sum + floorArea(r), 0), []);

  const select = (categoryId: string, optionId: string) =>
    setSelections((prev) => ({
      ...prev,
      [activeRoomId]: { ...prev[activeRoomId], [categoryId]: optionId },
    }));

  return (
    <div className="min-h-screen pb-28 lg:pb-16">
      <SiteHeader projectName={house.name} />
      <Hero roomCount={house.rooms.length} totalFloorArea={totalFloor} />

      <main className="mx-auto mt-6 grid max-w-6xl gap-8 px-5 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          <RoomTabs rooms={house.rooms} activeId={activeRoomId} onChange={setActiveRoomId} />
          <RoomPlan room={activeRoom} selection={activeSelection} />
          {catalog.categories.map((category) => (
            <CategoryPicker
              key={category.id}
              room={activeRoom}
              category={category}
              selectedId={activeSelection[category.id]}
              onSelect={(optionId) => select(category.id, optionId)}
            />
          ))}
        </div>
        <div>
          <PriceTickerPanel total={total} rooms={breakdown} />
        </div>
      </main>

      <PriceTickerBar total={total} rooms={breakdown} />
    </div>
  );
};

export default Index;
