"use client";

import { Printer, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/post-event-templates";
import { buildRemitoWhatsAppMessage, type RemitoTipo } from "@/lib/remito";

export function RemitoActions({
  tipo,
  contactoNombre,
  nombreEvento,
  telefono,
  remitoUrl,
}: {
  tipo: RemitoTipo;
  contactoNombre: string;
  nombreEvento: string;
  telefono: string;
  remitoUrl: string;
}) {
  const whatsappHref = buildWhatsAppLink(
    telefono,
    buildRemitoWhatsAppMessage({ tipo, contactoNombre, nombreEvento, remitoUrl })
  );

  return (
    <div className="mx-auto mb-4 flex max-w-3xl flex-wrap items-center justify-end gap-2 print:hidden">
      <Button variant="outline" asChild>
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="mr-2 h-4 w-4" />
          Compartir por WhatsApp
        </a>
      </Button>
      <Button onClick={() => window.print()}>
        <Printer className="mr-2 h-4 w-4" />
        Imprimir / Guardar PDF
      </Button>
    </div>
  );
}
