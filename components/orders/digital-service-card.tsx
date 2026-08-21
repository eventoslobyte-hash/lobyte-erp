"use client";

import { useFormStatus } from "react-dom";
import { Sparkles } from "lucide-react";

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
import { digitalServiceTypeLabels, materialStatusLabels } from "@/lib/labels";
import type { DigitalService } from "@prisma/client";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="secondary" disabled={pending}>
      {pending ? "Guardando..." : "Guardar"}
    </Button>
  );
}

export function DigitalServiceCard({
  service,
  action,
}: {
  service: DigitalService;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand-600" />
        <p className="text-sm font-semibold">{digitalServiceTypeLabels[service.tipoServicio]}</p>
      </div>
      {service.descripcionRequerimientos && (
        <p className="mb-3 text-sm text-muted-foreground">{service.descripcionRequerimientos}</p>
      )}

      <form action={action} className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Estado del Material</Label>
          <Select name="estadoMaterial" defaultValue={service.estadoMaterial}>
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

        <div className="space-y-1.5">
          <Label className="text-xs">Notas de Material Faltante</Label>
          <Textarea name="notasMaterialFaltante" rows={2} defaultValue={service.notasMaterialFaltante ?? ""} />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">URL de Archivos</Label>
          <Input name="urlArchivosAdjuntos" defaultValue={service.urlArchivosAdjuntos ?? ""} />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
