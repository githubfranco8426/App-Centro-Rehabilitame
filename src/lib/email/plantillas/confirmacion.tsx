import { Head, Html, Preview, Section } from "@react-email/components";
import { cardStyle } from "./estilos";
import { MarcoCorreo, BotonAdministrar } from "./marco";
import { Fila, SeparadorPunteado, TarjetaProfesional, TituloSeccion } from "./filas";

export interface ConfirmacionEmailProps {
  pacienteNombre: string;
  pacienteTelefono?: string;
  pacienteEmail: string;
  servicioNombre: string;
  profesionalNombre: string;
  especialidadNombre?: string;
  sedeNombre?: string;
  sedeDireccion?: string;
  fechaFormateada: string;
}

export function ConfirmacionEmail({
  pacienteNombre,
  pacienteTelefono,
  pacienteEmail,
  servicioNombre,
  profesionalNombre,
  especialidadNombre,
  sedeNombre,
  sedeDireccion,
  fechaFormateada,
}: ConfirmacionEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirmamos tu hora en Centro Rehabilita.me</Preview>
      <MarcoCorreo
        saludoTitulo={`Estimado(a) ${pacienteNombre}.`}
        saludoTexto="Muchas gracias por agendar tu cita con nosotros."
      >
        <Section style={cardStyle}>
          <TarjetaProfesional nombre={profesionalNombre} especialidad={especialidadNombre} />

          <SeparadorPunteado />

          <TituloSeccion>Datos de la reserva</TituloSeccion>
          <Fila label="Fecha" valor={fechaFormateada} destacado />
          <Fila label="Servicio" valor={servicioNombre} ultimo={!sedeNombre && !sedeDireccion} />
          {sedeNombre && <Fila label="Centro" valor={sedeNombre} ultimo={!sedeDireccion} />}
          {sedeDireccion && <Fila label="Dirección" valor={sedeDireccion} ultimo />}

          <SeparadorPunteado />

          <TituloSeccion>Datos del paciente</TituloSeccion>
          <Fila label="Nombre" valor={pacienteNombre} ultimo={!pacienteTelefono} />
          {pacienteTelefono && <Fila label="Teléfono" valor={pacienteTelefono} />}
          <Fila label="Email" valor={pacienteEmail} ultimo />

          <BotonAdministrar />
        </Section>
      </MarcoCorreo>
    </Html>
  );
}

export default ConfirmacionEmail;
