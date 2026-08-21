"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { equipmentModelLabels } from "@/lib/labels";
import { checkAvailabilityAction } from "@/app/(app)/alquileres/actions";
import type { AvailabilityResult } from "@/lib/availability";
import type { WizardPayload } from "@/lib/types";
import type { EquipmentModel } from "@prisma/client";
import { cn } from "@/lib/utils";

interface Props {
  data: WizardPayload;
  onChange: (patch: Partial<WizardPayload>) => void;
}

export function Step2Equipos({ data, onChange }: Props) {
  const [results, setResults] = useState<AvailabilityResult[] | null>(null);
  const [checking, startChecking] = useTransition();

  const addItem = () => {
    onChange({ items: [...data.items, { modelo: "TOTEM_27_AUTOSERVICIO", cantidad: 1 }] });
    setResults(null);
  };

  const removeItem = (index: number) => {
    onChange({ items: data.items.filter((_, i) => i !== index) });
    setResults(null);
  };

  const updateItem = (index: number, patch: Partial<{ modelo: EquipmentModel; cantidad: number }>) => {
    onChange({
      items: data.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    });
    setResults(null);
  };

  const verify = () => {
    startChecking(async () => {
      const res = await checkAvailabilityAction(data.items, data.fechaHoraEntrega, data.fechaHoraRetiro);
      setResults(res);
    });
  };

  const resultFor = (modelo: EquipmentModel) => results?.find((r) => r.modelo === modelo);

  return (
    <div className="space-y-5">
      {(!data.fechaHoraEntrega || !data.fechaHoraRetiro) && (
        <p className="rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning">
          Definí las fechas de entrega y retiro en el Paso 1 para poder verificar disponibilidad real.
        </p>
      )}

      <div className="space-y-3">
        {data.items.map((item, index) => {
          const result = resultFor(item.modelo);
          return (
            <div key={index} className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Modelo</Label>
                <Select value={item.modelo} onValueChange={(v) => updateItem(index, { modelo: v as EquipmentModel })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(equipmentModelLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full space-y-1.5 sm:w-28">
                <Label className="text-xs">Cantidad</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={item.cantidad}
                  onChange={(e) => updateItem(index, { cantidad: Math.max(1, Number(e.target.value) || 1) })}
                />
              </div>

              <div className="flex items-center gap-2 sm:w-48">
                {result && (
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      result.ok ? "text-success" : "text-destructive"
                    )}
                  >
                    {result.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {result.ok
                      ? `Disponible (${result.disponible}/${result.stockTotal})`
                      : `Sin stock (${result.disponible}/${result.stockTotal})`}
                  </span>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                className="self-end text-muted-foreground hover:text-destructive sm:self-center"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}

        {data.items.length === 0 && (
          <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
            Todavía no agregaste equipos.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={addItem}>
          <Plus className="h-4 w-4" />
          Agregar equipo
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={verify}
          disabled={checking || data.items.length === 0 || !data.fechaHoraEntrega || !data.fechaHoraRetiro}
        >
          <RefreshCw className={cn("h-4 w-4", checking && "animate-spin")} />
          {checking ? "Verificando..." : "Verificar disponibilidad"}
        </Button>
      </div>

      {results && results.some((r) => !r.ok) && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          Hay equipos sin stock suficiente para las fechas elegidas. Ajustá la cantidad, el modelo o las fechas
          antes de continuar — el sistema previene el overbooking al crear el alquiler.
        </p>
      )}
    </div>
  );
}
