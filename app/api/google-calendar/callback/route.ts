import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google-calendar";

/**
 * Paso 2 del setup de Google Calendar: recibe el "code" que manda Google
 * después de que el admin autoriza el acceso, lo intercambia por tokens y
 * muestra el refresh_token en pantalla para copiarlo a GOOGLE_REFRESH_TOKEN
 * en el archivo .env. Esto se hace una sola vez por entorno (dev/prod).
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    return new NextResponse(`<p>Autorización rechazada: ${error}</p>`, {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  if (!code) {
    return new NextResponse("<p>Falta el parámetro 'code' en la URL.</p>", {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  try {
    const tokens = await exchangeCodeForTokens(code);

    if (!tokens.refresh_token) {
      return new NextResponse(
        `<p>Google no devolvió un refresh_token. Esto pasa si ya autorizaste esta app antes.
         Revocá el acceso en <a href="https://myaccount.google.com/permissions" target="_blank">
         myaccount.google.com/permissions</a> y volvé a intentar desde /api/google-calendar/auth.</p>`,
        { headers: { "Content-Type": "text/html" }, status: 400 }
      );
    }

    return new NextResponse(
      `
      <html>
        <body style="font-family: system-ui; max-width: 640px; margin: 60px auto; line-height: 1.6;">
          <h2>✅ Autorización exitosa</h2>
          <p>Copiá este valor a la variable <code>GOOGLE_REFRESH_TOKEN</code> en tu archivo <code>.env</code> y reiniciá el servidor:</p>
          <pre style="background:#111827; color:#f9fafb; padding:16px; border-radius:8px; overflow-x:auto;">${tokens.refresh_token}</pre>
          <p style="color:#6b7280; font-size:14px;">Este token no vence salvo que se revoque el acceso manualmente. Guardalo de forma segura, no lo subas a git.</p>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    console.error(err);
    return new NextResponse("<p>Error intercambiando el código por tokens. Revisá la consola del servidor.</p>", {
      headers: { "Content-Type": "text/html" },
      status: 500,
    });
  }
}
