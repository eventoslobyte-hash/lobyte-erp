"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WizardPayload } from "@/lib/types";
import { createOrderAction } from "@/app/(app)/alquileres/actions";

import { Step1ClienteEvento } from "@/components/orders/wizard/step-1-cliente-evento";
import { Step2Equipos } from "@/components/orders/wizard/step-2-equipos";
import { Step3Servicios } from "@/components/orders/wizard/step-3-servicios";
import { Step4Seguro } from "@/components/orders/wizard/step-4-seguro";
import { Step5Finanzas } from "@/components/orders/wizard/step-5-finanzas";

const STEPS = [
  { label: "Cliente y Evento" },
  { label: "Equipos" },
  { label: "Servicios Digitales" },
  { label: "Seguro" },
  { label: "Finanzas" },
];

function buildInitialState(defaultClienteId?: string): WizardPayload {
  return {
    clienteId: defaultClienteId || "",
    nombreEvento: "",
    ubicacionDireccion: "",
    ubicacionMapaUrl: "",
    fechaHoraEntrega: "",
    fechaHoraRetiro: "",
    estadoEvento: "PRESUPUESTADO",
    items: [{ modelo: "TOTEM_27_AUTOSERVICIO", cantidad: 1 }],
    digitalServices: [
      {
        tipoServicio: "ALQUILER_PURO",
        descripcionRequerimientos: "",
        estadoMaterial: "NO_NECESARIO",
        notasMaterialFaltante: "",
        urlArchivosAdjuntos: "",
      },
    ],
    insurance: { requiereSeguro: false, urlComprobanteSeguro: "", notas: "" },
    payment: {
      precioTotal: 0,
      tipoFactura: "SIN_FACTURA",
      condicionPago: "TRANSFERENCIA",
      montoSena: 0,
      fechaSena: "",
      cuentaPagoSena: "",
      urlComprobanteSena: "",
      senaPagada: false,
      pagadoTotal: false,
    },
  };
}

function validateStep(step: number, data: WizardPayload): string | null {
  if (step === 0) {
    if (!data.clienteId) return "Seleccioná un cliente.";
    if (!data.nombreEvento.trim()) return "Ingresá el nombre del evento.";
    if (!data.ubicacionDireccion.trim()) return "Ingresá la ubicación del evento.";
    if (!data.fechaHoraEntrega || !data.fechaHoraRetiro) return "Completá las fechas de entrega y retiro.";
    if (new Date(data.fechaHoraRetiro) <= new Date(data.fechaHoraEntrega)) {
      return "La fecha de retiro debe ser posterior a la fecha de entrega.";
    }
  }
  if (step === 1) {
    if (data.items.length === 0) return "Agregá al menos un equipo.";
  }
  if (step === 4) {
    if (data.payment.precioTotal <= 0) return "Ingresá el precio total del alquiler.";
  }
  return null;
}

export function OrderWizard({
  clients,
  stockByModel,
  defaultClienteId,
}: {
  clients: { id: string; razonSocial: string }[];
  stockByModel: Record<string, number>;
  defaultClienteId?: string;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardPayload>(() => buildInitialState(defaultClienteId));
  const [submitting, startSubmitting] = useTransition();

  const patch = (p: Partial<WizardPayload>) => setData((prev) => ({ ...prev, ...p }));

  const goNext = () => {
    const error = validateStep(step, data);
    if (error) {
      toast.error(error);
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = () => {
    const error = validateStep(4, data);
    if (error) {
      toast.error(error);
      return;
    }
    startSubmitting(async () => {
      try {
        await createOrderAction(data);
        toast.success("Alquiler creado correctamente.");
      } catch (err: any) {
        // Next.js usa excepciones especiales para redirect(); las dejamos pasar.
        if (err?.digest?.startsWith?.("NEXT_REDIRECT")) throw err;
        toast.error(err?.message || "No se pudo crear el alquiler.");
      }
    });
  };

  return (
    <div>
      {/* Indicador de pasos */}
      <div className="mb-6 flex items-center justify-between">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  i < step && "border-primary bg-primary text-primary-foreground",
                  i === step && "border-primary text-primary",
                  i > step && "border-border text-muted-foreground"
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "hidden text-center text-[11px] font-medium sm:block",
                  i === step ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("mx-2 h-0.5 flex-1", i < step ? "bg-primary" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 0 && <Step1ClienteEvento data={data} onChange={patch} clients={clients} />}
          {step === 1 && <Step2Equipos data={data} onChange={patch} />}
          {step === 2 && <Step3Servicios data={data} onChange={patch} />}
          {step === 3 && <Step4Seguro data={data} onChange={patch} />}
          {step === 4 && <Step5Finanzas data={data} onChange={patch} />}
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:flex sm:justify-between">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={goBack}
          disabled={step === 0 || submitting}
        >
          <ChevronLeft className="h-4 w-4" />
          Atrás
        </Button>

        {step < STEPS.length - 1 ? (
          <Button type="button" size="lg" onClick={goNext}>
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {submitting ? "Creando alquiler..." : "Crear Alquiler"}
          </Button>
        )}
      </div>
    </div>
  );
}
