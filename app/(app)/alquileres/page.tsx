import Link from "next/link";
import { Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge, SeguroBadge, SaldoBadge, MaterialBadge } from "@/components/dashboard/status-badges";
import { orderStatusLabels } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AlquileresPage({
  searchParams,
}: {
  searchParams: { estado?: string };
}) {
  const estadoFilter = searchParams.estado as OrderStatus | undefined;

  const orders = await prisma.order.findMany({
    where: estadoFilter ? { estadoEvento: estadoFilter } : undefined,
    include: { cliente: true, insurance: true, payment: true, digitalServices: true },
    orderBy: { fechaHoraEntrega: "desc" },
  });

  const filters: { label: string; value?: OrderStatus }[] = [
    { label: "Todos" },
    ...(Object.entries(orderStatusLabels).map(([value, label]) => ({ label, value: value as OrderStatus }))),
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alquileres</h1>
          <p className="text-sm text-muted-foreground">{orders.length} resultados.</p>
        </div>
        <Button asChild>
          <Link href="/alquileres/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo Alquiler
          </Link>
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => {
          const isActive = f.value === estadoFilter || (!f.value && !estadoFilter);
          return (
            <Link
              key={f.label}
              href={f.value ? `/alquileres?estado=${f.value}` : "/alquileres"}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-accent"
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No hay alquileres para este filtro.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tarjetas para mobile/tablet */}
          <div className="space-y-3 md:hidden">
            {orders.map((order) => (
              <Link key={order.id} href={`/alquileres/${order.id}`} className="block">
                <Card className="active:bg-accent">
                  <CardContent className="space-y-2.5 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium leading-tight">{order.nombreEvento}</p>
                      <OrderStatusBadge status={order.estadoEvento} />
                    </div>
                    <p className="text-xs text-muted-foreground">{order.cliente.razonSocial}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.fechaHoraEntrega, true)} → {formatDate(order.fechaHoraRetiro, true)}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <SeguroBadge insurance={order.insurance} />
                      <MaterialBadge services={order.digitalServices} />
                      <SaldoBadge payment={order.payment} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Tabla para desktop */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Entrega</TableHead>
                    <TableHead>Retiro</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Seguro</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="cursor-pointer">
                      <TableCell>
                        <Link href={`/alquileres/${order.id}`} className="font-medium hover:underline">
                          {order.nombreEvento}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{order.cliente.razonSocial}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(order.fechaHoraEntrega, true)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(order.fechaHoraRetiro, true)}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
