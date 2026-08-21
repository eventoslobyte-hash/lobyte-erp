import { cn } from "@/lib/utils";
import { equipmentModelLabels } from "@/lib/labels";
import type { EquipmentModel } from "@prisma/client";
import type { DayOccupancy } from "@/lib/availability";

interface ModelRow {
  modelo: EquipmentModel;
  days: DayOccupancy[];
}

function occupancyTone(reservado: number, stockTotal: number) {
  if (stockTotal === 0) return "bg-muted";
  const ratio = reservado / stockTotal;
  if (ratio === 0) return "bg-success/15";
  if (ratio < 0.6) return "bg-success/40";
  if (ratio < 1) return "bg-warning/60";
  return "bg-destructive/70";
}

export function GanttChart({ rows }: { rows: ModelRow[] }) {
  if (rows.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No hay equipos cargados todavía.</p>;
  }

  const days = rows[0].days;

  return (
    <div className="overflow-x-auto scrollbar-thin momentum-scroll">
      <div className="min-w-[900px]">
        {/* Header de fechas */}
        <div className="flex border-b border-border pb-2">
          <div className="w-48 shrink-0 text-xs font-semibold uppercase text-muted-foreground">Modelo</div>
          <div className="flex flex-1">
            {days.map((d) => {
              const date = new Date(d.date + "T00:00:00");
              const isToday = d.date === new Date().toISOString().slice(0, 10);
              const isWeekend = [0, 6].includes(date.getDay());
              return (
                <div
                  key={d.date}
                  className={cn(
                    "flex w-8 shrink-0 flex-col items-center text-[10px]",
                    isWeekend ? "text-muted-foreground/60" : "text-muted-foreground",
                    isToday && "font-bold text-primary"
                  )}
                >
                  <span>{date.toLocaleDateString("es-AR", { day: "2-digit" })}</span>
                  <span className="uppercase">{date.toLocaleDateString("es-AR", { month: "short" }).replace(".", "")}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filas por modelo */}
        <div className="divide-y divide-border">
          {rows.map((row) => (
            <div key={row.modelo} className="flex items-center py-2">
              <div className="w-48 shrink-0 pr-2 text-sm font-medium">{equipmentModelLabels[row.modelo]}</div>
              <div className="flex flex-1">
                {row.days.map((d) => (
                  <div key={d.date} className="w-8 shrink-0 px-0.5" title={`${d.reservado}/${d.stockTotal} reservados`}>
                    <div
                      className={cn(
                        "flex h-7 items-center justify-center rounded text-[10px] font-medium",
                        occupancyTone(d.reservado, d.stockTotal),
                        d.reservado >= d.stockTotal && d.stockTotal > 0 ? "text-destructive-foreground" : "text-foreground/70"
                      )}
                    >
                      {d.reservado > 0 ? d.reservado : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-success/15" /> Libre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-success/40" /> Ocupación baja
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-warning/60" /> Ocupación alta
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-destructive/70" /> Stock completo
        </span>
      </div>
    </div>
  );
}
