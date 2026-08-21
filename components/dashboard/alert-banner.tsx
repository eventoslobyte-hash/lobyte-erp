import Link from "next/link";
import { AlertTriangle, ShieldAlert, FileWarning, Wallet } from "lucide-react";

import type { CriticalAlert } from "@/lib/alerts";
import { cn } from "@/lib/utils";

const ICON_BY_TYPE = {
  seguro: ShieldAlert,
  material: FileWarning,
  saldo: Wallet,
  entrega: AlertTriangle,
} as const;

export function AlertBanner({ alerts }: { alerts: CriticalAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-destructive/30 bg-destructive/5">
      <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/10 px-4 py-2.5">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <p className="text-sm font-semibold text-destructive">
          {alerts.length} alerta{alerts.length !== 1 ? "s" : ""} crítica{alerts.length !== 1 ? "s" : ""} — entregas en menos de 48hs
        </p>
      </div>
      <ul className="divide-y divide-destructive/10">
        {alerts.slice(0, 5).map((alert, i) => {
          const Icon = ICON_BY_TYPE[alert.tipo];
          return (
            <li key={i}>
              <Link
                href={`/alquileres/${alert.orderId}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-destructive/10"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 text-destructive" />
                <span className="flex-1 text-foreground/90">{alert.mensaje}</span>
                <span className="text-xs text-muted-foreground">{alert.cliente}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
