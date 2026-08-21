import type { MetadataRoute } from "next";

// Next.js sirve esto automáticamente en /manifest.webmanifest e inyecta el
// <link rel="manifest"> en el <head> — no hace falta tocar nada más para
// que "Agregar a pantalla de inicio" / "Instalar app" funcione en
// Android, iOS y desktop (Chrome/Edge).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LOBYTE ERP — Gestión de Alquileres",
    short_name: "LOBYTE",
    description:
      "ERP interno de LOBYTE para gestión de alquileres de tótems, servicios digitales y eventos.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f8fafc",
    theme_color: "#3b78f6",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["business", "productivity"],
    lang: "es-AR",
  };
}
