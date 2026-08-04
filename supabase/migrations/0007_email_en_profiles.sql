-- Las notificaciones por email necesitan el email del paciente, que hoy
-- solo vive en auth.users (no expuesto vía RLS/PostgREST desde el cliente).
-- Se denormaliza a profiles, ya cubierto por sus políticas RLS existentes
-- ("propio o admin").

alter table profiles add column email text;

update profiles p
set email = u.email
from auth.users u
where p.id = u.id;

alter table profiles alter column email set not null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, telefono, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    new.raw_user_meta_data ->> 'telefono',
    new.email
  );
  return new;
end;
$$;
