import { Body, Container, Head, Heading, Hr, Html, Preview, Text } from "@react-email/components";
import { bodyStyle, containerStyle, footerStyle, headingStyle, labelStyle, valorStyle } from "./estilos";

export interface ReagendamientoEmailProps {
  pacienteNombre: string;
  servicioNombre: string;
  profesionalNombre: string;
  fechaFormateada: string;
  fechaAnteriorFormateada?: string;
}

export function ReagendamientoEmail({
  pacienteNombre,
  servicioNombre,
  profesionalNombre,
  fechaFormateada,
  fechaAnteriorFormateada,
}: ReagendamientoEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu hora fue reagendada</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>Hola {pacienteNombre}, reagendamos tu hora</Heading>

          <Text style={labelStyle}>Servicio</Text>
          <Text style={valorStyle}>{servicioNombre}</Text>

          {fechaAnteriorFormateada && (
            <>
              <Text style={labelStyle}>Horario anterior</Text>
              <Text style={{ ...valorStyle, textDecoration: "line-through", fontWeight: 400, color: "#888888" }}>
                {fechaAnteriorFormateada}
              </Text>
            </>
          )}

          <Text style={labelStyle}>Nuevo horario</Text>
          <Text style={valorStyle}>{fechaFormateada}</Text>

          <Text style={labelStyle}>Profesional</Text>
          <Text style={valorStyle}>{profesionalNombre}</Text>

          <Hr />
          <Text style={footerStyle}>
            Si este horario no te sirve, podés volver a reagendar o cancelar desde &quot;Mis
            horas&quot; en la app.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ReagendamientoEmail;
