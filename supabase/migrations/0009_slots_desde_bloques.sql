-- RPC hermana de get_available_slots, pero recibe los bloques de
-- disponibilidad como parámetro en vez de leerlos de disponibilidad_semanal.
-- La usan los profesionales conectados a Google Calendar, cuya disponibilidad
-- real sale de eventos "Cupos de consulta" en su calendario (turnos
-- rotativos, no un horario semanal fijo). Mantiene la misma lógica
-- anti-colisión contra citas y bloqueos que la RPC original.

create function public.get_available_slots_from_bloques(
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
