import { Badge } from "@/components/ui/badge";
import { orderStatusColors, orderStatusLabels } from "@/lib/labels";
import type { Insurance, Payment, DigitalService, OrderStatus } from "@prisma/client";
import { calcularSaldoPendiente } from "@/lib/finance";
import { formatCurrency } from "@/lib/utils";

export function SeguroBadge({ insurance }: { insurance: Insurance | null }) {
  if (!insurance || !insurance.requiereSeguro) {
    return (
      <Badge variant="muted" dot>
        No requiere
      </Badge>
    );
  }
  if (insurance.estado === "PRESENTADO") {
    return (
      <Badge variant="success" dot>
        Seguro OK
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" dot>
      Seguro Pendiente
    </Badge>
  );
}

export function SaldoBadge({ payment }: { payment: Payment | null }) {
  if (!payment) {
    return (
      <Badge variant="muted" dot>
        Sin datos
      </Badge>
    );
  }
  const saldo = calcularSaldoPendiente(payment);
  if (saldo <= 0) {
    return (
      <Badge variant="success" dot>
        Saldo Pagado
      </Badge>
    );
  }
  return (
    <Badge variant="warning" dot>
      Pendiente {formatCurrency(saldo)}
    </Badge>
  );
}

export function MaterialBadge({ services }: { services: DigitalService[] }) {
  if (services.length === 0 || services.every((s) => s.estadoMaterial === "NO_NECESARIO")) {
    return (
      <Badge variant="muted" dot>
        No aplica
      </Badge>
    );
  }
  const incompleto = services.some((s) => s.estadoMaterial === "PENDIENTE" || s.estadoMaterial === "INCOMPLETO");
  if (incompleto) {
    return (
      <Badge variant="warning" dot>
        Material Incompleto
      </Badge>
    );
  }
  return (
    <Badge variant="success" dot>
      Material Completo
    </Badge>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variant = orderStatusColors[status] as
    | "muted"
    | "warning"
    | "brand"
    | "success"
    | "destructive";
  return <Badge variant={variant}>{orderStatusLabels[status]}</Badge>;
}
