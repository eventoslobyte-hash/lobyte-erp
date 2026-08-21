import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClientForm } from "@/components/clients/client-form";
import { createClientAction } from "@/app/(app)/clientes/actions";

export default function NuevoClientePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Nuevo Cliente</h1>
        <p className="text-sm text-muted-foreground">Cargá los datos del cliente para poder asociarlo a alquileres.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Cliente</CardTitle>
          <CardDescription>Los campos marcados con * son obligatorios.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm action={createClientAction} submitLabel="Crear Cliente" />
        </CardContent>
      </Card>
    </div>
  );
}
