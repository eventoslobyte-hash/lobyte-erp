"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { isNavItemActive } from "@/components/layout/brand-mark";

const PRIMARY_ITEMS = NAV_ITEMS.filter((item) => item.mobilePrimary);

/**
 * Barra de accesos rápidos fija abajo, pensada para uso a una mano en el
 * celular (choferes/técnicos revisando entregas del día en el evento).
 * Solo visible en pantallas chicas — en desktop se usa el Sidebar.
 */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)] lg:hidden print:hidden"
      aria-label="Navegación principal"
    >
      {PRIMARY_ITEMS.map((item) => {
        const isActive = isNavItemActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
