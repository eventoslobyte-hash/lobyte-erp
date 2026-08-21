"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orderStatusLabels } from "@/lib/labels";
import type { WizardPayload } from "@/lib/types";
import type { OrderStatus } from "@prisma/client";

interface Props {
  data: WizardPayload;
  onChange: (patch: Partial<WizardPayload>) => void;
  clients: { id: string; razonSocial: string }[];
}

export function Step1ClienteEvento({ data, onChange, clients }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="clienteId">Cliente *</Label>
        <Select value={data.clienteId} onValueChange={(v) => onChange({ clienteId: v })}>
          <SelectTrigger id="clienteId">
            <SelectValue placeholder="Seleccionar cliente..." />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.razonSocial}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="nombreEvento">Nombre del Evento *</Label>
        <Input
          id="nombreEvento"
          value={data.nombreEvento}
          onChange={(e) => onChange({ nombreEvento: e.target.value })}
          placeholder="Ej: Lanzamiento Producto XYZ"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ubicacionDireccion">Ubicación (Dirección) *</Label>
        <Input
          id="ubicacionDireccion"
          value={data.ubicacionDireccion}
          onChange={(e) => onChange({ ubicacionDireccion: e.target.value })}
          placeholder="Av. Siempre Viva 123, CABA"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ubicacionMapaUrl">Link de Google Maps</Label>
        <Input
          id="ubicacionMapaUrl"
          value={data.ubicacionMapaUrl}
          onChange={(e) => onChange({ ubicacionMapaUrl: e.target.value })}
          placeholder="https://maps.google.com/..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fechaHoraEntrega">Fecha y Hora de Entrega *</Label>
          <Input
            id="fechaHoraEntrega"
            type="datetime-local"
            value={data.fechaHoraEntrega}
            onChange={(e) => onChange({ fechaHoraEntrega: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fechaHoraRetiro">Fecha y Hora de Retiro *</Label>
          <Input
            id="fechaHoraRetiro"
            type="datetime-local"
            value={data.fechaHoraRetiro}
            onChange={(e) => onChange({ fechaHoraRetiro: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="estadoEvento">Estado del Evento</Label>
        <Select value={data.estadoEvento} onValueChange={(v) => onChange({ estadoEvento: v as OrderStatus })}>
          <SelectTrigger id="estadoEvento">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(orderStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
