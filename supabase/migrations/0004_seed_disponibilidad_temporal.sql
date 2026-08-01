-- Disponibilidad semanal placeholder (lunes a viernes, 09:00–18:00) para poder
-- probar el flujo de reserva de punta a punta. Ajustar a los horarios reales
-- desde /admin/profesionales cuando esa pantalla exista.

insert into disponibilidad_semanal (profesional_id, dia_semana, hora_inicio, hora_fin)
select p.id, dia, '09:00', '18:00'
from profesionales p
cross join generate_series(1, 5) as dia;
