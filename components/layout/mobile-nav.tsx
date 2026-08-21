"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { BrandMark, isNavItemActive } from "@/components/layout/brand-mark";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

/**
 * Menú de navegación completo para mobile/tablet (< lg). Se abre desde el
 * botón de hamburguesa en el Topbar. Incluye todas las secciones (la barra
 * inferior solo muestra las 4 más usadas para acceso rápido con el pulgar).
 */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-sidebar text-sidebar-foreground">
        <SheetHeader>
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <BrandMark />
        </SheetHeader>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = isNavItemActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <SheetClose asChild key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-white/10 text-white" : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <SheetClose asChild>
            <Button asChild className="w-full" size="lg">
              <Link href="/alquileres/nuevo">
                <Plus className="h-4 w-4" />
                Nuevo Alquiler
              </Link>
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
