import { WifiOff } from "lucide-react";

// Página de respaldo 100% estática (sin consultas a la base de datos) que
// el Service Worker precachea en el build. Se muestra automáticamente
// cuando el usuario navega a una URL que nunca visitó y no hay conexión —
// ver `fallbacks.document` en next.config.mjs.
export default function OfflineFallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-500">
        <WifiOff className="h-7 w-7" />
      </div>
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Estás sin conexión</h1>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Todavía no visitaste esta pantalla desde este dispositivo, así que no hay una versión guardada
          para mostrar offline. Las pantallas que ya abriste antes (Dashboard, Alquileres, Clientes,
          Equipos) sí se pueden seguir viendo sin conexión.
        </p>
      </div>
      <a
        href="/"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Volver al Dashboard
      </a>
    </div>
  );
}
