-- Seed de profesionales reales del centro (ver docs del proyecto).

insert into profesionales (nombre, especialidad_id, sede_id)
select 'Franco Tabilo', (select id from especialidades where nombre = 'Kinesiología'), (select id from sedes limit 1)
union all
select 'Barbara Covarrubias', (select id from especialidades where nombre = 'Fonoaudiología'), (select id from sedes limit 1);
