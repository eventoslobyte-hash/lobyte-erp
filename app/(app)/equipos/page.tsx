import Link from "next/link";
import { Plus, MonitorSmartphone } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { equipmentModelLabels, equipmentStatusLabels, equipmentStatusColors } from "@/lib/labels";
import type { EquipmentModel, EquipmentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function EquiposPage() {
  const equipment = await prisma.equipment.findMany({
    orderBy: [{ modelo: "asc" }, { codigoInterno: "asc" }],
  });

  const modelos = Array.from(new Set(equipment.map((e) => e.modelo))) as EquipmentModel[];

  const summary = modelos.map((modelo) => {
    const units = equipment.filter((e) => e.modelo === modelo);
    return {
      modelo,
      total: units.length,
      disponible: units.filter((u) => u.estado === "DISPONIBLE").length,
      enEvento: units.filter((u) => u.estado === "EN_EVENTO").length,
      mantenimiento: units.filter((u) => u.estado === "MANTENIMIENTO").length,
    };
  });

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Equipos / Inventario</h1>
          <p className="text-sm text-muted-foreground">{equipment.length} unidades registradas.</p>
        </div>
        <Button asChild>
          <Link href="/equipos/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo Equipo
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summary.map((s) => (
          <Card key={s.modelo}>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <MonitorSmartphone className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold">{equipmentModelLabels[s.modelo]}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-success">{s.disponible}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Disponible</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-brand-600">{s.enEvento}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">En Evento</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-warning">{s.mantenimiento}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">Manten.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de unidades</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((eq) => (
                <TableRow key={eq.id}>
                  <TableCell className="font-mono text-xs font-medium">{eq.codigoInterno}</TableCell>
                  <TableCell>{equipmentModelLabels[eq.modelo]}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        equipmentStatusColors[eq.estado] as
                          | "success"
                          | "brand"
                          | "warning"
                          | "muted"
                      }
                      dot
                    >
                      {equipmentStatusLabels[eq.estado]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{eq.descripcion || "—"}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/equipos/${eq.id}`} className="text-sm font-medium text-primary hover:underline">
                      Editar
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {equipment.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    Todavía no hay equipos cargados.
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
