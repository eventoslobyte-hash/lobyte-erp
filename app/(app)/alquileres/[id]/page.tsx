import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ExternalLink, FileText } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CountdownBadge } from "@/components/dashboard/countdown-badge";
import { StatusSelector } from "@/components/orders/status-selector";
import { CalendarSyncButton } from "@/components/orders/calendar-sync-button";
import { CancelOrderButton } from "@/components/orders/cancel-order-button";
import { OrderItemsList } from "@/components/orders/order-items-list";
import { DigitalServiceCard } from "@/components/orders/digital-service-card";
import { InsuranceCard } from "@/components/orders/insurance-card";
import { PaymentCard } from "@/components/orders/payment-card";
import { FeedbackPanel } from "@/components/post-event/feedback-panel";
import { formatDate } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";
import {
  updateOrderStatusAction,
  syncOrderCalendarAction,
  cancelOrderAction,
  updateDigitalServiceAction,
  updateInsuranceAction,
  updatePaymentAction,
  markPostEventAction,
} from "@/app/(app)/alquileres/actions";

export const dynamic = "force-dynamic";

export default async function AlquilerDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      cliente: true,
      items: true,
      digitalServices: true,
      insurance: true,
      payment: true,
      postEvent: true,
    },
  });

  if (!order) notFound();

  const boundStatus = async (estado: OrderStatus) => {
    "use server";
    await updateOrderStatusAction(order.id, estado);
  };
  const boundSync = async () => {
    "use server";
    return syncOrderCalendarAction(order.id);
  };
  const boundCancel = async () => {
    "use server";
    await cancelOrderAction(order.id);
  };
  const boundInsurance = updateInsuranceAction.bind(null, order.id);
  const boundPayment = updatePaymentAction.bind(null, order.id);
  const boundPostEvent = markPostEventAction.bind(null, order.id);

  return (
    <div>
      <div className="mb-6">
        <Link href="/alquileres" className="text-sm text-muted-foreground hover:underline">
          ← Volver a Alquileres
        </Link>
      </div>

      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{order.nombreEvento}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cliente:{" "}
            <Link href={`/clientes/${order.clienteId}`} className="font-medium text-primary hover:underline">
              {order.cliente.razonSocial}
            </Link>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <CountdownBadge target={order.fechaHoraEntrega} />
            <span className="text-xs text-muted-foreground">hasta la entrega</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/alquileres/${order.id}/remito?tipo=entrega`} target="_blank">
              <FileText className="mr-2 h-4 w-4" />
              Remito de Entrega
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/alquileres/${order.id}/remito?tipo=retiro`} target="_blank">
              <FileText className="mr-2 h-4 w-4" />
              Remito de Retiro
            </Link>
          </Button>
          <StatusSelector value={order.estadoEvento} action={boundStatus} />
          <CalendarSyncButton action={boundSync} />
          {order.estadoEvento !== "CANCELADO" && <CancelOrderButton action={boundCancel} />}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Datos del Evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Entrega</p>
                  <p className="text-sm font-medium">{formatDate(order.fechaHoraEntrega, true)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Retiro</p>
                  <p className="text-sm font-medium">{formatDate(order.fechaHoraRetiro, true)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase text-muted-foreground">Duración</p>
                  <p className="text-sm font-medium">{order.cantidadDias} día(s)</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Ubicación</p>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {order.ubicacionDireccion}
                  {order.ubicacionMapaUrl && (
                    <a
                      href={order.ubicacionMapaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline"
                    >
                      Ver mapa <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Equipos Reservados</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderItemsList items={order.items} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Servicios Digitales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.digitalServices.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin servicios digitales cargados.</p>
              ) : (
                order.digitalServices.map((service) => (
                  <DigitalServiceCard
                    key={service.id}
                    service={service}
                    action={updateDigitalServiceAction.bind(null, service.id, order.id)}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {order.postEvent && (
            <FeedbackPanel
              postEvent={order.postEvent}
              contactoNombre={order.cliente.contactoNombre}
              nombreEvento={order.nombreEvento}
              telefono={order.cliente.telefono}
              email={order.cliente.email}
              action={boundPostEvent}
            />
          )}
        </div>

        <div className="space-y-6">
          {order.insurance && <InsuranceCard insurance={order.insurance} action={boundInsurance} />}
          {order.payment && <PaymentCard payment={order.payment} action={boundPayment} />}
        </div>
      </div>
    </div>
  );
}
