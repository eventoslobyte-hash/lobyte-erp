import { CalendarClock, ClipboardCheck, ShieldAlert, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { UpcomingEventsTable } from "@/components/dashboard/upcoming-events-table";
import { AlertBanner } from "@/components/dashboard/alert-banner";
import { getDashboardKpis, getUpcomingEvents } from "@/lib/dashboard-data";
import { getCriticalAlerts } from "@/lib/alerts";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const [kpis, upcomingEvents, alerts] = await Promise.all([
    getDashboardKpis(),
    getUpcomingEvents(8),
    getCriticalAlerts(),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Resumen operativo de alquileres, entregas y cobranzas de LOBYTE.
          </p>
        </div>
        <Button asChild>
          <Link href="/alquileres/nuevo">
            <Plus className="h-4 w-4" />
            Nuevo Alquiler
          </Link>
        </Button>
      </div>

      <AlertBanner alerts={alerts} />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Alquileres activos esta semana"
          value={String(kpis.alquileresActivosSemana)}
          icon={ClipboardCheck}
          tone="default"
          hint="Confirmados o en curso"
        />
        <KpiCard
          label="Saldos por cobrar"
          value={formatCurrency(kpis.saldosPorCobrar)}
          icon={Wallet}
          tone={kpis.saldosPorCobrar > 0 ? "warning" : "success"}
          hint="Sobre alquileres activos"
        />
        <KpiCard
          label="Próximas entregas (48hs)"
          value={String(kpis.proximasEntregas48h)}
          icon={CalendarClock}
          tone={kpis.proximasEntregas48h > 0 ? "default" : "success"}
          hint="Requieren logística inmediata"
        />
        <KpiCard
          label="Seguros pendientes"
          value={String(kpis.segurosPendientes)}
          icon={ShieldAlert}
          tone={kpis.segurosPendientes > 0 ? "danger" : "success"}
          hint="A subsanar antes de la entrega"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos eventos</CardTitle>
          <CardDescription>Entregas y alquileres en curso ordenados por fecha de entrega.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <UpcomingEventsTable orders={upcomingEvents} />
        </CardContent>
      </Card>
    </div>
  );
}
