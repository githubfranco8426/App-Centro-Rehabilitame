import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components";
import { bodyStyle, containerStyle, footerStyle, headingStyle, labelStyle, valorStyle } from "./estilos";

export interface ConfirmacionEmailProps {
  pacienteNombre: string;
  servicioNombre: string;
  profesionalNombre: string;
  fechaFormateada: string;
}

export function ConfirmacionEmail({
  pacienteNombre,
  servicioNombre,
  profesionalNombre,
  fechaFormateada,
}: ConfirmacionEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirmamos tu hora en Centro Rehabilita.me</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>¡Hora confirmada, {pacienteNombre}!</Heading>
          <Text>Tu reserva quedó agendada con éxito.</Text>

          <Text style={labelStyle}>Servicio</Text>
          <Text style={valorStyle}>{servicioNombre}</Text>

          <Text style={labelStyle}>Fecha y hora</Text>
          <Text style={valorStyle}>{fechaFormateada}</Text>

          <Text style={labelStyle}>Profesional</Text>
          <Text style={valorStyle}>{profesionalNombre}</Text>

          <Hr />
          <Text style={footerStyle}>
            Si necesitás cancelar o reagendar, hacelo desde &quot;Mis horas&quot; en la app.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ConfirmacionEmail;
