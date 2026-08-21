# LOBYTE ERP

ERP web interno para **LOBYTE** — alquiler de tótems publicitarios / autoservicio (táctiles IR/PCAP, TV, 27"), desarrollo de software interactivo para eventos y servicios asociados.

Incluye: dashboard operativo con alertas, motor de disponibilidad que previene overbooking de stock, wizard de 5 pasos para nuevos alquileres, integración con Google Calendar, y seguimiento de seguros, finanzas y feedback post-evento.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **TailwindCSS** + componentes estilo **shadcn/ui** (Radix primitives, hand-rolled en `components/ui`)
- **Prisma ORM** sobre **PostgreSQL** (pensado para correr contra **Supabase**, pero funciona con cualquier Postgres)
- **Server Actions** de Next.js para todas las mutaciones (sin API REST intermedia, salvo el callback OAuth de Google que Google necesita golpear por HTTP)
- **Google Calendar API v3** (`googleapis`) para sincronizar entregas/retiros
- **Sonner** para notificaciones toast, **Lucide** para iconografía
- **PWA (`next-pwa`)** — instalable en el celular/tablet/PC, con caché offline de las vistas principales
- **APK nativa Android (Trusted Web Activity)** — se compila sola en GitHub Actions, sin necesitar Android Studio
- **Responsive mobile-first** — pensado para que choferes y técnicos lo usen cómodamente desde el celular en el evento

## Novedades de esta versión

Esta versión suma 4 mejoras de arquitectura/usabilidad sobre el ERP base:

1. **[Soporte PWA y caché offline](#8-pwa--instalación-y-uso-offline)** — instalable como app, con las vistas de Inventario/Clientes/Alquileres disponibles sin conexión y una cola de sincronización para lo que se cargue offline.
2. **[Acceso multidispositivo en la red local](#9-acceso-desde-otros-dispositivos-en-la-red-local-lan)** — el servidor escucha en `0.0.0.0` y todas las vistas (incluido el Gantt de Disponibilidad y el Wizard) son 100% táctiles y responsive.
3. **[Deploy en Vercel en un click](#10-deploy-en-vercel-paso-a-paso)** — guía paso a paso para publicar el sistema gratis con dominio propio o subdominio `.vercel.app`.
4. **[Remitos de Entrega / Retiro](#11-remitos-de-entrega--retiro-impresión-y-whatsapp)** — generá, imprimí (o guardá como PDF) y compartí por WhatsApp un remito con espacio para firma de conformidad.
5. **[APK nativa para Android](#13-apk-nativa-para-android)** — se instala como una app de verdad (ícono propio, pantalla completa, sin barra del navegador) y se compila sola en la nube cada vez que hacés `git push`, sin necesitar Android Studio.

## 1. Requisitos previos

- Node.js 20+
- Una base PostgreSQL. Dos opciones:
  - **Supabase** (recomendado): creá un proyecto gratis en [supabase.com](https://supabase.com), y copiá la connection string desde *Project Settings → Database → Connection string*.
  - **Local con Docker**: este repo incluye un `docker-compose.yml` con Postgres 16 listo para usar.

## 2. Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env
# Completá DATABASE_URL / DIRECT_URL (Supabase o local, ver abajo)

# 3a. Si usás Docker para Postgres local:
docker compose up -d
# y en .env dejá:
# DATABASE_URL="postgresql://lobyte:lobyte@localhost:5432/lobyte_erp?schema=public"
# DIRECT_URL="postgresql://lobyte:lobyte@localhost:5432/lobyte_erp?schema=public"

# 4. Crear las tablas
npx prisma migrate dev --name init

# 5. Cargar datos de ejemplo (clientes, equipos, alquileres de muestra)
npm run db:seed

# 6. Levantar el servidor de desarrollo
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) — vas a ver el dashboard ya con datos de ejemplo (entregas próximas, alertas de seguro pendiente, saldos por cobrar, etc.) para que puedas evaluar el sistema de una.

> Si todavía no corriste las migraciones, el layout va a arrancar igual (no rompe), pero las páginas van a mostrar errores de conexión a la base hasta que completes el paso 4.

### Scripts disponibles

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (escucha en `0.0.0.0`, accesible desde otros dispositivos de la LAN — ver sección 9) |
| `npm run build` / `npm start` | Build + servidor de producción (también en `0.0.0.0`) |
| `npm run db:migrate` | Corre migraciones de Prisma en desarrollo |
| `npm run db:deploy` | Aplica migraciones en producción (sin generar nuevas) |
| `npm run db:seed` | Carga los datos de ejemplo (podés editar `prisma/seed.ts`) |
| `npm run db:studio` | Abre Prisma Studio para explorar/editar datos a mano |

> La PWA (service worker) está desactivada en `npm run dev` a propósito, para no interferir con el hot-reload — para probar el comportamiento offline real, usá `npm run build && npm start`.

## 3. Integración con Google Calendar

El sistema crea automáticamente dos eventos de calendario por cada alquiler (🚚 Entrega y 📦 Retiro) apenas se completa el wizard, y los actualiza si cambiás fechas o los borra si cancelás el alquiler. La sincronización también se puede disparar a mano con el botón **"Sincronizar Calendar"** en el detalle del alquiler.

Mientras no configures las credenciales, el sistema **funciona igual** (la sincronización se salta silenciosamente con un aviso), así que podés probar todo lo demás sin hacer este paso.

Pasos para activarlo:

1. Entrá a [Google Cloud Console](https://console.cloud.google.com/) y creá un proyecto (o usá uno existente).
2. Habilitá la **Google Calendar API** (`APIs & Services → Library`).
3. Creá credenciales OAuth 2.0 (`APIs & Services → Credentials → Create Credentials → OAuth client ID`, tipo **Web application**).
   - Agregá como *Authorized redirect URI*: `http://localhost:3000/api/google-calendar/callback` (y el equivalente en producción, ej: `https://tu-dominio.com/api/google-calendar/callback`).
4. Copiá `Client ID` y `Client Secret` a tu `.env`:
   ```
   GOOGLE_CLIENT_ID="..."
   GOOGLE_CLIENT_SECRET="..."
   GOOGLE_REDIRECT_URI="http://localhost:3000/api/google-calendar/callback"
   ```
5. Con el servidor corriendo, visitá **`http://localhost:3000/api/google-calendar/auth`** desde el navegador, iniciá sesión con la cuenta de Google/Workspace que va a ser dueña del calendario de LOBYTE, y autorizá el acceso.
6. Google te va a redirigir de vuelta mostrando un `refresh_token` en pantalla. Copialo a `.env`:
   ```
   GOOGLE_REFRESH_TOKEN="..."
   ```
7. Reiniciá el servidor. Listo — a partir de ahora, cada alquiler nuevo (o sincronización manual) va a crear/actualizar eventos reales en `GOOGLE_CALENDAR_ID` (por defecto `primary`, pero podés apuntar a un calendario compartido del equipo poniendo su ID ahí).

El `refresh_token` no vence salvo que se revoque manualmente el acceso desde [myaccount.google.com/permissions](https://myaccount.google.com/permissions) — no hace falta repetir este flujo salvo que eso pase.

## 4. Estructura del proyecto

Las páginas que usan el shell completo (sidebar/topbar/nav mobile) viven agrupadas bajo `app/(app)/` — un *route group* de Next.js, así que **no afecta las URLs** (`app/(app)/alquileres/page.tsx` sigue siendo `/alquileres`). Quedan afuera del grupo únicamente las páginas que necesitan verse "limpias", sin el shell: el remito imprimible y la página offline de la PWA.

```
app/
  layout.tsx                  Layout raíz: fuente, metadata PWA, <OfflineBanner/>, <Toaster/>
  manifest.ts                 Web App Manifest de la PWA (nombre, ícono, colores)
  offline/page.tsx            Página de fallback offline (se muestra si no hay caché para la ruta pedida)
  alquileres/[id]/remito/
    page.tsx                   Remito de Entrega/Retiro imprimible (sin el shell del ERP)
  api/google-calendar/        Rutas OAuth (las únicas rutas HTTP "reales", Google las necesita)

  (app)/                      Route group: todo lo que se ve "adentro" del ERP con sidebar/topbar
    layout.tsx                  Arma el <AppShell> + calcula las alertas críticas
    page.tsx                    Dashboard principal (KPIs, alertas, próximos eventos)
    clientes/                   CRUD de clientes
    equipos/                    Inventario de tótems / equipos
    alquileres/
      page.tsx                  Listado con filtros por estado (tabla en desktop, cards en mobile)
      nuevo/page.tsx             Wizard de 5 pasos para crear un alquiler
      [id]/page.tsx               Detalle: evento, equipos, servicios, seguro, finanzas, post-evento, botones de Remito
      actions.ts                  Server Actions: crear/editar/cancelar alquileres, chequeo de stock
    disponibilidad/page.tsx     Timeline/Gantt de ocupación de stock por modelo (con scroll táctil)
    post-evento/page.tsx        Panel de encuestas de satisfacción pendientes

components/
  ui/                         Kit de componentes estilo shadcn/ui (Button, Card, Dialog, Select, Sheet, etc.)
  layout/                     Sidebar (desktop), MobileNav (drawer), MobileBottomNav (tab bar), Topbar, AppShell, OfflineBanner
  dashboard/                  KPI cards, cuenta regresiva, badges de estado, tabla de próximos eventos
  orders/wizard/               Los 5 pasos del wizard de nuevo alquiler
  orders/                      Tarjetas de edición: seguro, finanzas, servicios digitales, estado
  orders/remito/               Documento imprimible del remito + botones de Imprimir/WhatsApp
  post-event/                  Panel de feedback / encuesta post-evento

lib/
  prisma.ts                   Cliente de Prisma (singleton)
  availability.ts              Motor de disponibilidad / prevención de overbooking
  alerts.ts                    Cálculo de alertas críticas (seguro, material, saldo, 48hs)
  countdown.ts                  Cuenta regresiva en español
  finance.ts                    Cálculo de saldo pendiente
  google-calendar.ts            Integración con Google Calendar API
  post-event-templates.ts       Plantillas de WhatsApp / email para la encuesta post-evento
  remito.ts                     Helpers del remito: numeración y mensaje de WhatsApp
  labels.ts                     Traducciones y colores de cada enum del sistema

prisma/
  schema.prisma                Modelo de datos completo
  seed.ts                       Datos de ejemplo realistas para LOBYTE

public/icons/                 Íconos de la PWA (192/512/maskable/apple-touch)
public/.well-known/
  assetlinks.json              Verificación de dominio para la APK nativa (Trusted Web Activity)

android/                      Proyecto Android nativo (envuelve el sitio en una .apk) — ver sección 13
  app/build.gradle              Config de la app, dominio que envuelve, firma
  keystore/                     Firma fija con la que se compila la APK en cada build

.github/workflows/
  build-apk.yml                Compila la APK sola en GitHub Actions con cada push
```

## 5. Cómo funciona la prevención de overbooking

Cada unidad física de stock vive en la tabla `Equipment` (con su `codigoInterno` y `modelo`). Un alquiler reserva `cantidad` unidades de un `modelo` durante el rango `[fechaHoraEntrega, fechaHoraRetiro]`. El motor en `lib/availability.ts`:

1. Cuenta el stock total activo de un modelo (`Equipment` con ese `modelo`, sin contar unidades dadas de `BAJA`).
2. Suma cuánto de ese modelo ya está comprometido por otros alquileres cuyo rango de fechas se solapa con el nuevo, considerando todos los estados excepto `CANCELADO`.
3. Si `disponible < cantidadSolicitada`, el paso 2 del wizard ("Equipos") lo marca en rojo y no permite avanzar sin ajustar cantidades/fechas. El servidor **vuelve a chequear** esto al crear el alquiler (`createOrderAction`) como defensa contra condiciones de carrera (dos personas reservando el mismo tótem al mismo tiempo).

La vista **Disponibilidad** (`/disponibilidad`) usa el mismo motor para pintar un timeline día por día por modelo, así el equipo puede ver de un vistazo cuándo hay stock libre antes incluso de armar un presupuesto.

## 6. Deploy sugerido (resumen)

- **Vercel** para el frontend/backend (Next.js nativo).
- **Supabase** para Postgres (usá la *connection pooling URL* en `DATABASE_URL` y la directa en `DIRECT_URL`, así Prisma funciona bien en el entorno serverless de Vercel).
- Configurá las mismas variables de entorno de `.env.example` en el dashboard de Vercel.
- Corré `npx prisma migrate deploy` contra la base de producción antes del primer deploy (podés hacerlo desde tu máquina apuntando `DATABASE_URL` a producción, o agregarlo como *build command*).

> Ver la guía detallada, paso a paso y sin asumir experiencia previa con Vercel, en la [sección 10](#10-deploy-en-vercel-paso-a-paso).

## 7. Roles de uso pensados para el equipo de LOBYTE

- **Oficina / administración**: uso normal desde PC, con el sistema corriendo en la nube (Vercel) o en una PC del local.
- **Choferes y técnicos en el evento**: acceden desde el celular, instalando la **APK nativa** (sección 13, la opción más cómoda) o la PWA (sección 8), o entrando por LAN al servidor de la oficina (sección 9) — pueden ver el detalle del alquiler, marcar estados, y generar/firmar el remito de entrega o retiro in situ (sección 11).

## 8. PWA — Instalación y uso offline

El ERP está configurado como **Progressive Web App** con `next-pwa`: se puede instalar como una app nativa en el celular, la tablet o la PC, y las vistas principales (Dashboard, Clientes, Inventario, Alquileres) quedan cacheadas para poder **consultarlas sin conexión** — útil para choferes/técnicos que llegan a un evento con mala señal.

### Cómo instalarla

- **Android (Chrome)**: entrá a la URL del sistema → menú (⋮) → **"Instalar app"** (o el banner que aparece solo). Queda como ícono en el escritorio, abre en su propia ventana sin barra del navegador.
- **iOS (Safari)**: entrá a la URL del sistema → botón de compartir (□↑) → **"Agregar a pantalla de inicio"**. iOS no muestra el banner automático como Android, este paso es siempre manual.
- **Desktop (Chrome/Edge)**: ícono de instalación (⊕) en la barra de direcciones, a la derecha → **"Instalar"**.

### Qué funciona offline y qué no

- **Sí funciona sin conexión**: navegar a páginas que ya visitaste antes (quedan cacheadas), incluyendo listados de Clientes, Inventario y Alquileres con los datos de la última vez que cargaron con conexión.
- **Si entrás a una página que nunca cacheó** (por ejemplo primera vez que abrís el sistema, o una ruta nueva) **sin conexión**, ves la pantalla de "Sin conexión" (`app/offline/page.tsx`) en vez de un error feo.
- **Cola de sincronización diferida**: si hacés una acción que escribe datos (cargar un pago, marcar un estado, etc.) mientras estás offline, el pedido queda en cola (vía Background Sync del navegador) y **se reintenta solo apenas vuelve la conexión** — no hace falta reintentar a mano. Ojo: como es una reconstrucción automática en segundo plano, la pantalla que hiciste la acción no se refresca sola cuando el pedido finalmente se envía; si necesitás confirmar que algo cargado offline ya impactó, refrescá la página una vez que tengas señal de nuevo.
- Los **envíos de WhatsApp/email** (encuestas, remitos) requieren conexión real en el momento de enviarlos, ya que abren una app externa (WhatsApp o el cliente de mail).

### Notas técnicas

- El service worker se genera en el build (`next-pwa`, modo `GenerateSW`) y **está desactivado en desarrollo** (`npm run dev`) para no pelearse con el hot-reload — solo se activa en `npm run build && npm start` o en producción (Vercel).
- Los archivos generados (`public/sw.js`, `public/workbox-*.js`) están en `.gitignore`: se regeneran solos en cada build, no hace falta versionarlos.
- Los íconos están en `public/icons/` (192px, 512px, versión *maskable* para Android, y `apple-touch-icon` para iOS). Si en algún momento cambia el logo de LOBYTE, alcanza con reemplazar esos PNG.

## 9. Acceso desde otros dispositivos en la red local (LAN)

Para que choferes y técnicos puedan usar el sistema desde el celular **sin necesidad de internet**, apuntando directo a una PC de la oficina que esté corriendo el ERP en la misma red Wi-Fi:

1. En la PC que va a hacer de servidor, corré `npm run dev` (desarrollo) o `npm run build && npm start` (más estable, recomendado si va a quedar corriendo todo el día del evento). Ambos scripts ya están configurados con `-H 0.0.0.0`, así que el servidor escucha en todas las interfaces de red, no solo en `localhost`.
2. Anotá la IP local de esa PC:
   - Windows: `ipconfig` → buscá "Dirección IPv4" (ej: `192.168.0.15`).
   - Mac/Linux: `ifconfig` o `ip addr` → buscá algo como `192.168.x.x`.
3. Desde el celular/tablet (conectado al **mismo Wi-Fi**), entrá a `http://192.168.0.15:3000` (reemplazando por la IP real).
4. Revisá que el firewall de esa PC permita conexiones entrantes al puerto `3000` (en Windows suele pedir confirmación la primera vez).

Todas las vistas —tablas, el timeline/Gantt de Disponibilidad, y el Wizard de 5 pasos para nuevo alquiler— están optimizadas para pantallas chicas y uso táctil: en mobile las tablas se convierten en tarjetas apiladas, el menú principal pasa a un botón de hamburguesa con panel deslizante más una barra de accesos rápidos fija abajo, y los campos numéricos abren el teclado numérico del celular automáticamente.

## 10. Deploy en Vercel, paso a paso

Guía pensada para alguien sin experiencia previa en Vercel. Es gratis para este uso (plan *Hobby*).

1. **Subí el proyecto a GitHub.** Si todavía no lo hiciste: creá un repositorio nuevo en [github.com/new](https://github.com/new), y desde la carpeta del proyecto:
   ```bash
   git init
   git add .
   git commit -m "LOBYTE ERP"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/lobyte-erp.git
   git push -u origin main
   ```
2. **Creá la base de datos en Supabase** (si todavía no la tenés): [supabase.com](https://supabase.com) → *New project* → esperá a que termine de aprovisionar → *Project Settings → Database → Connection string* → copiá las dos versiones (*Transaction pooler*, puerto `6543`, y *Direct connection*, puerto `5432`). Ver el detalle de cada una en `.env.example`.
3. **Importá el repo en Vercel.** Entrá a [vercel.com/new](https://vercel.com/new), iniciá sesión con tu cuenta de GitHub, y elegí el repositorio `lobyte-erp`. Vercel detecta automáticamente que es un proyecto Next.js — no hace falta tocar ningún ajuste de build.
4. **Cargá las variables de entorno.** En la pantalla de configuración del proyecto (o después, en *Settings → Environment Variables*), agregá las mismas claves de tu `.env`:
   - `DATABASE_URL` (la del *pooler*, puerto `6543`, con `?pgbouncer=true`)
   - `DIRECT_URL` (la directa, puerto `5432`)
   - `NEXT_PUBLIC_APP_URL` — poné la URL que Vercel te va a asignar, ej: `https://lobyte-erp.vercel.app` (podés dejarla provisoria y corregirla después del primer deploy, una vez que sepas la URL final)
   - `NEXT_PUBLIC_COMPANY_NAME`, `NEXT_PUBLIC_GOOGLE_REVIEWS_URL`
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (usando tu dominio de producción, ej: `https://lobyte-erp.vercel.app/api/google-calendar/callback`), `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID`
   - `WHATSAPP_API_URL` / `WHATSAPP_API_TOKEN` (opcionales)
5. **Deploy.** Botón **"Deploy"**. Vercel instala dependencias, corre `prisma generate` automáticamente (ya está como `postinstall` en `package.json`) y compila el proyecto. Tarda 1–3 minutos.
6. **Aplicá las migraciones a la base de producción.** Esto Vercel no lo hace solo — corré una vez desde tu máquina, apuntando al Supabase de producción:
   ```bash
   DATABASE_URL="<tu DIRECT_URL de Supabase>" npx prisma migrate deploy
   ```
   (Opcional: cargar datos de ejemplo con `npm run db:seed` apuntando a esa misma base, si querés arrancar con contenido de muestra).
7. **Probá la URL que te dio Vercel** (algo como `https://lobyte-erp.vercel.app` o `https://lobyte-erp-tuusuario.vercel.app`) — ya debería mostrar el dashboard funcionando.
8. **Dominio propio (opcional).** Si LOBYTE tiene un dominio propio (ej: `erp.lobyte.com.ar`):
   - En el proyecto de Vercel: *Settings → Domains → Add* → escribí el dominio/subdominio deseado.
   - Vercel te muestra un registro DNS para agregar (normalmente un `CNAME` apuntando a `cname.vercel-dns.com`, o un `A record` si es el dominio raíz). Cargalo en el panel de tu proveedor de DNS (donde compraste el dominio).
   - Esperá la propagación (de minutos a un par de horas) — Vercel emite el certificado SSL automáticamente apenas detecta el DNS bien configurado.
   - Actualizá `NEXT_PUBLIC_APP_URL` y `GOOGLE_REDIRECT_URI` (y el *Authorized redirect URI* en Google Cloud Console) para que apunten al dominio final, y volvé a autorizar Google Calendar (paso 5 de la sección 3) si cambiaste esa URL.
9. **Deploys siguientes son automáticos**: cada `git push` a `main` dispara un nuevo deploy solo. Los *Pull Requests* generan automáticamente una URL de *preview* aparte, para probar cambios antes de mergear.

## 11. Remitos de Entrega / Retiro (impresión y WhatsApp)

Cada alquiler tiene dos botones en su página de detalle — **"Remito de Entrega"** y **"Remito de Retiro"** — que abren un documento imprimible en una pestaña nueva, sin el menú/sidebar del sistema (pensado para imprimirse limpio o mandarse como está).

El remito incluye: datos de LOBYTE y del cliente, evento y ubicación, fecha/hora del movimiento, el detalle de equipos entregados/retirados, un espacio para observaciones, y **dos recuadros de firma** (uno para quien entrega por LOBYTE y otro de conformidad del cliente, con aclaración/DNI/fecha) — para dejar constancia física de la recepción o devolución del material.

Desde esa misma pantalla hay dos acciones:

- **"Imprimir / Guardar PDF"**: abre el diálogo de impresión del navegador (`Ctrl/Cmd + P`) ya con los márgenes ajustados; desde ahí se puede imprimir en papel o elegir *"Guardar como PDF"* como destino.
- **"Compartir por WhatsApp"**: abre WhatsApp con un mensaje precargado (dirigido al teléfono del cliente cargado en su ficha) que incluye el link directo a este mismo remito, para que el cliente pueda abrirlo, verlo e imprimirlo/guardarlo por su cuenta. *(Nota: por una limitación de WhatsApp, no es posible adjuntar el PDF ya generado automáticamente vía este link — el mensaje comparte el link a la página, no un archivo. Si preferís mandar el PDF como archivo adjunto, generalo primero con "Guardar PDF" y adjuntalo manualmente en el chat de WhatsApp)*.

## 13. APK nativa para Android

### Qué es esto realmente (leé esto antes de instalar)

LOBYTE ERP es un sistema **multiusuario con una base de datos compartida** (así es como evita que dos personas reserven el mismo tótem el mismo día — sección 5). Eso significa que una "app 100% funcional siempre, sin internet" no es técnicamente posible ni conviene: si dos choferes cargaran alquileres nuevos sin conexión al mismo tiempo, nada podría detectar que están por reservar el mismo equipo hasta que ambos vuelvan a tener señal — ahí es exactamente donde reaparecería el overbooking que el sistema está diseñado para evitar.

Lo que sí te podemos dar, y es lo que arma esta sección, es lo más cercano posible a eso dentro de esa restricción real:

- Una **.apk instalable de verdad** en cualquier Android — no es un acceso directo ni un atajo: se instala como cualquier otra app, tiene su propio ícono, abre en pantalla completa (sin la barra de direcciones de Chrome) y aparece en el cajón de aplicaciones del celular.
- **Todo lo que se puede hacer desde una PC ya se puede hacer desde el celular** con esta app: el Wizard completo de 5 pasos, el Gantt de Disponibilidad, cargar pagos y seguros, cambiar estados, generar y compartir remitos, etc. — es el mismo sistema, la app nativa es una "cáscara" liviana alrededor del mismo sitio responsive que ya armamos en las secciones 8 y 9.
- **Consultar información ya vista queda disponible sin señal** (gracias a la PWA de la sección 8) y **las cargas hechas sin conexión se reintentan solas** apenas vuelve la señal — pero crear un alquiler nuevo, chequear disponibilidad real o sincronizar con Google Calendar sí necesitan conexión al momento de hacerlo, porque dependen de la base de datos compartida.

En la práctica esto ya cubre el caso de uso real de un chofer o técnico en un evento: mala señal momentánea no corta el trabajo (lo que ya cargó se ve, lo que carga se encola y se manda solo), y apenas hay señal de nuevo (WiFi del lugar, datos móviles) la app vuelve a estar 100% al día.

### Cómo funciona técnicamente

La `.apk` es una **Trusted Web Activity (TWA)** — la misma tecnología que usan miles de apps reales en Google Play (Twitter/X, Starbucks, Spotify tuvieron o tienen versiones así). Es una app Android mínima que abre tu sitio ya desplegado dentro de una ventana nativa, usando el motor de Chrome del celular pero sin mostrar ninguna interfaz de navegador. Por eso, para que funcione, **el sistema tiene que estar desplegado en una URL real con HTTPS** (Vercel, sección 10) — la APK no lleva el sitio "adentro" empaquetado, apunta a esa URL.

Ya te dejamos armado en el proyecto (carpeta `android/`) todo lo necesario para compilarla, y un workflow de GitHub Actions que la compila sola en la nube — **no hace falta instalar Android Studio ni el SDK de Android en tu computadora.**

### Paso a paso para tener la APK instalada en tu celular

1. **Desplegá el sistema primero** siguiendo la sección 10 (Vercel) — necesitás la URL final antes de seguir (ej: `lobyte-erp.vercel.app` o tu dominio propio).
2. **Actualizá el dominio en el proyecto Android.** Abrí `android/app/build.gradle` y cambiá esta línea por tu URL real (sin `https://`, sin barra al final):
   ```groovy
   def HOST = "lobyte-erp.vercel.app"
   ```
3. **Subí los cambios a GitHub** (el mismo repo que ya conectaste a Vercel en la sección 10):
   ```bash
   git add android/app/build.gradle
   git commit -m "Configurar dominio de la APK"
   git push
   ```
4. **GitHub Actions compila la APK sola.** En tu repo de GitHub, andá a la pestaña **"Actions"** — vas a ver el workflow **"Build Android APK"** corriendo (tarda 3-5 minutos). Si preferís dispararlo a mano sin esperar un push, andá a *Actions → Build Android APK → Run workflow*.
5. **Descargá la APK.** Cuando termine, andá a la pestaña **"Releases"** del repo (o a *Actions → [la corrida] → Artifacts* si preferís esa vía) — ahí vas a encontrar **`lobyte-erp.apk`**, siempre con el mismo link estable así que lo podés guardar como favorito.
6. **Pasala al celular.** Lo más simple: abrí ese link de Releases directamente desde el navegador del celular (Chrome) y descargala ahí. También podés mandártela por email, Drive o WhatsApp a vos mismo.
7. **Instalala.** Android va a pedirte permiso para instalar apps de "orígenes desconocidos" la primera vez (es normal, pasa con cualquier `.apk` que no venga de Google Play) — aceptá ese permiso solo para el navegador o la app que estás usando para instalarla, y confirmá la instalación. Va a aparecer un ícono de **LOBYTE ERP** en el celular como cualquier otra app.
8. **Actualizaciones**: cuando cambies algo del sistema y quieras una APK nueva, repetí desde el paso 3 (o simplemente esperá al próximo push si tocás algo dentro de `android/`) y volvé a instalar la nueva `.apk` sobre la vieja — al estar firmadas con la misma clave, Android la actualiza sin pedir desinstalar nada.

### Notas técnicas y sobre seguridad de la firma

- La app está firmada con una clave (`android/keystore/lobyte-release.keystore`) generada específicamente para este proyecto y ya incluida en el repo — así el fingerprint no cambia entre builds y las actualizaciones se instalan sin fricción. **No es una clave pensada para publicar en Google Play** (para eso Google exige un manejo de clave más estricto, vía Play App Signing); sirve perfectamente para uso interno del equipo por fuera de la Play Store, que es el caso de LOBYTE.
- `public/.well-known/assetlinks.json` ya tiene el fingerprint correcto de esa clave — es lo que le permite a la app abrir en pantalla completa (sin barra de navegador) apenas Android verifica, contra tu dominio desplegado, que sos el dueño legítimo del sitio. No hace falta tocar este archivo.
- Si en algún momento quisieran publicarla en Google Play Store, hay que generar una keystore de producción propia y seguir el proceso de alta de Google Play Console — es un paso aparte, opcional, y no hace falta para que el equipo la use ya mismo por fuera de la tienda.

## 14. Próximos pasos sugeridos (fuera del alcance de esta versión)

- **Autenticación y roles** (ej. NextAuth) — hoy el ERP asume un solo equipo interno sin login.
- **Carga de archivos real** (hoy los comprobantes de seguro/seña y material digital se guardan como URLs a Drive; se podría sumar upload directo a Supabase Storage o Google Drive API).
- **Webhooks de WhatsApp Business API** para automatizar más el envío de encuestas post-evento y remitos (hoy se abre `wa.me` con el mensaje precargado, sin adjuntar archivos).
- **Firma digital en pantalla** para el remito (hoy el espacio de firma es para completar a mano sobre el papel/PDF impreso; se podría sumar un canvas de firma táctil que se guarde junto al alquiler).
- **Tests automatizados** (Vitest/Playwright) sobre el motor de disponibilidad y los server actions críticos.
- **Precisión decimal estricta** en montos (hoy `Float` en Prisma por simplicidad; para contabilidad fina conviene migrar a `Decimal`).
- **Publicación en Google Play Store** (opcional) — requiere una keystore de producción propia y alta en Play Console; la base técnica (TWA) ya está lista para ese camino.
