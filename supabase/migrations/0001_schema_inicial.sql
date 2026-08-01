-- Esquema inicial: enums, tablas, constraint anti-colisión, RLS y RPC de disponibilidad.
-- Ver docs/plan.md para el contexto de cada decisión.

create extension if not exists btree_gist;

-- ─── Enums ──────────────────────────────────────────────────────────────

create type rol_usuario as enum ('paciente', 'profesional', 'admin');
create type estado_cita as enum ('pendiente', 'confirmada', 'cancelada', 'completada', 'no_asistio');
create type tipo_notificacion as enum ('confirmacion', 'cancelacion', 'reagendamiento');

-- ─── Tablas ─────────────────────────────────────────────────────────────

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  rol rol_usuario not null default 'paciente',
  nombre text not null,
  telefono text,
  created_at timestamptz not null default now()
);

create table sedes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  created_at timestamptz not null default now()
);

create table especialidades (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  created_at timestamptz not null default now()
);

create table profesionales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  especialidad_id uuid not null references especialidades (id),
  sede_id uuid not null references sedes (id),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table servicios (
  id uuid primary key default gen_random_uuid(),
  especialidad_id uuid not null references especialidades (id),
  nombre text not null,
  duracion_minutos integer not null check (duracion_minutos > 0),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table disponibilidad_semanal (
  id uuid primary key default gen_random_uuid(),
  profesional_id uuid not null references profesionales (id) on delete cascade,
  dia_semana smallint not null check (dia_semana between 0 and 6), -- 0 = domingo
  hora_inicio time not null,
  hora_fin time not null check (hora_fin > hora_inicio)
);

create table bloqueos (
  id uuid primary key default gen_random_uuid(),
  profesional_id uuid references profesionales (id) on delete cascade, -- null = feriado del centro
  fecha_inicio timestamptz not null,
  fecha_fin timestamptz not null check (fecha_fin > fecha_inicio),
  motivo text
);

create table citas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references profiles (id),
  profesional_id uuid not null references profesionales (id),
  servicio_id uuid not null references servicios (id),
  fecha_inicio timestamptz not null,
  fecha_fin timestamptz not null check (fecha_fin > fecha_inicio),
  estado estado_cita not null default 'pendiente',
  creada_por uuid not null references profiles (id),
  cancelada_por uuid references profiles (id),
  created_at timestamptz not null default now(),

  -- Constraint anti-colisión: evita dobles reservas para un mismo profesional,
  -- incluso con clics simultáneos (se valida a nivel de Postgres, no de app).
  constraint no_solapamiento exclude using gist (
    profesional_id with =,
    tstzrange(fecha_inicio, fecha_fin) with &&
  ) where (estado <> 'cancelada')
);

create table notificaciones_log (
  id uuid primary key default gen_random_uuid(),
  cita_id uuid not null references citas (id) on delete cascade,
  tipo tipo_notificacion not null,
  exito boolean not null,
  error text,
  created_at timestamptz not null default now()
);

-- ─── Trigger: crear profile al registrarse ─────────────────────────────

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, telefono)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    new.raw_user_meta_data ->> 'telefono'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── RPC: horarios disponibles ─────────────────────────────────────────
-- Cruza disponibilidad semanal, bloqueos y citas existentes en el servidor.
-- security definer: el cliente (incluso anónimo) puede consultarla sin
-- tener acceso directo a las tablas de agenda vía RLS.

create function public.get_available_slots(
  p_profesional_id uuid,
  p_servicio_id uuid,
  p_fecha date
)
returns table (slot_inicio timestamptz, slot_fin timestamptz)
language plpgsql
security definer set search_path = public
as $$
declare
  v_duracion interval;
  v_dia_semana smallint;
begin
  select (duracion_minutos || ' minutes')::interval into v_duracion
  from servicios where id = p_servicio_id;

  v_dia_semana := extract(dow from p_fecha);

  return query
  with bloques as (
    select
      (p_fecha + ds.hora_inicio)::timestamptz as inicio_bloque,
      (p_fecha + ds.hora_fin)::timestamptz as fin_bloque
    from disponibilidad_semanal ds
    where ds.profesional_id = p_profesional_id
      and ds.dia_semana = v_dia_semana
  ),
  candidatos as (
    select
      generate_series(inicio_bloque, fin_bloque - v_duracion, v_duracion) as slot_inicio
    from bloques
  )
  select c.slot_inicio, c.slot_inicio + v_duracion as slot_fin
  from candidatos c
  where not exists (
    select 1 from citas ci
    where ci.profesional_id = p_profesional_id
      and ci.estado <> 'cancelada'
      and tstzrange(ci.fecha_inicio, ci.fecha_fin) && tstzrange(c.slot_inicio, c.slot_inicio + v_duracion)
  )
  and not exists (
    select 1 from bloqueos b
    where (b.profesional_id = p_profesional_id or b.profesional_id is null)
      and tstzrange(b.fecha_inicio, b.fecha_fin) && tstzrange(c.slot_inicio, c.slot_inicio + v_duracion)
  )
  order by c.slot_inicio;
end;
$$;

-- ─── RLS ────────────────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table sedes enable row level security;
alter table especialidades enable row level security;
alter table profesionales enable row level security;
alter table servicios enable row level security;
alter table disponibilidad_semanal enable row level security;
alter table bloqueos enable row level security;
alter table citas enable row level security;
alter table notificaciones_log enable row level security;

create function public.es_admin()
returns boolean
language sql security definer set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and rol = 'admin'
  );
$$;

-- profiles: cada quien ve y edita lo suyo; admin ve todo.
create policy "profiles: propio o admin" on profiles
  for select using (id = auth.uid() or es_admin());
create policy "profiles: editar lo propio" on profiles
  for update using (id = auth.uid());

-- Lectura pública: necesaria para navegar el flujo de reserva sin sesión.
create policy "sedes: lectura publica" on sedes for select using (true);
create policy "especialidades: lectura publica" on especialidades for select using (true);
create policy "profesionales: lectura publica" on profesionales for select using (true);
create policy "servicios: lectura publica" on servicios for select using (true);

-- Admin gestiona catálogo.
create policy "sedes: admin gestiona" on sedes for all using (es_admin());
create policy "especialidades: admin gestiona" on especialidades for all using (es_admin());
create policy "profesionales: admin gestiona" on profesionales for all using (es_admin());
create policy "servicios: admin gestiona" on servicios for all using (es_admin());

-- Disponibilidad y bloqueos: no legibles directamente por el paciente
-- (solo vía get_available_slots); admin gestiona.
create policy "disponibilidad: admin gestiona" on disponibilidad_semanal for all using (es_admin());
create policy "bloqueos: admin gestiona" on bloqueos for all using (es_admin());

-- citas: paciente ve/gestiona las suyas, admin ve/gestiona todas.
create policy "citas: paciente ve las suyas" on citas
  for select using (paciente_id = auth.uid() or es_admin());
create policy "citas: paciente crea las suyas" on citas
  for insert with check (paciente_id = auth.uid() or es_admin());
create policy "citas: paciente actualiza las suyas" on citas
  for update using (paciente_id = auth.uid() or es_admin());

create policy "notificaciones_log: solo admin" on notificaciones_log
  for all using (es_admin());

-- ─── Seed inicial ───────────────────────────────────────────────────────

insert into sedes (nombre) values ('Althia Med');

insert into especialidades (nombre) values
  ('Kinesiología'),
  ('Fonoaudiología'),
  ('Terapia Ocupacional');
