import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, Building2, Plus } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RatingStars } from "@/components/clients/rating-stars";
import { ClientForm } from "@/components/clients/client-form";
import { OrderStatusBadge, SaldoBadge, SeguroBadge } from "@/components/dashboard/status-badges";
import { updateClientAction } from "@/app/(app)/clientes/actions";
import { origenClienteLabels } from "@/lib/labels";
import { formatDate, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      orders: {
        include: { insurance: true, payment: true },
        orderBy: { fechaHoraEntrega: "desc" },
      },
    },
  });

  if (!client) notFound();

  const boundUpdate = updateClientAction.bind(null, client.id);

  return (
    <div>
      <div className="mb-6 flex items-start gap-4">
        <Avatar className="h-14 w-14">
          <AvatarFallback className="text-lg">{initials(client.razonSocial)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{client.razonSocial}</h1>
            <RatingStars value={client.internalRating} size="md" />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" /> {origenClienteLabels[client.origenCliente]}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" /> {client.telefono}
            </span>
            {client.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {client.email}
              </span>
            )}
          </div>
        </div>
        <Button asChild>
          <Link href={`/alquileres/nuevo?clienteId=${client.id}`}>
            <Plus className="h-4 w-4" />
            Nuevo Alquiler
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="alquileres">
        <TabsList>
          <TabsTrigger value="alquileres">Alquileres ({client.orders.length})</TabsTrigger>
          <TabsTrigger value="informacion">Información</TabsTrigger>
        </TabsList>

        <TabsContent value="alquileres">
          <Card>
            <CardContent className="p-0">
              {client.orders.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">
                  Este cliente todavía no tiene alquileres.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {client.orders.map((order) => (
                    <li key={order.id}>
                      <Link
                        href={`/alquileres/${order.id}`}
                        className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-accent sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium">{order.nombreEvento}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.fechaHoraEntrega)} — {formatDate(order.fechaHoraRetiro)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <OrderStatusBadge status={order.estadoEvento} />
                          <SeguroBadge insurance={order.insurance} />
                          <SaldoBadge payment={order.payment} />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="informacion">
          <Card>
            <CardHeader>
              <CardTitle>Editar información</CardTitle>
              <CardDescription>
                Notas de comportamiento, próxima expo y datos de contacto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientForm action={boundUpdate} defaultValues={client} submitLabel="Guardar cambios" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
