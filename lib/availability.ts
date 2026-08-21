import { prisma } from "@/lib/prisma";
import type { EquipmentModel } from "@prisma/client";
import { areIntervalsOverlapping } from "date-fns";

// -----------------------------------------------------------------------------
// Motor de disponibilidad / prevención de overbooking.
//
// El stock de cada modelo de tótem es finito (tabla Equipment). Un alquiler
// "reserva" `cantidad` unidades de un `equipmentModel` durante el rango
// [fechaHoraEntrega, fechaHoraRetiro]. Dos reservas del mismo modelo que se
// solapan en el tiempo compiten por el mismo stock físico.
//
// Estados de Order que "consumen" stock: todo menos CANCELADO.
// (Presupuestado/En Cotización también bloquean stock preventivamente para
// evitar que dos presupuestos en simultáneo prometan el mismo tótem; se
// puede ajustar según la política comercial de LOBYTE.)
// -----------------------------------------------------------------------------

const ESTADOS_QUE_RESERVAN_STOCK = [
  "PRESUPUESTADO",
  "EN_COTIZACION",
  "CONFIRMADO",
  "EN_CURSO",
] as const;

export interface AvailabilityResult {
  modelo: EquipmentModel;
  stockTotal: number;
  reservado: number;
  disponible: number;
  cantidadSolicitada: number;
  ok: boolean;
}

/** Cantidad total de unidades físicas de un modelo (activas, no dadas de baja). */
export async function getStockTotal(modelo: EquipmentModel): Promise<number> {
  return prisma.equipment.count({
    where: { modelo, estado: { not: "BAJA" } },
  });
}

/** Cantidad ya reservada de un modelo para un rango de fechas dado. */
export async function getReservedQuantity(
  modelo: EquipmentModel,
  fechaHoraEntrega: Date,
  fechaHoraRetiro: Date,
  excludeOrderId?: string
): Promise<number> {
  const items = await prisma.orderItem.findMany({
    where: {
      equipmentModel: modelo,
      order: {
        estadoEvento: { in: [...ESTADOS_QUE_RESERVAN_STOCK] },
        ...(excludeOrderId ? { id: { not: excludeOrderId } } : {}),
      },
    },
    include: { order: true },
  });

  return items
    .filter((item) =>
      areIntervalsOverlapping(
        { start: item.order.fechaHoraEntrega, end: item.order.fechaHoraRetiro },
        { start: fechaHoraEntrega, end: fechaHoraRetiro },
        { inclusive: true }
      )
    )
    .reduce((sum, item) => sum + item.cantidad, 0);
}

/** Verifica si hay stock suficiente de un modelo para una nueva reserva. */
export async function checkAvailability(
  modelo: EquipmentModel,
  cantidadSolicitada: number,
  fechaHoraEntrega: Date,
  fechaHoraRetiro: Date,
  excludeOrderId?: string
): Promise<AvailabilityResult> {
  const [stockTotal, reservado] = await Promise.all([
    getStockTotal(modelo),
    getReservedQuantity(modelo, fechaHoraEntrega, fechaHoraRetiro, excludeOrderId),
  ]);

  const disponible = Math.max(0, stockTotal - reservado);

  return {
    modelo,
    stockTotal,
    reservado,
    disponible,
    cantidadSolicitada,
    ok: disponible >= cantidadSolicitada,
  };
}

/** Verifica disponibilidad para múltiples ítems de una sola vez (wizard paso 2). */
export async function checkAvailabilityBulk(
  items: { modelo: EquipmentModel; cantidad: number }[],
  fechaHoraEntrega: Date,
  fechaHoraRetiro: Date,
  excludeOrderId?: string
): Promise<AvailabilityResult[]> {
  return Promise.all(
    items.map((item) =>
      checkAvailability(item.modelo, item.cantidad, fechaHoraEntrega, fechaHoraRetiro, excludeOrderId)
    )
  );
}

export interface DayOccupancy {
  date: string; // yyyy-MM-dd
  reservado: number;
  stockTotal: number;
}

/**
 * Genera la ocupación día a día de un modelo entre dos fechas, para el
 * timeline / Gantt de disponibilidad.
 */
export async function getOccupancyByDay(
  modelo: EquipmentModel,
  rangeStart: Date,
  rangeEnd: Date
): Promise<DayOccupancy[]> {
  const stockTotal = await getStockTotal(modelo);

  const items = await prisma.orderItem.findMany({
    where: {
      equipmentModel: modelo,
      order: { estadoEvento: { in: [...ESTADOS_QUE_RESERVAN_STOCK] } },
    },
    include: { order: true },
  });

  const days: DayOccupancy[] = [];
  const cursor = new Date(rangeStart);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(rangeEnd);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const dayStart = new Date(cursor);
    const dayEnd = new Date(cursor);
    dayEnd.setHours(23, 59, 59, 999);

    const reservado = items
      .filter((item) =>
        areIntervalsOverlapping(
          { start: item.order.fechaHoraEntrega, end: item.order.fechaHoraRetiro },
          { start: dayStart, end: dayEnd },
          { inclusive: true }
        )
      )
      .reduce((sum, item) => sum + item.cantidad, 0);

    days.push({
      date: dayStart.toISOString().slice(0, 10),
      reservado,
      stockTotal,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}
