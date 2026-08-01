-- Servicios placeholder para poder probar el flujo de reserva de punta a punta.
-- Reemplazar por el catálogo real (7 servicios: 3 Kinesiología + 4 Fonoaudiología)
-- cuando se defina — ver docs/plan.md.

insert into servicios (especialidad_id, nombre, duracion_minutos)
select id, 'Consulta diagnóstico', 30 from especialidades where nombre in ('Kinesiología', 'Fonoaudiología')
union all
select id, 'Sesión de seguimiento', 30 from especialidades where nombre in ('Kinesiología', 'Fonoaudiología');
