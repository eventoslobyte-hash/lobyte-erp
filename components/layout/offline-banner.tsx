"use client";

import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Banner global de estado de conexión. Se muestra en TODAS las rutas
 * (incluida la vista de impresión de remitos) porque es información
 * relevante en cualquier pantalla, sobre todo para choferes/técnicos
 * trabajando desde el celular en el lugar del evento.
 *
 * Cuando la app está offline, el Service Worker (ver next.config.mjs /
 * public/sw-custom.js) sigue sirviendo las últimas páginas visitadas desde
 * caché, y encola en background cualquier alta/edición (server actions =
 * POST al mismo origen) para reintentarla automáticamente apenas vuelva la
 * señal — acá solo avisamos el estado, la cola vive en el Service Worker.
 */
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      const timeout = setTimeout(() => setJustReconnected(false), 6000);
      return () => clearTimeout(timeout);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (isOnline && !justReconnected) return null;

  return (
    <div
      className={cn(
        "sticky top-0 z-[60] flex items-center justify-center gap-2 px-4 py-1.5 text-center text-xs font-medium text-white print:hidden",
        isOnline ? "bg-success" : "bg-destructive"
      )}
    >
      {isOnline ? (
        <>
          <RefreshCw className="h-3.5 w-3.5" />
          Conexión restablecida — sincronizando los cambios pendientes.
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          Estás sin conexión. Mostrando la última versión guardada — los cambios que hagas se van a
          sincronizar solos cuando vuelva la señal.
        </>
      )}
    </div>
  );
}
