import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EquipmentForm } from "@/components/equipment/equipment-form";
import { updateEquipmentAction } from "@/app/(app)/equipos/actions";

export const dynamic = "force-dynamic";

export default async function EquipoDetailPage({ params }: { params: { id: string } }) {
  const equipment = await prisma.equipment.findUnique({ where: { id: params.id } });
  if (!equipment) notFound();

  const boundUpdate = updateEquipmentAction.bind(null, equipment.id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{equipment.codigoInterno}</h1>
        <p className="text-sm text-muted-foreground">Editar datos del equipo.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Equipo</CardTitle>
          <CardDescription>Los cambios de estado impactan en la disponibilidad de stock.</CardDescription>
        </CardHeader>
        <CardContent>
          <EquipmentForm action={boundUpdate} defaultValues={equipment} submitLabel="Guardar cambios" />
        </CardContent>
      </Card>
    </div>
  );
}
