import withPWAInit from "next-pwa";
import defaultCache from "next-pwa/cache.js";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  // El Service Worker solo se genera/activa en producción (`next build` +
  // `next start`, o el build de Vercel). En `next dev` next-pwa se
  // desactiva solo para no pisarse con el Hot Reload.
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    // Si el usuario navega a una URL que nunca visitó y no hay conexión,
    // muestra esta página estática precacheada en vez del error del
    // navegador. Las páginas ya visitadas se sirven desde el caché normal
    // (ver la regla NetworkFirst de más abajo), esto es solo el último
    // recurso.
    document: "/offline",
  },
  runtimeCaching: [
    {
      // Mutaciones del ERP (crear/editar cliente, alquiler, equipo, etc. son
      // Server Actions = POST al mismo origen). Si no hay conexión, Workbox
      // encola el pedido con Background Sync y lo reintenta solo apenas
      // vuelve la señal — esta es la "cola de sincronización diferida".
      urlPattern: ({ sameOrigin }) => sameOrigin,
      method: "POST",
      handler: "NetworkOnly",
      options: {
        backgroundSync: {
          name: "lobyte-mutations-queue",
          options: { maxRetentionTime: 24 * 60 }, // reintentar hasta por 24hs
        },
      },
    },
    {
      // Navegaciones de página completa (Dashboard, Alquileres, Clientes,
      // Equipos, Disponibilidad): quedan disponibles para consulta offline
      // mostrando la última versión vista, y se refrescan solas apenas hay
      // conexión (NetworkFirst con timeout corto).
      urlPattern: ({ request, sameOrigin }) => sameOrigin && request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "lobyte-pages",
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 },
        cacheableResponse: { statuses: [0, 200] },
      },
    },
    // Defaults de next-pwa: fonts, imágenes, JS/CSS de _next/static, etc.
    ...defaultCache,
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withPWA(nextConfig);
