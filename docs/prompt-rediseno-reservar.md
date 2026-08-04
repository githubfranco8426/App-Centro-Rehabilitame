# Prompt one-shot — Rediseño cálido del flujo de reserva

Guardado el 1 de agosto 2026. Prompt listo para pegar en una sesión de Claude cuando se quiera aplicar el rediseño visual (cálido, cercano al paciente) al flujo real de `/reservar`, usando `rehabilita-agenda.html` como referencia de marca.

---

Contexto: trabajas sobre "Centro Rehabilitame", una app Next.js 16 (App Router, TypeScript)
+ Tailwind CSS v4 + shadcn/ui + Supabase, donde pacientes reservan horas con Kinesiólogo,
Fonoaudiólogo y Terapeuta Ocupacional. En `design/rehabilita-agenda.html` hay un mockup de marca de
referencia: estética minimalista tipo Apple/Stripe, tipografía
Playfair Display para títulos + Inter para cuerpo, fondo gris claro, texto casi negro,
acento cálido, animaciones suaves de scroll-reveal y flotación. Úsalo como referencia de
tono y movimiento, pero para el color usa los tokens ya definidos en `src/app/globals.css`
(--primary, --accent, --radius, --radius-xl, etc.) como fuente de verdad, para no romper
el modo oscuro.

Objetivo: rediseñar visualmente el flujo real de reserva de horas para que se sienta
cálido, humano y cercano al paciente — no un panel administrativo — sin tocar la lógica
de datos, queries de Supabase, server actions, rutas ni searchParams existentes.

Archivos a editar (solo JSX, clases Tailwind y textos):
1. src/app/(public)/reservar/page.tsx — lista de servicios agrupados por especialidad,
   hoy son Cards de shadcn genéricas con "Elegí el servicio que necesitás" como copy.
2. src/app/(public)/reservar/[servicioId]/page.tsx — selector de día (scroll horizontal
   de 14 días) y grilla de horarios disponibles.
3. src/app/(public)/reservar/[servicioId]/confirmar/page.tsx — resumen + ConfirmarReservaForm
   dentro de una Card simple.
4. src/components/site-header.tsx — header con logo, "Iniciar sesión"/"Registrarse" o
   "Mis horas"/"Cerrar sesión".

Cambios, en orden de prioridad:
1. Copy más cálido y consistente en tú/vos: cambia "Elegí el servicio que necesitás" por
   algo como "Cuéntanos qué necesitas y te ayudamos a agendar tu hora", con un subtítulo
   breve que transmita cuidado, no trámite.
2. Usa --accent (color cálido) para el hover/estado activo de las cards de servicio, los
   días seleccionados y los horarios disponibles — hoy todo usa --primary en todos lados
   y se ve clínico.
3. Agrega un ícono por especialidad en cada card de servicio (lucide-react ya está
   instalado), más padding y radio de borde generoso (--radius-xl o --radius-2xl).
4. En reservar/[servicioId]/page.tsx, dale más jerarquía visual al nombre del profesional
   y a la fecha seleccionada — hoy son textos pequeños sin peso.
5. En el paso de confirmación, rediseña el resumen dentro del Card: ícono de check,
   fecha/hora en tipografía grande, nombre del profesional destacado, en vez del bloque
   de texto plano actual.
6. Anima la aparición de las cards y slots con un fade/slide suave al cargar (usa
   tw-animate-css, ya está instalado — no agregues Framer Motion ni otra dependencia nueva).
7. Verifica mobile-first: una columna en pantallas chicas, botones y slots grandes y
   fáciles de tocar con el dedo.
8. Mantén contraste y accesibilidad, y respeta el modo oscuro ya definido en globals.css.

Restricciones estrictas:
- No modifiques src/lib/citas/*, src/lib/servicios/*, src/lib/profesionales/*,
  src/lib/supabase/* ni ninguna server action.
- No agregues dependencias npm nuevas.
- No cambies rutas, searchParams ni la forma de los datos que llegan de Supabase.
- Al terminar, corre `npm run lint` y corrige cualquier error antes de entregar.

Entrega el código completo de cada archivo modificado, listo para reemplazar el actual.
