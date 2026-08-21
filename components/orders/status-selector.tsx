"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderStatusLabels } from "@/lib/labels";
import type { OrderStatus } from "@prisma/client";

export function StatusSelector({
  value,
  action,
}: {
  value: OrderStatus;
  action: (estado: OrderStatus) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      value={value}
      disabled={pending}
      onValueChange={(v) =>
        startTransition(async () => {
          try {
            await action(v as OrderStatus);
            toast.success("Estado actualizado.");
          } catch (err: any) {
            toast.error(err?.message || "No se pudo actualizar el estado.");
          }
        })
      }
    >
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(orderStatusLabels).map(([v, label]) => (
          <SelectItem key={v} value={v}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
