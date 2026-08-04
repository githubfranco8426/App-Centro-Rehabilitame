import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components";
import { bodyStyle, containerStyle, footerStyle, headingStyle, labelStyle, valorStyle } from "./estilos";

export interface CancelacionEmailProps {
  pacienteNombre: string;
  servicioNombre: string;
  profesionalNombre: string;
  fechaFormateada: string;
}

export function CancelacionEmail({
  pacienteNombre,
  servicioNombre,
  profesionalNombre,
  fechaFormateada,
}: CancelacionEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu hora fue cancelada</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>Hola {pacienteNombre}, tu hora fue cancelada</Heading>
          <Text>Esta reserva ya no está vigente:</Text>

          <Text style={labelStyle}>Servicio</Text>
          <Text style={valorStyle}>{servicioNombre}</Text>

          <Text style={labelStyle}>Fecha y hora</Text>
          <Text style={valorStyle}>{fechaFormateada}</Text>

          <Text style={labelStyle}>Profesional</Text>
          <Text style={valorStyle}>{profesionalNombre}</Text>

          <Hr />
          <Text style={footerStyle}>
            Si querés reservar una nueva hora, podés hacerlo desde la app cuando quieras.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default CancelacionEmail;
