import { google } from "googleapis";
import type { Order, Client } from "@prisma/client";

// -----------------------------------------------------------------------------
// Integración bidireccional con Google Calendar API v3.
//
// Estrategia: cada Order genera hasta 2 eventos de calendario ("Entrega" y
// "Retiro"), cuyos IDs se guardan en Order.gcalEventIdEntrega /
// Order.gcalEventIdRetiro. Al editar el alquiler (fechas, ubicación, etc.)
// se actualizan los mismos eventos en vez de duplicarlos. Al cancelar, se
// borran.
//
// Autenticación: OAuth2 con refresh token de larga duración (se obtiene una
// única vez siguiendo el flujo en README.md > "Google Calendar"). Esto le
// permite al servidor crear/editar eventos en el calendario de LOBYTE sin
// requerir que un humano esté logueado en cada request.
// -----------------------------------------------------------------------------

function getOAuthClient() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  if (process.env.GOOGLE_REFRESH_TOKEN) {
    client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  }

  return client;
}

function isConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN
  );
}

function getCalendarClient() {
  return google.calendar({ version: "v3", auth: getOAuthClient() });
}

/** URL de autorización que un admin debe visitar una vez para generar el refresh token. */
export function getAuthUrl() {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar"],
  });
}

export async function exchangeCodeForTokens(code: string) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens; // tokens.refresh_token -> guardar en GOOGLE_REFRESH_TOKEN
}

interface SyncableOrder extends Order {
  cliente: Client;
}

function buildEventPayload(
  order: SyncableOrder,
  tipo: "entrega" | "retiro"
) {
  const isEntrega = tipo === "entrega";
  const start = isEntrega ? order.fechaHoraEntrega : order.fechaHoraRetiro;
  // Bloque de 1 hora para la logística de entrega/retiro
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  return {
    summary: `${isEntrega ? "🚚 Entrega" : "📦 Retiro"} — ${order.nombreEvento} (${order.cliente.razonSocial})`,
    location: order.ubicacionDireccion,
    description: [
      `Cliente: ${order.cliente.razonSocial}`,
      `Contacto: ${order.cliente.contactoNombre} — ${order.cliente.telefono}`,
      order.ubicacionMapaUrl ? `Mapa: ${order.ubicacionMapaUrl}` : null,
      `Evento LOBYTE #${order.id}`,
    ]
      .filter(Boolean)
      .join("\n"),
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 24 * 60 },
        { method: "popup", minutes: 2 * 60 },
      ],
    },
    colorId: isEntrega ? "9" : "6", // azul / naranja
  };
}

export interface SyncResult {
  gcalEventIdEntrega: string | null;
  gcalEventIdRetiro: string | null;
  skipped?: boolean;
  reason?: string;
}

/**
 * Crea o actualiza los eventos de Entrega y Retiro en Google Calendar para
 * un alquiler. Devuelve los IDs de evento para persistir en la Order.
 */
export async function syncOrderToGoogleCalendar(
  order: SyncableOrder
): Promise<SyncResult> {
  if (!isConfigured()) {
    return {
      gcalEventIdEntrega: order.gcalEventIdEntrega,
      gcalEventIdRetiro: order.gcalEventIdRetiro,
      skipped: true,
      reason: "Google Calendar no está configurado (faltan variables de entorno).",
    };
  }

  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  const entregaPayload = buildEventPayload(order, "entrega");
  const retiroPayload = buildEventPayload(order, "retiro");

  const gcalEventIdEntrega = order.gcalEventIdEntrega
    ? (
        await calendar.events.update({
          calendarId,
          eventId: order.gcalEventIdEntrega,
          requestBody: entregaPayload,
        })
      ).data.id ?? null
    : (
        await calendar.events.insert({ calendarId, requestBody: entregaPayload })
      ).data.id ?? null;

  const gcalEventIdRetiro = order.gcalEventIdRetiro
    ? (
        await calendar.events.update({
          calendarId,
          eventId: order.gcalEventIdRetiro,
          requestBody: retiroPayload,
        })
      ).data.id ?? null
    : (
        await calendar.events.insert({ calendarId, requestBody: retiroPayload })
      ).data.id ?? null;

  return { gcalEventIdEntrega, gcalEventIdRetiro };
}

/** Elimina los eventos de calendario asociados a un alquiler (ej: al cancelar). */
export async function deleteOrderFromGoogleCalendar(order: Order) {
  if (!isConfigured()) return { skipped: true };

  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  await Promise.allSettled([
    order.gcalEventIdEntrega
      ? calendar.events.delete({ calendarId, eventId: order.gcalEventIdEntrega })
      : Promise.resolve(),
    order.gcalEventIdRetiro
      ? calendar.events.delete({ calendarId, eventId: order.gcalEventIdRetiro })
      : Promise.resolve(),
  ]);

  return { skipped: false };
}
