import { Head, Html, Preview, Section } from "@react-email/components";
import { cardStyle } from "./estilos";
import { MarcoCorreo } from "./marco";
import { Fila, SeparadorPunteado, TarjetaProfesional, TituloSeccion } from "./filas";

export interface CancelacionEmailProps {
  pacienteNombre: string;
  servicioNombre: string;
  profesionalNombre: string;
  especialidadNombre?: string;
  fechaFormateada: string;
}

export function CancelacionEmail({
  pacienteNombre,
  servicioNombre,
  profesionalNombre,
  especialidadNombre,
  fechaFormateada,
}: CancelacionEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu hora fue cancelada — Centro Rehabilita.me</Preview>
      <MarcoCorreo saludoTitulo={`Estimado(a) ${pacienteNombre}.`} saludoTexto="Esta reserva ya no está vigente.">
        <Section style={cardStyle}>
          <TarjetaProfesional nombre={profesionalNombre} especialidad={especialidadNombre} />

          <SeparadorPunteado />

          <TituloSeccion>Reserva cancelada</TituloSeccion>
          <Fila label="Fecha" valor={fechaFormateada} />
          <Fila label="Servicio" valor={servicioNombre} ultimo />
        </Section>
      </MarcoCorreo>
    </Html>
  );
}

export default CancelacionEmail;
