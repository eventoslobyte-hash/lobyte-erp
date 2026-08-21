import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { RemitoDocument } from "@/components/orders/remito/remito-document";
import { RemitoActions } from "@/components/orders/remito/remito-actions";
import type { RemitoTipo } from "@/lib/remito";

export const dynamic = "force-dynamic";

function parseTipo(value: string | string[] | undefined): RemitoTipo {
  return value === "retiro" ? "retiro" : "entrega";
}

export default async function RemitoPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { tipo?: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { cliente: true, items: true },
  });

  if (!order) notFound();

  const tipo = parseTipo(searchParams.tipo);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const remitoUrl = `${baseUrl}/alquileres/${order.id}/remito?tipo=${tipo}`;

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:bg-white print:py-0">
      <RemitoActions
        tipo={tipo}
        contactoNombre={order.cliente.contactoNombre}
        nombreEvento={order.nombreEvento}
        telefono={order.cliente.telefono}
        remitoUrl={remitoUrl}
      />
      <div className="mx-auto max-w-3xl shadow-lg print:shadow-none">
        <RemitoDocument order={order} tipo={tipo} />
      </div>
    </div>
  );
}
