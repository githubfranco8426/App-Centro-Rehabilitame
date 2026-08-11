import { Head, Html, Preview, Section, Text } from "@react-email/components";
import { cardStyle, rowLabelStyle, rowStyle } from "./estilos";
import { MarcoCorreo, BotonAdministrar } from "./marco";
import { Fila, SeparadorPunteado, TarjetaProfesional, TituloSeccion } from "./filas";

export interface ReagendamientoEmailProps {
  pacienteNombre: string;
  pacienteTelefono?: string;
  pacienteEmail: string;
  servicioNombre: string;
  profesionalNombre: string;
  especialidadNombre?: string;
  sedeNombre?: string;
  sedeDireccion?: string;
  fechaFormateada: string;
  fechaAnteriorFormateada?: string;
}

export function ReagendamientoEmail({
  pacienteNombre,
  pacienteTelefono,
  pacienteEmail,
  servicioNombre,
  profesionalNombre,
  especialidadNombre,
  sedeNombre,
  sedeDireccion,
  fechaFormateada,
  fechaAnteriorFormateada,
}: ReagendamientoEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu hora fue reagendada — Centro Rehabilita.me</Preview>
      <MarcoCorreo
        saludoTitulo={`Estimado(a) ${pacienteNombre}.`}
        saludoTexto="Actualizamos el horario de tu reserva."
      >
        <Section style={cardStyle}>
          <TarjetaProfesional nombre={profesionalNombre} especialidad={especialidadNombre} />

          <SeparadorPunteado />

          <TituloSeccion>Datos de la reserva</TituloSeccion>
          {fechaAnteriorFormateada && (
            <div style={rowStyle}>
              <Text style={rowLabelStyle}>Horario anterior</Text>
              <Text
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#999999",
                  margin: 0,
                  textAlign: "right" as const,
                  textDecoration: "line-through",
                }}
              >
                {fechaAnteriorFormateada}
              </Text>
            </div>
          )}
          <Fila label="Nuevo horario" valor={fechaFormateada} destacado />
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

export default ReagendamientoEmail;
