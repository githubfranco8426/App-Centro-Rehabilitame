-- Catálogo real de servicios (reemplaza los placeholder de 0003).
-- No se borran los placeholder porque ya hay citas de prueba que los
-- referencian (servicio_id); se desactivan en su lugar.

alter table servicios add column precio integer;

update servicios set activo = false
where nombre in ('Consulta diagnóstico', 'Sesión de seguimiento');

insert into servicios (especialidad_id, nombre, duracion_minutos, precio)
select id, 'Evaluación kinésica + informe', 30, 35000 from especialidades where nombre = 'Kinesiología'
union all
select id, 'Sesión kinesiología respiratoria', 30, 30000 from especialidades where nombre = 'Kinesiología'
union all
select id, 'Sesión kinesiología maxilofacial', 30, 40000 from especialidades where nombre = 'Kinesiología'
union all
select id, 'Evaluación fonoaudiológica + informe', 30, 45000 from especialidades where nombre = 'Fonoaudiología'
union all
select id, 'Evaluación cognitiva completa + informe', 30, 45000 from especialidades where nombre = 'Fonoaudiología'
union all
select id, 'Evaluación área infantil', 30, 45000 from especialidades where nombre = 'Fonoaudiología'
union all
select id, 'Sesión tratamiento fonoaudiología', 45, 30000 from especialidades where nombre = 'Fonoaudiología';
