# App de reservas para centro de rehabilitación

## Contexto

El centro necesita reemplazar la coordinación manual de horas (Kinesiología, Fonoaudiología, Terapia Ocupacional) por una app web donde los pacientes reserven directamente y el administrador tenga visión total de la agenda. Requisitos confirmados con el usuario:

- Web responsiva (no apps nativas).
- Backend en Supabase (Postgres + Auth).
- El paciente navega y elige especialidad, servicio, profesional y **horario sin necesidad de iniciar sesión antes**; recién al confirmar esa hora se le pide crear cuenta (o iniciar sesión si ya tiene una). Después de esa reserva inicial, sí usa su cuenta para ver/reagendar/cancelar sus horas.
- Varios profesionales por especialidad, cada uno con agenda propia.
- Servicios ya definidos para Kinesiología (3) y Fonoaudiología (4); Terapia Ocupacional queda abierta para que el admin cargue sus servicios desde el panel.
- Disponibilidad configurable por el administrador (bloques semanales + bloqueos por vacaciones/feriados).
- Email de confirmación/cancelación/reagendamiento (Resend).
- Panel admin con vista general de todas las citas y gestión de profesionales/servicios/disponibilidad.
- Sin pagos en línea. Interfaz 100% en español.

Es un proyecto **greenfield** (carpeta vacía, sin git). El plan cubre desde el setup inicial hasta un primer despliegue funcional.

## Stack técnico

- **Next.js 14+ (App Router, TypeScript)** — Server Actions evitan exponer lógica/secretos al cliente; un solo repo sirve tanto el sitio de pacientes como el panel admin.
- **Tailwind CSS + shadcn/ui** para UI, **React Hook Form + Zod** para formularios/validación.
- **Supabase**: Postgres + Auth + Row Level Security. Tipos generados con `supabase gen types typescript`.
- **Resend + React Email** para las notificaciones por correo.
- **date-fns / date-fns-tz**, zona horaria fija `America/Santiago` en toda la app y en los emails.
- **Vercel** para hosting/deploy (git push → deploy), **Supabase Cloud** para DB/Auth.
- Sin gestor de estado global: Server Components + Server Actions son suficientes.

## Modelo de datos (Supabase/Postgres)

Enums: `rol_usuario` (paciente/profesional/admin), `estado_cita` (pendiente/confirmada/cancelada/completada/no_asistio), `tipo_notificacion` (confirmacion/cancelacion/reagendamiento).

Tablas principales:
- **`profiles`** — extiende `auth.users` (creada por trigger al registrarse), guarda `rol`, nombre, teléfono.
- **`sedes`** — una sola fila hoy, evita bloquear una futura segunda sede sin sobre-diseñar la UI para eso ahora.
- **`especialidades`** — Kinesiología, Fonoaudiología, Terapia Ocupacional (seed inicial).
- **`profesionales`** — nombre, `especialidad_id`, `sede_id`, `activo` (soft delete para no perder historial).
- **`servicios`** — `especialidad_id`, `nombre`, `duracion_minutos`, `activo`. Seed con los 7 servicios ya definidos; Terapia Ocupacional se agrega desde `/admin/servicios`.
- **`disponibilidad_semanal`** — bloques recurrentes por profesional (`dia_semana`, `hora_inicio`, `hora_fin`).
- **`bloqueos`** — excepciones (vacaciones de un profesional o feriados del centro entero cuando `profesional_id is null`).
- **`citas`** — tabla central: paciente, profesional, servicio, `fecha_inicio`/`fecha_fin`, `estado`, quién la creó/canceló.
  - **Constraint anti-colisión a nivel de Postgres** (clave del diseño, evita dobles reservas incluso con clics simultáneos):
    ```sql
    alter table citas add constraint no_solapamiento
      exclude using gist (
        profesional_id with =,
        tsrange(fecha_inicio, fecha_fin) with &&
      ) where (estado <> 'cancelada');
    ```
- **`notificaciones_log`** — trazabilidad de envíos de email (útil para que el equipo del centro detecte fallos de envío).

**RPC `get_available_slots(profesional_id, servicio_id, fecha)`** (`security definer`): calcula en el servidor los horarios libres cruzando disponibilidad semanal, bloqueos y citas existentes — el cliente nunca calcula disponibilidad localmente, y no necesita acceso directo (vía RLS) a las tablas de agenda de otros.

**RLS**: cada tabla tiene políticas por rol — paciente ve/edita solo lo suyo, profesional ve su propia agenda, admin ve y gestiona todo. Especialidades/servicios/profesionales son de lectura pública (para poder navegar el flujo de reserva). Disponibilidad y bloqueos no son legibles directamente por el paciente, solo vía la RPC.

## Estructura de la app (Next.js App Router)

```
/app
  /(public)          → landing, login, registro
    reservar/...   → especialidad → servicio → profesional → horario (SIN login)
    reservar/.../confirmar → formulario de registro/login + confirma la cita
  /(paciente)        → guard: sesión requerida
    mis-horas/... → ver, reagendar, cancelar
  /(admin)           → guard: rol admin
    admin/agenda        → vista general filtrable (calendario + tabla)
    admin/citas/nueva   → crear cita a nombre de un paciente
    admin/profesionales → CRUD + disponibilidad + bloqueos por profesional
    admin/servicios     → CRUD de servicios (incluye alta de servicios de TO)
    admin/bloqueos      → feriados/bloqueos generales del centro
  middleware.ts      → refresca sesión y redirige por rol (UX; la seguridad real la da RLS)
/lib
  supabase/{client,server,middleware}.ts
  citas/actions.ts   → Server Actions crearCita/cancelarCita/reagendarCita (aquí se valida colisión y se dispara el email)
  email/resend.ts + email/plantillas/*.tsx
/supabase/migrations/*.sql
```

