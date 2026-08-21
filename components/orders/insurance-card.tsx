"use client";

import { useFormStatus } from "react-dom";
import { ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { insuranceStatusLabels } from "@/lib/labels";
import type { Insurance } from "@prisma/client";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Guardando..." : "Guardar seguro"}
    </Button>
  );
}

export function InsuranceCard({
  insurance,
  action,
}: {
  insurance: Insurance;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Seguro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="requiereSeguro"
              defaultChecked={insurance.requiereSeguro}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            Requiere seguro
          </label>

          <div className="space-y-1.5">
            <Label htmlFor="estado" className="text-xs">
              Estado
            </Label>
            <Select name="estado" defaultValue={insurance.estado}>
              <SelectTrigger id="estado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(insuranceStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="urlComprobanteSeguro" className="text-xs">
              URL del comprobante
            </Label>
            <Input
              id="urlComprobanteSeguro"
              name="urlComprobanteSeguro"
              defaultValue={insurance.urlComprobanteSeguro ?? ""}
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notas" className="text-xs">
              Notas
            </Label>
            <Textarea id="notas" name="notas" rows={2} defaultValue={insurance.notas ?? ""} />
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
