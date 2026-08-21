import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google-calendar";

/**
 * Paso 1 del setup de Google Calendar (ver README.md > "Google Calendar").
 * Un admin visita GET /api/google-calendar/auth una única vez, inicia sesión
 * con la cuenta de Google/Workspace de LOBYTE y autoriza el acceso al
 * calendario. Google redirige a /api/google-calendar/callback con un
 * "code" que se intercambia por un refresh_token de larga duración.
 */
export async function GET() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json(
      {
        error:
          "Faltan GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET en las variables de entorno. Revisá el README.md.",
      },
      { status: 400 }
    );
  }

  const url = getAuthUrl();
  return NextResponse.redirect(url);
}
