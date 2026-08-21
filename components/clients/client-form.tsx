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
import { RatingStarsInput } from "@/components/clients/rating-stars";
import { origenClienteLabels } from "@/lib/labels";
import type { Client } from "@prisma/client";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : label}
    </Button>
  );
}

export function ClientForm({
  action,
  defaultValues,
  submitLabel = "Guardar cliente",
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: Partial<Client>;
  submitLabel?: string;
}) {
  const toInputDate = (d?: Date | string | null) => {
    if (!d) return "";
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toISOString().slice(0, 10);
  };

  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="razonSocial">Razón Social *</Label>
          <Input id="razonSocial" name="razonSocial" required defaultValue={defaultValues?.razonSocial} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cuitCuil">CUIT / CUIL</Label>
          <Input id="cuitCuil" name="cuitCuil" defaultValue={defaultValues?.cuitCuil ?? ""} placeholder="30-12345678-9" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="origenCliente">Origen del Cliente</Label>
          <Select name="origenCliente" defaultValue={defaultValues?.origenCliente ?? "OTRO"}>
            <SelectTrigger id="origenCliente">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(origenClienteLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactoNombre">Nombre de Contacto *</Label>
          <Input id="contactoNombre" name="contactoNombre" required defaultValue={defaultValues?.contactoNombre} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="contactoCargo">Cargo del Contacto</Label>
          <Input id="contactoCargo" name="contactoCargo" defaultValue={defaultValues?.contactoCargo ?? ""} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telefono">Teléfono *</Label>
          <Input id="telefono" name="telefono" required defaultValue={defaultValues?.telefono} placeholder="+549..." />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={defaultValues?.email ?? ""} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="proximaExpo">Próxima Expo</Label>
          <Input id="proximaExpo" name="proximaExpo" defaultValue={defaultValues?.proximaExpo ?? ""} placeholder="Nombre del evento" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fechaProximaExpo">Fecha Próxima Expo</Label>
          <Input
            id="fechaProximaExpo"
            name="fechaProximaExpo"
            type="date"
            defaultValue={toInputDate(defaultValues?.fechaProximaExpo)}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Calificación Interna</Label>
          <RatingStarsInput name="internalRating" defaultValue={defaultValues?.internalRating ?? 3} />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="comportamientoNotas">Notas de Comportamiento</Label>
          <Textarea
            id="comportamientoNotas"
            name="comportamientoNotas"
            rows={4}
            placeholder="Historial de pagos, preferencias de contacto, observaciones..."
            defaultValue={defaultValues?.comportamientoNotas ?? ""}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
