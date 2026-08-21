import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import type { CriticalAlert } from "@/lib/alerts";

export function AppShell({
  children,
  alerts,
}: {
  children: React.ReactNode;
  alerts: CriticalAlert[];
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <Topbar alerts={alerts} />
        {/* padding-bottom extra en mobile para que el contenido no quede
            tapado por la barra de navegación fija de abajo */}
        <main className="px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
