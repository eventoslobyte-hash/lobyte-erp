import { AppShell } from "@/components/layout/app-shell";
import { getCriticalAlerts, type CriticalAlert } from "@/lib/alerts";

export const dynamic = "force-dynamic";

export default async function AppGroupLayout({ children }: { children: React.ReactNode }) {
  let alerts: CriticalAlert[] = [];
  try {
    alerts = await getCriticalAlerts();
  } catch {
    // La base de datos todavía no está configurada / migrada, o no hay
    // conexión (modo offline). Ver README.md para los pasos de instalación.
    alerts = [];
  }

  return <AppShell alerts={alerts}>{children}</AppShell>;
}
