import { MonitorSmartphone } from "lucide-react";

import { equipmentModelLabels } from "@/lib/labels";
import type { OrderItem } from "@prisma/client";

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin equipos cargados.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
          <span className="flex items-center gap-2 text-sm font-medium">
            <MonitorSmartphone className="h-4 w-4 text-brand-600" />
            {equipmentModelLabels[item.equipmentModel]}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">x{item.cantidad}</span>
        </li>
      ))}
    </ul>
  );
}
