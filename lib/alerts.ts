import { prisma } from "@/lib/prisma";
import { calcularSaldoPendiente } from "@/lib/finance";
import { getCountdown } from "@/lib/countdown";
import type { Order, Insurance, Payment, DigitalService, Client } from "@prisma/client";

export type OrderWithRelations = Order & {
  cliente: Client;
  insurance: Insurance | null;
  payment: Payment | null;
  digitalServices: DigitalService[];
};

export interface OrderAlertFlags {
  seguroPendiente: boolean;
  materialIncompleto: boolean;
  saldoPendiente: boolean;
  entregaEn48h: boolean;
  retiroEn48h: boolean;
}

const ESTADOS_ACTIVOS = ["PRESUPUESTADO", "EN_COTIZACION", "CONFIRMADO", "EN_CURSO"] as const;

export function getOrderAlertFlags(order: OrderWithRelations): OrderAlertFlags {
  const seguroPendiente = !!order.insurance?.requiereSeguro && order.insurance.estado === "PENDIENTE";

  const materialIncompleto = order.digitalServices.some(
    (s) => s.estadoMaterial === "PENDIENTE" || s.estadoMaterial === "INCOMPLETO"
  );

  const saldoPendiente = order.payment
    ? calcularSaldoPendiente(order.payment) > 0
    : false;

  const entregaCountdown = getCountdown(order.fechaHoraEntrega);
  const retiroCountdown = getCountdown(order.fechaHoraRetiro);

  return {
    seguroPendiente,
    materialIncompleto,
    saldoPendiente,
    entregaEn48h: entregaCountdown.isUrgent,
    retiroEn48h: retiroCountdown.isUrgent,
  };
}

export interface CriticalAlert {
  orderId: string;
  nombreEvento: string;
  cliente: string;
  tipo: "seguro" | "material" | "saldo" | "entrega";
  mensaje: string;
  severidad: "alta" | "media";
}

/**
 * Devuelve las alertas críticas globales: entregas a menos de 48hs que
 * todavía tienen seguro pendiente, material incompleto o saldo sin cobrar.
 * Se usa en el banner de notificaciones del dashboard.
 */
export async function getCriticalAlerts(): Promise<CriticalAlert[]> {
  const orders = await prisma.order.findMany({
    where: { estadoEvento: { in: [...ESTADOS_ACTIVOS] } },
    include: { cliente: true, insurance: true, payment: true, digitalServices: true },
    orderBy: { fechaHoraEntrega: "asc" },
  });

  const alerts: CriticalAlert[] = [];

  for (const order of orders) {
    const flags = getOrderAlertFlags(order);
    if (!flags.entregaEn48h) continue;

    if (flags.seguroPendiente) {
      alerts.push({
        orderId: order.id,
        nombreEvento: order.nombreEvento,
        cliente: order.cliente.razonSocial,
        tipo: "seguro",
        mensaje: `${order.nombreEvento}: entrega en menos de 48hs y el seguro sigue PENDIENTE`,
        severidad: "alta",
      });
    }
    if (flags.materialIncompleto) {
      alerts.push({
        orderId: order.id,
        nombreEvento: order.nombreEvento,
        cliente: order.cliente.razonSocial,
        tipo: "material",
        mensaje: `${order.nombreEvento}: entrega en menos de 48hs y falta material digital`,
        severidad: "alta",
      });
    }
    if (flags.saldoPendiente) {
      alerts.push({
        orderId: order.id,
        nombreEvento: order.nombreEvento,
        cliente: order.cliente.razonSocial,
        tipo: "saldo",
        mensaje: `${order.nombreEvento}: entrega en menos de 48hs con saldo pendiente de cobro`,
        severidad: "media",
      });
    }
  }

  return alerts.sort((a, b) => (a.severidad === b.severidad ? 0 : a.severidad === "alta" ? -1 : 1));
}
