"use client";

import { ShieldCheck } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { WizardPayload } from "@/lib/types";

interface Props {
  data: WizardPayload;
  onChange: (patch: Partial<WizardPayload>) => void;
}

export function Step4Seguro({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-brand-600" />
          <div>
            <p className="text-sm font-medium">¿Este alquiler requiere seguro?</p>
            <p className="text-xs text-muted-foreground">
              Definí si el cliente / venue exige póliza de responsabilidad civil o similar.
            </p>
          </div>
        </div>
        <Switch
          checked={data.insurance.requiereSeguro}
          onCheckedChange={(checked) => onChange({ insurance: { ...data.insurance, requiereSeguro: checked } })}
        />
      </div>

      {data.insurance.requiereSeguro && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="urlComprobanteSeguro">URL del Comprobante de Seguro</Label>
            <Input
              id="urlComprobanteSeguro"
              value={data.insurance.urlComprobanteSeguro}
              onChange={(e) =>
                onChange({ insurance: { ...data.insurance, urlComprobanteSeguro: e.target.value } })
              }
              placeholder="https://drive.google.com/... (dejar vacío si todavía está pendiente)"
            />
            <p className="text-xs text-muted-foreground">
              Si dejás este campo vacío, el seguro queda marcado como <strong>Pendiente</strong> y va a
              disparar una alerta cuando falten menos de 48hs para la entrega.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notasSeguro">Notas</Label>
            <Textarea
              id="notasSeguro"
              rows={3}
              value={data.insurance.notas}
              onChange={(e) => onChange({ insurance: { ...data.insurance, notas: e.target.value } })}
              placeholder="Detalles del seguro, aseguradora, cobertura, etc."
            />
          </div>
        </>
      )}
    </div>
  );
}
