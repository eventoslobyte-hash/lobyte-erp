import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { OfflineBanner } from "@/components/layout/offline-banner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const APP_NAME = "LOBYTE ERP";

export const metadata: Metadata = {
  title: { default: `${APP_NAME} — Gestión de Alquileres`, template: `%s — ${APP_NAME}` },
  description:
    "ERP interno de LOBYTE para gestión de alquileres de tótems, servicios digitales y eventos.",
  applicationName: APP_NAME,
  // app/manifest.ts se sirve automáticamente en /manifest.webmanifest y Next
  // inyecta el <link rel="manifest"> — no hace falta declararlo acá.
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#3b78f6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans`}>
        <OfflineBanner />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
