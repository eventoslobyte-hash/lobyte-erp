import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarRange } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GanttChart } from "@/components/availability/gantt-chart";
import { getOccupancyByDay } from "@/lib/availability";
import { formatDate } from "@/lib/utils";
import type { EquipmentModel } from "@prisma/client";

export const dynamic = "force-dynamic";

const WINDOW_DAYS = 21;

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default async function DisponibilidadPage({
  searchParams,
}: {
  searchParams: { start?: string };
}) {
  const rangeStart = searchParams.start ? new Date(searchParams.start) : new Date();
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = addDays(rangeStart, WINDOW_DAYS - 1);

  const equipment = await prisma.equipment.findMany({ select: { modelo: true } });
  const modelos = Array.from(new Set(equipment.map((e) => e.modelo))) as EquipmentModel[];

  const rows = await Promise.all(
    modelos.map(async (modelo) => ({
      modelo,
      days: await getOccupancyByDay(modelo, rangeStart, rangeEnd),
    }))
  );

  const prevStart = addDays(rangeStart, -7).toISOString().slice(0, 10);
  const nextStart = addDays(rangeStart, 7).toISOString().slice(0, 10);
  const todayStart = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Disponibilidad</h1>
          <p className="text-sm text-muted-foreground">
            Ocupación de stock por modelo — {formatDate(rangeStart)} al {formatDate(rangeEnd)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/disponibilidad?start=${prevStart}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/disponibilidad?start=${todayStart}`}>Hoy</Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/disponibilidad?start=${nextStart}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4" />
            Timeline de ocupación
          </CardTitle>
          <CardDescription>
            El número en cada celda indica cuántas unidades de ese modelo están reservadas ese día.
            Esto es lo que el motor de disponibilidad usa para evitar overbooking en el wizard de nuevo alquiler.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GanttChart rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
