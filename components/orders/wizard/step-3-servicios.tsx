"use client";

import { Plus, Trash2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { digitalServiceTypeLabels, materialStatusLabels } from "@/lib/labels";
import type { WizardPayload } from "@/lib/types";
import type { DigitalServiceType, MaterialStatus } from "@prisma/client";

interface Props {
  data: WizardPayload;
  onChange: (patch: Partial<WizardPayload>) => void;
}

const emptyService = () => ({
  tipoServicio: "ALQUILER_PURO" as DigitalServiceType,
  descripcionRequerimientos: "",
  estadoMaterial: "NO_NECESARIO" as MaterialStatus,
  notasMaterialFaltante: "",
  urlArchivosAdjuntos: "",
});

export function Step3Servicios({ data, onChange }: Props) {
  const addService = () => onChange({ digitalServices: [...data.digitalServices, emptyService()] });
  const removeService = (index: number) =>
    onChange({ digitalServices: data.digitalServices.filter((_, i) => i !== index) });
  const updateService = (index: number, patch: Partial<WizardPayload["digitalServices"][number]>) =>
    onChange({
      digitalServices: data.digitalServices.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    });

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Sumá cada servicio digital contratado (desarrollo, juegos, placas, videos, edición) o dejá "Alquiler
        Puro" si el cliente solo necesita el hardware.
      </p>

      <div className="space-y-4">
        {data.digitalServices.map((service, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo de Servicio</Label>
                  <Select
                    value={service.tipoServicio}
                    onValueChange={(v) => updateService(index, { tipoServicio: v as DigitalServiceType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(digitalServiceTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Estado del Material</Label>
                  <Select
                    value={service.estadoMaterial}
                    onValueChange={(v) => updateService(index, { estadoMaterial: v as MaterialStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(materialStatusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeService(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Descripción de Requerimientos</Label>
              <Textarea
                rows={2}
                value={service.descripcionRequerimientos}
                onChange={(e) => updateService(index, { descripcionRequerimientos: e.target.value })}
                placeholder="Qué necesita el cliente exactamente..."
              />
            </div>

            {(service.estadoMaterial === "PENDIENTE" || service.estadoMaterial === "INCOMPLETO") && (
              <div className="space-y-1.5">
                <Label className="text-xs">Notas de Material Faltante</Label>
                <Textarea
                  rows={2}
                  value={service.notasMaterialFaltante}
                  onChange={(e) => updateService(index, { notasMaterialFaltante: e.target.value })}
                  placeholder="Qué falta recibir del cliente (logos, videos, textos, etc.)"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">URL de Archivos (Drive / Upload)</Label>
              <Input
                value={service.urlArchivosAdjuntos}
                onChange={(e) => updateService(index, { urlArchivosAdjuntos: e.target.value })}
                placeholder="https://drive.google.com/..."
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" onClick={addService}>
        <Plus className="h-4 w-4" />
        Agregar servicio
      </Button>
    </div>
  );
}
