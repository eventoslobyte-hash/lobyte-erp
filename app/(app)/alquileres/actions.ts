"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { checkAvailabilityBulk, type AvailabilityResult } from "@/lib/availability";
import { syncOrderToGoogleCalendar, deleteOrderFromGoogleCalendar } from "@/lib/google-calendar";
import type { WizardPayload } from "@/lib/types";
import type {
  OrderStatus,
  InsuranceStatus,
  MaterialStatus,
  InvoiceType,
  PaymentMethod,
} from "@prisma/client";

function differenceInDaysCeil(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** Usado por el Paso 2 del wizard para chequear stock en tiempo real. */
export async function checkAvailabilityAction(
  items: { modelo: WizardPayload["items"][number]["modelo"]; cantidad: number }[],
  fechaHoraEntrega: string,
  fechaHoraRetiro: string
): Promise<AvailabilityResult[]> {
  if (!fechaHoraEntrega || !fechaHoraRetiro || items.length === 0) return [];
  const entrega = new Date(fechaHoraEntrega);
  const retiro = new Date(fechaHoraRetiro);
  if (isNaN(entrega.getTime()) || isNaN(retiro.getTime())) return [];
  return checkAvailabilityBulk(items, entrega, retiro);
}

export async function createOrderAction(payload: WizardPayload) {
  const entrega = new Date(payload.fechaHoraEntrega);
  const retiro = new Date(payload.fechaHoraRetiro);

  if (isNaN(entrega.getTime()) || isNaN(retiro.getTime()) || retiro <= entrega) {
    throw new Error("Las fechas de entrega y retiro no son válidas.");
  }
  if (!payload.clienteId) throw new Error("Falta seleccionar un cliente.");
  if (payload.items.length === 0) throw new Error("Agregá al menos un equipo al alquiler.");

  // Re-chequeo de disponibilidad en servidor (defensa contra condiciones de carrera)
  const availability = await checkAvailabilityBulk(payload.items, entrega, retiro);
  const overbooked = availability.filter((a) => !a.ok);
  if (overbooked.length > 0) {
    throw new Error(
      `Sin stock suficiente para: ${overbooked.map((o) => `${o.modelo} (pediste ${o.cantidadSolicitada}, hay ${o.disponible})`).join(", ")}`
    );
  }

  const order = await prisma.order.create({
    data: {
      clienteId: payload.clienteId,
      nombreEvento: payload.nombreEvento,
      ubicacionDireccion: payload.ubicacionDireccion,
      ubicacionMapaUrl: payload.ubicacionMapaUrl || null,
      fechaHoraEntrega: entrega,
      fechaHoraRetiro: retiro,
      cantidadDias: differenceInDaysCeil(entrega, retiro),
      estadoEvento: payload.estadoEvento,
      items: { create: payload.items.map((i) => ({ equipmentModel: i.modelo, cantidad: i.cantidad })) },
      digitalServices: {
        create: payload.digitalServices.map((s) => ({
          tipoServicio: s.tipoServicio,
          descripcionRequerimientos: s.descripcionRequerimientos || null,
          estadoMaterial: s.estadoMaterial,
          notasMaterialFaltante: s.notasMaterialFaltante || null,
          urlArchivosAdjuntos: s.urlArchivosAdjuntos || null,
        })),
      },
      insurance: {
        create: {
          requiereSeguro: payload.insurance.requiereSeguro,
          estado: payload.insurance.requiereSeguro
            ? (payload.insurance.urlComprobanteSeguro ? "PRESENTADO" : "PENDIENTE")
            : "NO_REQUERIDO",
          urlComprobanteSeguro: payload.insurance.urlComprobanteSeguro || null,
          notas: payload.insurance.notas || null,
        },
      },
      payment: {
        create: {
          precioTotal: payload.payment.precioTotal,
          tipoFactura: payload.payment.tipoFactura,
          condicionPago: payload.payment.condicionPago,
          montoSena: payload.payment.montoSena,
          fechaSena: payload.payment.fechaSena ? new Date(payload.payment.fechaSena) : null,
          cuentaPagoSena: payload.payment.cuentaPagoSena || null,
          urlComprobanteSena: payload.payment.urlComprobanteSena || null,
          senaPagada: payload.payment.senaPagada,
          pagadoTotal: payload.payment.pagadoTotal,
        },
      },
      postEvent: { create: {} },
    },
    include: { cliente: true },
  });

  // Sincronización con Google Calendar (no bloqueante: si falla, el alquiler igual se crea)
  try {
    const sync = await syncOrderToGoogleCalendar(order);
    if (!sync.skipped) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          gcalEventIdEntrega: sync.gcalEventIdEntrega,
          gcalEventIdRetiro: sync.gcalEventIdRetiro,
          gcalLastSyncAt: new Date(),
        },
      });
    }
  } catch (err) {
    console.error("No se pudo sincronizar con Google Calendar:", err);
  }

  revalidatePath("/alquileres");
  revalidatePath("/");
  redirect(`/alquileres/${order.id}`);
}

