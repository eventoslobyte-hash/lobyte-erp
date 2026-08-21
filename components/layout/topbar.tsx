"use client";

import Link from "next/link";
import { Bell, Search, ShieldAlert, FileWarning, Wallet } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { CriticalAlert } from "@/lib/alerts";

const ICON_BY_TYPE = {
  seguro: ShieldAlert,
  material: FileWarning,
  saldo: Wallet,
  entrega: Bell,
} as const;

export function Topbar({ alerts }: { alerts: CriticalAlert[] }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur lg:px-8">
      <MobileNav />

      <div className="relative hidden max-w-sm flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar cliente, evento, código de equipo..." className="pl-9" />
      </div>

      <div className="flex-1 md:hidden" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Notificaciones"
          >
            <Bell className="h-4 w-4" />
            {alerts.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
                {alerts.length}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Alertas activas ({alerts.length})</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {alerts.length === 0 ? (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              Sin alertas críticas por ahora 🎉
            </p>
          ) : (
            <div className="max-h-80 space-y-1 overflow-y-auto scrollbar-thin">
              {alerts.map((alert, i) => {
                const Icon = ICON_BY_TYPE[alert.tipo];
                return (
                  <DropdownMenuItem key={i} asChild>
                    <Link href={`/alquileres/${alert.orderId}`} className="flex items-start gap-2 whitespace-normal">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                      <span className="text-xs leading-snug">{alert.mensaje}</span>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 transition-colors hover:bg-accent">
            <Avatar className="h-6 w-6">
              <AvatarFallback>LB</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:inline">LOBYTE</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Configuración</DropdownMenuItem>
          <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
