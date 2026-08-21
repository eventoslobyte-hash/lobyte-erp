import Link from "next/link";
import { MessageCircle, Mail, Star, ArrowUpRight } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RatingStars } from "@/components/clients/rating-stars";
import { buildSurveyMessage, buildWhatsAppLink, buildMailtoLink } from "@/lib/post-event-templates";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PostEventoPage() {
  const orders = await prisma.order.findMany({
    where: { estadoEvento: "FINALIZADO" },
    include: { cliente: true, postEvent: true },
    orderBy: { fechaHoraRetiro: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Post-Evento / Feedback</h1>
        <p className="text-sm text-muted-foreground">
          Alquileres finalizados — enviá la encuesta de satisfacción y registrá reseñas.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Finalizado</TableHead>
                <TableHead>Encuestado</TableHead>
                <TableHead>Reseña</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const message = buildSurveyMessage({
                  contactoNombre: order.cliente.contactoNombre,
                  nombreEvento: order.nombreEvento,
                });
                const whatsappLink = buildWhatsAppLink(order.cliente.telefono, message);
                const mailtoLink = order.cliente.email
                  ? buildMailtoLink(order.cliente.email, {
                      contactoNombre: order.cliente.contactoNombre,
                      nombreEvento: order.nombreEvento,
                    })
                  : null;

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.nombreEvento}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{order.cliente.razonSocial}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(order.fechaHoraRetiro)}</TableCell>
                    <TableCell>
                      <Badge variant={order.postEvent?.encuestado ? "success" : "muted"} dot>
                        {order.postEvent?.encuestado ? "Sí" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.postEvent?.linkResenaEnviado ? "success" : "muted"} dot>
                        {order.postEvent?.linkResenaEnviado ? "Enviada" : "Sin enviar"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.postEvent?.calificacionSatisfaccion ? (
                        <RatingStars value={order.postEvent.calificacionSatisfaccion} />
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3" /> Sin calificar
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild size="icon" variant="ghost" title="Enviar por WhatsApp">
                          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </Button>
                        {mailtoLink && (
                          <Button asChild size="icon" variant="ghost" title="Enviar por Email">
                            <a href={mailtoLink}>
                              <Mail className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button asChild size="icon" variant="ghost" title="Ver detalle">
                          <Link href={`/alquileres/${order.id}`}>
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    Todavía no hay alquileres finalizados.
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
