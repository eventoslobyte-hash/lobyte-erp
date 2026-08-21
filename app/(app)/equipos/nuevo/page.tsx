import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EquipmentForm } from "@/components/equipment/equipment-form";
import { createEquipmentAction } from "@/app/(app)/equipos/actions";

export default function NuevoEquipoPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Nuevo Equipo</h1>
        <p className="text-sm text-muted-foreground">Registrá una nueva unidad de inventario.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Equipo</CardTitle>
          <CardDescription>El código interno debe ser único.</CardDescription>
        </CardHeader>
        <CardContent>
          <EquipmentForm action={createEquipmentAction} submitLabel="Crear Equipo" />
        </CardContent>
      </Card>
    </div>
  );
}
