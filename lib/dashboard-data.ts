import { prisma } from "@/lib/prisma";
import { calcularSaldoPendiente } from "@/lib/finance";
import { startOfWeek, endOfWeek, addHours } from "date-fns";
import type { OrderWithRelations } from "@/lib/alerts";

const ESTADOS_ACTIVOS = ["PRESUPUESTADO", "EN_COTIZACION", "CONFIRMADO", "EN_CURSO"] as const;

export interface DashboardKpis {
  alquileresActivosSemana: number;
  saldosPorCobrar: number;
  proximasEntregas48h: number;
  segurosPendientes: number;
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const in48h = addHours(now, 48);

  const orders = await prisma.order.findMany({
    where: { estadoEvento: { in: [...ESTADOS_ACTIVOS] } },
    include: { insurance: true, payment: true },
  });

  const alquileresActivosSemana = orders.filter(
    (o) => o.fechaHoraEntrega <= weekEnd && o.fechaHoraRetiro >= weekStart
  ).length;

  const saldosPorCobrar = orders.reduce((sum, o) => {
    if (!o.payment) return sum;
    return sum + calcularSaldoPendiente(o.payment);
  }, 0);

  const proximasEntregas48h = orders.filter(
    (o) => o.fechaHoraEntrega >= now && o.fechaHoraEntrega <= in48h
  ).length;

  const segurosPendientes = orders.filter(
    (o) => o.insurance?.requiereSeguro && o.insurance.estado === "PENDIENTE"
  ).length;

  return { alquileresActivosSemana, saldosPorCobrar, proximasEntregas48h, segurosPendientes };
}

/** Próximos eventos (entregas futuras u órdenes en curso), para la tabla del dashboard. */
export async function getUpcomingEvents(limit = 8): Promise<OrderWithRelations[]> {
  const now = new Date();

  const orders = await prisma.order.findMany({
    where: {
      estadoEvento: { in: [...ESTADOS_ACTIVOS] },
      fechaHoraRetiro: { gte: now },
    },
    include: { cliente: true, insurance: true, payment: true, digitalServices: true },
    orderBy: { fechaHoraEntrega: "asc" },
    take: limit,
  });

  return orders;
}
