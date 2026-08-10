import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import { bodyStyle, containerStyle, footerStyle } from "./estilos";

export interface ReagendamientoEmailProps {
  pacienteNombre: string;
  servicioNombre: string;
  profesionalNombre: string;
  fechaFormateada: string;
  fechaAnteriorFormateada?: string;
}

const badgeStyle = {
  display: "inline-block",
  backgroundColor: "#fef3e2",
  color: "#a15c00",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
  padding: "4px 10px",
  borderRadius: "999px",
  marginBottom: "16px",
};

const headingStyle = { fontSize: "22px", fontWeight: 700, margin: "0 0 4px", color: "#111111" };
const subheadingStyle = { fontSize: "14px", color: "#666666", margin: "0 0 24px" };

const cardStyle = {
  backgroundColor: "#f7f7f8",
  borderRadius: "10px",
  padding: "20px 24px",
  margin: "0 0 8px",
};

const rowStyle = {
  display: "flex" as const,
  justifyContent: "space-between" as const,
  padding: "10px 0",
  borderBottom: "1px solid #e5e5e7",
};

const rowLabelStyle = { fontSize: "13px", color: "#666666", margin: 0 };
const rowValueStyle = { fontSize: "14px", fontWeight: 600, color: "#111111", margin: 0, textAlign: "right" as const };
const oldValueStyle = {
  fontSize: "13px",
  fontWeight: 500,
  color: "#999999",
  margin: 0,
  textAlign: "right" as const,
  textDecoration: "line-through",
};
const highlightRowStyle = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#1f4fd8",
  margin: 0,
  textAlign: "right" as const,
};

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
          <span style={badgeStyle}>Hora reagendada</span>
          <Heading style={headingStyle}>Hola {pacienteNombre}</Heading>
          <Text style={subheadingStyle}>Actualizamos el horario de tu reserva.</Text>

          <Section style={cardStyle}>
            {fechaAnteriorFormateada && (
              <div style={rowStyle}>
                <p style={rowLabelStyle}>Horario anterior</p>
                <p style={oldValueStyle}>{fechaAnteriorFormateada}</p>
              </div>
            )}
            <div style={rowStyle}>
              <p style={rowLabelStyle}>Nuevo horario</p>
              <p style={highlightRowStyle}>{fechaFormateada}</p>
            </div>
            <div style={rowStyle}>
              <p style={rowLabelStyle}>Servicio</p>
              <p style={rowValueStyle}>{servicioNombre}</p>
            </div>
            <div style={{ ...rowStyle, borderBottom: "none" }}>
              <p style={rowLabelStyle}>Profesional</p>
              <p style={rowValueStyle}>{profesionalNombre}</p>
            </div>
          </Section>

          <Hr style={{ margin: "24px 0 16px", borderColor: "#e5e5e7" }} />
          <Text style={footerStyle}>
            Si este horario no te sirve, puedes volver a reagendar o cancelar desde &quot;Mis horas&quot; en
            la app.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ReagendamientoEmail;
