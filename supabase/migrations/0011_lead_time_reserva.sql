-- Las horas disponibles ya no muestran slots pasados ni slots a menos de
-- 3 horas de anticipación (mismo LEAD_TIME_MINUTOS_PACIENTE que usa
-- src/lib/citas/reglas.ts para cancelar/reagendar, ahora también aplicado a
-- la reserva inicial). Como efecto directo, a medida que avanza el día las
-- horas ya pasadas van desapareciendo solas de la grilla.

create or replace function public.get_available_slots(
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
      ((p_fecha + ds.hora_inicio) at time zone 'America/Santiago') as inicio_bloque,
      ((p_fecha + ds.hora_fin) at time zone 'America/Santiago') as fin_bloque
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
  where c.slot_inicio >= now() + interval '3 hours'
  and not exists (
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

create or replace function public.get_available_slots_from_bloques(
  p_profesional_id uuid,
  p_servicio_id uuid,
  p_bloques jsonb
)
returns table (slot_inicio timestamptz, slot_fin timestamptz)
language plpgsql
security definer set search_path = public
as $$
declare
  v_duracion interval;
begin
  select (duracion_minutos || ' minutes')::interval into v_duracion
  from servicios where id = p_servicio_id;

  return query
  with bloques as (
    select
      (b->>'inicio')::timestamptz as inicio_bloque,
      (b->>'fin')::timestamptz as fin_bloque
    from jsonb_array_elements(p_bloques) as b
  ),
  candidatos as (
    select
      generate_series(inicio_bloque, fin_bloque - v_duracion, v_duracion) as slot_inicio
    from bloques
    where fin_bloque - inicio_bloque >= v_duracion
  )
  select c.slot_inicio, c.slot_inicio + v_duracion as slot_fin
  from candidatos c
  where c.slot_inicio >= now() + interval '3 hours'
  and not exists (
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