## Flujo de reserva (paciente)

1. Elegir especialidad → 2. servicio → 3. profesional → 4. fecha/hora, **todo esto navegable sin sesión iniciada** (consultando `get_available_slots` en vivo, que ya corre `security definer` y no requiere auth).
5. Al elegir un horario, el slot se guarda temporalmente en el estado del formulario (no se reserva en la base todavía) y se pasa a la pantalla `reservar/.../confirmar`, que muestra:
   - Resumen de la hora elegida (especialidad, servicio, profesional, fecha/hora).
   - Un formulario con dos pestañas: **"Crear cuenta"** (nombre, email, teléfono, password) para pacientes nuevos, o **"Iniciar sesión"** para quienes ya tienen cuenta de una reserva anterior.
6. Al enviar ese formulario, una Server Action única (`registrarYReservar` o `iniciarSesionYReservar`) autentica/crea al usuario y **en el mismo paso** inserta la cita — así se minimiza la ventana entre elegir el horario y reservarlo.
   - Si otro paciente tomó ese mismo horario mientras el primero completaba el formulario, el constraint de exclusión rechaza el insert y la Server Action muestra "ese horario ya no está disponible, por favor elige otro" y lo regresa al paso 4 con los slots refrescados (no pierde los datos ya escritos en el formulario de cuenta).
7. Se envía email de confirmación; la reserva **no depende** de que el email tenga éxito (si falla, se registra en `notificaciones_log` pero la cita queda creada igual).
8. Reagendar = cancelar la cita original + crear una nueva en una transacción (esto sí ocurre ya autenticado, desde `/mis-horas`). Cancelar valida una anticipación mínima simple antes de permitirlo.

## Panel de administrador

Agenda general (`/admin/agenda`) con vista calendario y vista tabla filtrable por profesional/especialidad/fecha/estado; click en una cita permite cambiar estado, cancelar o reagendar. CRUD de profesionales (con tabs de disponibilidad semanal y bloqueos individuales), CRUD de servicios, y gestión de bloqueos generales del centro. Todo pensado para que el equipo del centro (sin conocimientos técnicos) pueda operarlo sin tocar código.

## Emails (Resend)

Las Server Actions de `lib/citas/actions.ts` llaman a Resend directamente desde el servidor (Vercel), usando `RESEND_API_KEY` como variable de entorno server-only (nunca llega al cliente). Se descarta usar Supabase Edge Functions por ahora — agregaría una segunda pieza de infraestructura sin necesidad real, ya que todo pasa por Server Actions.

## Fases de implementación

1. **Setup base** — proyecto Next.js/Tailwind/shadcn, proyecto Supabase, variables de entorno, deploy "hola mundo" en Vercel para validar el pipeline.
2. **Modelo de datos + auth** — migraciones (tablas, enums, constraint anti-colisión, RLS, RPC), seed de especialidades/servicios/sede, login/registro, `middleware.ts`. *Verificable*: crear usuario, confirmar que RLS bloquea ver datos ajenos.
3. **Flujo de reserva del paciente** — páginas `/reservar/*`, Server Actions, `/mis-horas`. *Verificable*: reservar de punta a punta; probar dos reservas simultáneas al mismo horario y confirmar que el constraint las impide.
4. **Panel de administrador** — CRUD profesionales/servicios/disponibilidad/bloqueos, agenda general. *Verificable*: admin crea un profesional con disponibilidad y este aparece reservable en el flujo de paciente.
5. **Notificaciones por email** — integración Resend + plantillas, `notificaciones_log`. *Verificable*: reservar/cancelar/reagendar y confirmar recepción real del correo.
6. **Pulido y despliegue final** — QA responsivo, verificación de zona horaria `America/Santiago` en app y emails, mensajes de error en español, prueba de concurrencia, documentación breve de uso para el equipo del centro, dominio y deploy productivo.

## Archivos críticos

- `supabase/migrations/0001_schema_inicial.sql` — esquema completo, constraint anti-colisión, RLS, RPC `get_available_slots`.
- `lib/citas/actions.ts` — Server Actions de creación/cancelación/reagendamiento, punto donde se valida colisión y se dispara el email.
- `middleware.ts` — control de acceso por rol.
- `app/(public)/reservar/.../confirmar/page.tsx` — pantalla donde se elige el horario, se completa el registro/login y se confirma la cita en un solo paso.
- `app/(admin)/admin/agenda/page.tsx` — vista de agenda general del admin.
- `lib/email/resend.ts` y `lib/email/plantillas/*.tsx` — envío de notificaciones sin exponer API keys.

## Verificación

- Registrar un paciente de prueba y reservar una hora completa (especialidad → servicio → profesional → horario → confirmar), revisando que la cita aparece en `/mis-horas` y en `/admin/agenda`.
- Abrir dos pestañas como pacientes distintos e intentar reservar el mismo horario simultáneamente; confirmar que solo una reserva se concreta.
- Como admin, crear un profesional nuevo con disponibilidad y bloqueos, y confirmar que el flujo de reserva del paciente refleja correctamente los horarios libres.
- Confirmar recepción real de los tres tipos de email (confirmación, cancelación, reagendamiento) en una casilla de prueba.
- Revisar la app en mobile, tablet y desktop (breakpoints de Tailwind) antes del deploy final.
