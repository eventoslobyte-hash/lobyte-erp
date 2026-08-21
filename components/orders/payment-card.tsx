"use client";

import { useFormStatus } from "react-dom";
import { Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { invoiceTypeLabels, paymentMethodLabels } from "@/lib/labels";
import { calcularSaldoPendiente } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";
import type { Payment } from "@prisma/client";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Guardando..." : "Guardar finanzas"}
    </Button>
  );
}

export function PaymentCard({
  payment,
  action,
}: {
  payment: Payment;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const saldo = calcularSaldoPendiente(payment);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Finanzas y Facturación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="precioTotal" className="text-xs">
                Precio Total
              </Label>
              <Input id="precioTotal" name="precioTotal" type="number" inputMode="decimal" min={0} defaultValue={payment.precioTotal} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="montoSena" className="text-xs">
                Monto Seña
              </Label>
              <Input id="montoSena" name="montoSena" type="number" inputMode="decimal" min={0} defaultValue={payment.montoSena} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="tipoFactura" className="text-xs">
                Tipo de Factura
              </Label>
              <Select name="tipoFactura" defaultValue={payment.tipoFactura}>
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
            <div className="space-y-1.5">
              <Label htmlFor="condicionPago" className="text-xs">
                Condición de Pago
              </Label>
              <Select name="condicionPago" defaultValue={payment.condicionPago}>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fechaSena" className="text-xs">
                Fecha de la Seña
              </Label>
              <Input
                id="fechaSena"
                name="fechaSena"
                type="date"
                defaultValue={payment.fechaSena ? new Date(payment.fechaSena).toISOString().slice(0, 10) : ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cuentaPagoSena" className="text-xs">
                Cuenta de Pago
              </Label>
              <Input id="cuentaPagoSena" name="cuentaPagoSena" defaultValue={payment.cuentaPagoSena ?? ""} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="urlComprobanteSena" className="text-xs">
              Comprobante de Seña (URL)
            </Label>
            <Input id="urlComprobanteSena" name="urlComprobanteSena" defaultValue={payment.urlComprobanteSena ?? ""} />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="senaPagada"
                defaultChecked={payment.senaPagada}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Seña pagada
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="pagadoTotal"
                defaultChecked={payment.pagadoTotal}
                className="h-4 w-4 rounded border-input accent-primary"
              />
              Pagado en su totalidad
            </label>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">Saldo pendiente actual</span>
            <span className={`text-sm font-bold ${saldo > 0 ? "text-warning" : "text-success"}`}>
              {formatCurrency(saldo)}
            </span>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