export async function updateOrderStatusAction(orderId: string, estadoEvento: OrderStatus) {
  await prisma.order.update({ where: { id: orderId }, data: { estadoEvento } });
  revalidatePath(`/alquileres/${orderId}`);
  revalidatePath("/alquileres");
  revalidatePath("/");
}

export async function updateInsuranceAction(orderId: string, formData: FormData) {
  const requiereSeguro = formData.get("requiereSeguro") === "on";
  const estado = String(formData.get("estado") || "PENDIENTE") as InsuranceStatus;

  await prisma.insurance.update({
    where: { orderId },
    data: {
      requiereSeguro,
      estado,
      urlComprobanteSeguro: String(formData.get("urlComprobanteSeguro") || "") || null,
      notas: String(formData.get("notas") || "") || null,
    },
  });

  revalidatePath(`/alquileres/${orderId}`);
  revalidatePath("/");
}

export async function updatePaymentAction(orderId: string, formData: FormData) {
  await prisma.payment.update({
    where: { orderId },
    data: {
      precioTotal: Number(formData.get("precioTotal") || 0),
      tipoFactura: String(formData.get("tipoFactura") || "SIN_FACTURA") as InvoiceType,
      condicionPago: String(formData.get("condicionPago") || "TRANSFERENCIA") as PaymentMethod,
      montoSena: Number(formData.get("montoSena") || 0),
      fechaSena: formData.get("fechaSena") ? new Date(String(formData.get("fechaSena"))) : null,
      cuentaPagoSena: String(formData.get("cuentaPagoSena") || "") || null,
      urlComprobanteSena: String(formData.get("urlComprobanteSena") || "") || null,
      senaPagada: formData.get("senaPagada") === "on",
      pagadoTotal: formData.get("pagadoTotal") === "on",
    },
  });

  revalidatePath(`/alquileres/${orderId}`);
  revalidatePath("/");
}

export async function updateDigitalServiceAction(serviceId: string, orderId: string, formData: FormData) {
  await prisma.digitalService.update({
    where: { id: serviceId },
    data: {
      estadoMaterial: String(formData.get("estadoMaterial") || "PENDIENTE") as MaterialStatus,
      notasMaterialFaltante: String(formData.get("notasMaterialFaltante") || "") || null,
      urlArchivosAdjuntos: String(formData.get("urlArchivosAdjuntos") || "") || null,
    },
  });

  revalidatePath(`/alquileres/${orderId}`);
  revalidatePath("/");
}

export async function syncOrderCalendarAction(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { cliente: true } });
  if (!order) throw new Error("Alquiler no encontrado");

  const sync = await syncOrderToGoogleCalendar(order);
  if (!sync.skipped) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        gcalEventIdEntrega: sync.gcalEventIdEntrega,
        gcalEventIdRetiro: sync.gcalEventIdRetiro,
        gcalLastSyncAt: new Date(),
      },
    });
  }

  revalidatePath(`/alquileres/${orderId}`);
  return sync;
}

export async function cancelOrderAction(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Alquiler no encontrado");

  await prisma.order.update({ where: { id: orderId }, data: { estadoEvento: "CANCELADO" } });

  try {
    await deleteOrderFromGoogleCalendar(order);
  } catch (err) {
    console.error("No se pudo eliminar el evento de Google Calendar:", err);
  }

  revalidatePath(`/alquileres/${orderId}`);
  revalidatePath("/alquileres");
  revalidatePath("/");
}

export async function markPostEventAction(orderId: string, formData: FormData) {
  const data = {
    linkResenaEnviado: formData.get("linkResenaEnviado") === "on",
    encuestado: formData.get("encuestado") === "on",
    calificacionSatisfaccion: formData.get("calificacionSatisfaccion")
      ? Number(formData.get("calificacionSatisfaccion"))
      : null,
    comentariosCliente: String(formData.get("comentariosCliente") || "") || null,
  };

  await prisma.postEvent.upsert({
    where: { orderId },
    update: data,
    create: { orderId, ...data },
  });

  revalidatePath(`/alquileres/${orderId}`);
  revalidatePath("/post-evento");
}

export async function markSurveySentAction(orderId: string) {
  await prisma.postEvent.upsert({
    where: { orderId },
    update: { linkResenaEnviado: true },
    create: { orderId, linkResenaEnviado: true },
  });
  revalidatePath("/post-evento");
  revalidatePath(`/alquileres/${orderId}`);
}
