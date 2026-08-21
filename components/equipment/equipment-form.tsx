"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { equipmentModelLabels, equipmentStatusLabels } from "@/lib/labels";
import type { Equipment } from "@prisma/client";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : label}
    </Button>
  );
}

export function EquipmentForm({
  action,
  defaultValues,
  submitLabel = "Guardar equipo",
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: Partial<Equipment>;
  submitLabel?: string;
}) {
  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="codigoInterno">Código Interno *</Label>
          <Input
            id="codigoInterno"
            name="codigoInterno"
            required
            placeholder="T27-011"
            defaultValue={defaultValues?.codigoInterno}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="modelo">Modelo *</Label>
          <Select name="modelo" defaultValue={defaultValues?.modelo ?? "TOTEM_27_AUTOSERVICIO"}>
            <SelectTrigger id="modelo">
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

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="estado">Estado *</Label>
          <Select name="estado" defaultValue={defaultValues?.estado ?? "DISPONIBLE"}>
            <SelectTrigger id="estado">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(equipmentStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Input id="descripcion" name="descripcion" defaultValue={defaultValues?.descripcion ?? ""} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="especificacionesTecnicas">Especificaciones Técnicas</Label>
          <Textarea
            id="especificacionesTecnicas"
            name="especificacionesTecnicas"
            rows={4}
            placeholder="Tamaño de pantalla, sistema operativo, conectividad, accesorios..."
            defaultValue={defaultValues?.especificacionesTecnicas ?? ""}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
