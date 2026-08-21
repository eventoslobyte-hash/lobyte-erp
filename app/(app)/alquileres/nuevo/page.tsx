import { prisma } from "@/lib/prisma";
import { OrderWizard } from "@/components/orders/wizard/wizard";

export const dynamic = "force-dynamic";

export default async function NuevoAlquilerPage({
  searchParams,
}: {
  searchParams: { clienteId?: string };
}) {
  const [clients, equipment] = await Promise.all([
    prisma.client.findMany({ orderBy: { razonSocial: "asc" }, select: { id: true, razonSocial: true } }),
    prisma.equipment.findMany({ where: { estado: { not: "BAJA" } }, select: { modelo: true } }),
  ]);

  const stockByModel = equipment.reduce<Record<string, number>>((acc, e) => {
    acc[e.modelo] = (acc[e.modelo] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Nuevo Alquiler</h1>
        <p className="text-sm text-muted-foreground">
          Completá los 5 pasos para crear un nuevo alquiler / evento.
        </p>
      </div>

      <OrderWizard clients={clients} stockByModel={stockByModel} defaultClienteId={searchParams.clienteId} />
    </div>
  );
}
