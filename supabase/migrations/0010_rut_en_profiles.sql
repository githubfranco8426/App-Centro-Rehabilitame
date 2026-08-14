-- El flujo de reserva ahora identifica al paciente por RUT (además de
-- nombre/teléfono/email) desde el nuevo paso /reservar/identificacion.
-- Nullable porque los perfiles existentes no tienen este dato retroactivo.

alter table profiles add column rut text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, telefono, email, rut)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    new.raw_user_meta_data ->> 'telefono',
    new.email,
    new.raw_user_meta_data ->> 'rut'
  );
  return new;
end;
$$;
