"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { invoiceTypeLabels, paymentMethodLabels } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";
import type { WizardPayload } from "@/lib/types";
import type { InvoiceType, PaymentMethod } from "@prisma/client";

interface Props {
  data: WizardPayload;
  onChange: (patch: Partial<WizardPayload>) => void;
}

export function Step5Finanzas({ data, onChange }: Props) {
  const { payment } = data;
  const set = (patch: Partial<WizardPayload["payment"]>) => onChange({ payment: { ...payment, ...patch } });

  const saldo = payment.pagadoTotal
    ? 0
    : Math.max(0, payment.precioTotal - (payment.senaPagada ? payment.montoSena : 0));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="precioTotal">Precio Total *</Label>
          <Input
            id="precioTotal"
            type="number"
            inputMode="decimal"
            min={0}
            value={payment.precioTotal}
            onChange={(e) => set({ precioTotal: Number(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tipoFactura">Tipo de Factura</Label>
          <Select value={payment.tipoFactura} onValueChange={(v) => set({ tipoFactura: v as InvoiceType })}>
            <SelectTrigger id="tipoFactura">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(invoiceTypeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="condicionPago">Condición de Pago</Label>
          <Select value={payment.condicionPago} onValueChange={(v) => set({ condicionPago: v as PaymentMethod })}>
            <SelectTrigger id="condicionPago">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(paymentMethodLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-lg border border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Seña</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Seña pagada</span>
            <Switch checked={payment.senaPagada} onCheckedChange={(checked) => set({ senaPagada: checked })} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="montoSena" className="text-xs">
              Monto de la Seña
            </Label>
            <Input
              id="montoSena"
              type="number"
              inputMode="decimal"
              min={0}
              value={payment.montoSena}
              onChange={(e) => set({ montoSena: Number(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fechaSena" className="text-xs">
              Fecha de la Seña
            </Label>
            <Input id="fechaSena" type="date" value={payment.fechaSena} onChange={(e) => set({ fechaSena: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cuentaPagoSena" className="text-xs">
              Cuenta de Pago
            </Label>
            <Input
              id="cuentaPagoSena"
              value={payment.cuentaPagoSena}
              onChange={(e) => set({ cuentaPagoSena: e.target.value })}
              placeholder="CBU / Alias"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="urlComprobanteSena" className="text-xs">
              Comprobante de Seña (URL)
            </Label>
            <Input
              id="urlComprobanteSena"
              value={payment.urlComprobanteSena}
              onChange={(e) => set({ urlComprobanteSena: e.target.value })}
              placeholder="https://drive.google.com/..."
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium">¿Pagado en su totalidad?</p>
          <p className="text-xs text-muted-foreground">Marcá esto cuando el cliente cancele todo el saldo.</p>
        </div>
        <Switch checked={payment.pagadoTotal} onCheckedChange={(checked) => set({ pagadoTotal: checked })} />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-brand-50 px-4 py-3">
        <span className="text-sm font-medium text-brand-700">Saldo pendiente estimado</span>
        <span className="text-lg font-bold text-brand-700">{formatCurrency(saldo)}</span>
      </div>
    </div>
  );
}
