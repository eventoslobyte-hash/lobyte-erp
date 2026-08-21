import Link from "next/link";
import { Plus, Mail, Phone } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RatingStars } from "@/components/clients/rating-stars";
import { origenClienteLabels } from "@/lib/labels";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clients = await prisma.client.findMany({
    orderBy: { razonSocial: "asc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clients.length} clientes registrados.</p>
        </div>
        <Button asChild>
          <Link href="/clientes/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Próxima Expo</TableHead>
                <TableHead>Alquileres</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/clientes/${client.id}`} className="font-medium text-foreground hover:underline">
                      {client.razonSocial}
                    </Link>
                    {client.cuitCuil && <p className="text-xs text-muted-foreground">{client.cuitCuil}</p>}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{client.contactoNombre}</p>
                    <div className="mt-0.5 flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {client.telefono}
                      </span>
                      {client.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {client.email}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{origenClienteLabels[client.origenCliente]}</Badge>
                  </TableCell>
                  <TableCell>
                    <RatingStars value={client.internalRating} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {client.proximaExpo ? (
                      <>
                        {client.proximaExpo}
                        {client.fechaProximaExpo && (
                          <p className="text-xs">{formatDate(client.fechaProximaExpo)}</p>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{client._count.orders}</TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    Todavía no hay clientes cargados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
