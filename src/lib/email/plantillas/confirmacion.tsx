import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import { bodyStyle, containerStyle, footerStyle } from "./estilos";

export interface ConfirmacionEmailProps {
  pacienteNombre: string;
  servicioNombre: string;
  profesionalNombre: string;
  fechaFormateada: string;
}

const badgeStyle = {
  display: "inline-block",
  backgroundColor: "#e8f5ee",
  color: "#1f7a4d",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
  padding: "4px 10px",
  borderRadius: "999px",
  marginBottom: "16px",
};

const headingStyle = {
  fontSize: "22px",
  fontWeight: 700,
  margin: "0 0 4px",
  color: "#111111",
};

const subheadingStyle = {
  fontSize: "14px",
  color: "#666666",
  margin: "0 0 24px",
};

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
const highlightRowStyle = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#1f4fd8",
  margin: 0,
  textAlign: "right" as const,
};

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
          <span style={badgeStyle}>Hora confirmada</span>
          <Heading style={headingStyle}>¡Listo, {pacienteNombre}!</Heading>
          <Text style={subheadingStyle}>Tu reserva quedó agendada con éxito.</Text>

          <Section style={cardStyle}>
            <div style={rowStyle}>
              <p style={rowLabelStyle}>Fecha y hora</p>
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
            Si necesitas cancelar o reagendar, puedes hacerlo desde &quot;Mis horas&quot; en la app, o
            escribiéndonos directo por WhatsApp.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default ConfirmacionEmail;
