import type { Payment } from "@prisma/client";

/**
 * Calcula el saldo pendiente de un alquiler.
 * saldo_pendiente = precio_total - (seña, solo si fue efectivamente pagada)
 */
export function calcularSaldoPendiente(payment: Pick<Payment, "precioTotal" | "montoSena" | "senaPagada" | "pagadoTotal">): number {
  if (payment.pagadoTotal) return 0;
  const senaAplicada = payment.senaPagada ? payment.montoSena : 0;
  const saldo = payment.precioTotal - senaAplicada;
  return Math.max(0, Math.round(saldo * 100) / 100);
}

export function estaSaldado(payment: Pick<Payment, "precioTotal" | "montoSena" | "senaPagada" | "pagadoTotal">): boolean {
  return payment.pagadoTotal || calcularSaldoPendiente(payment) <= 0;
}
