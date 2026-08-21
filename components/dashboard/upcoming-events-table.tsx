import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CountdownBadge } from "@/components/dashboard/countdown-badge";
import { OrderStatusBadge, SeguroBadge, SaldoBadge, MaterialBadge } from "@/components/dashboard/status-badges";
import { formatDate } from "@/lib/utils";
import type { OrderWithRelations } from "@/lib/alerts";

export function UpcomingEventsTable({ orders }: { orders: OrderWithRelations[] }) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
        <p className="text-sm font-medium">No hay próximos eventos</p>
        <p className="text-xs text-muted-foreground">Los alquileres confirmados van a aparecer acá.</p>
      </div>
    );
  }

  return (
    <>
      {/* Vista de tarjetas para mobile/tablet — pensada para revisar
          entregas del día desde el celular en el lugar del evento. */}
      <ul className="divide-y divide-border md:hidden">
        {orders.map((order) => (
          <li key={order.id}>
            <Link
              href={`/alquileres/${order.id}`}
              className="flex flex-col gap-2.5 px-4 py-4 active:bg-accent"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium leading-tight">{order.nombreEvento}</p>
                  <p className="text-xs text-muted-foreground">{order.cliente.razonSocial}</p>
                </div>
                <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              </div>

              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                {formatDate(order.fechaHoraEntrega, true)}
              </p>

              <CountdownBadge target={order.fechaHoraEntrega} className="self-start" />

              <div className="flex flex-wrap items-center gap-1.5">
                <OrderStatusBadge status={order.estadoEvento} />
                <SeguroBadge insurance={order.insurance} />
                <MaterialBadge services={order.digitalServices} />
                <SaldoBadge payment={order.payment} />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Vista de tabla para desktop */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Cuenta regresiva</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Seguro</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Saldo</TableHead>
              <TableHead className="text-right">Ver</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.nombreEvento}</TableCell>
                <TableCell className="text-muted-foreground">{order.cliente.razonSocial}</TableCell>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDate(order.fechaHoraEntrega, true)}
                </TableCell>
                <TableCell>
                  <CountdownBadge target={order.fechaHoraEntrega} />
                </TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.estadoEvento} />
                </TableCell>
                <TableCell>
                  <SeguroBadge insurance={order.insurance} />
                </TableCell>
                <TableCell>
                  <MaterialBadge services={order.digitalServices} />
                </TableCell>
                <TableCell>
                  <SaldoBadge payment={order.payment} />
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/alquileres/${order.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Detalle <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
