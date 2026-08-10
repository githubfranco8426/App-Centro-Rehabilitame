import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";
import { bodyStyle, containerStyle, footerStyle } from "./estilos";

export interface NuevaReservaAdminEmailProps {
  pacienteNombre: string;
  pacienteEmail: string;
  pacienteTelefono?: string;
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

const rowLabelStyle = {
  fontSize: "13px",
  color: "#666666",
  margin: 0,
};

const rowValueStyle = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#111111",
  margin: 0,
  textAlign: "right" as const,
};

const highlightRowStyle = {
  fontSize: "16px",
  fontWeight: 700,
  color: "#1f4fd8",
  margin: 0,
  textAlign: "right" as const,
};

export function NuevaReservaAdminEmail({
  pacienteNombre,
  pacienteEmail,
  pacienteTelefono,
  servicioNombre,
  profesionalNombre,
  fechaFormateada,
}: NuevaReservaAdminEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Nueva reserva: {pacienteNombre} — {servicioNombre} — {fechaFormateada}
      </Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <span style={badgeStyle}>Nueva reserva</span>
          <Heading style={headingStyle}>{pacienteNombre} agendó una hora</Heading>
          <Text style={subheadingStyle}>Se confirmó automáticamente en el sistema.</Text>

          <Section style={cardStyle}>
            <div style={{ ...rowStyle, borderBottom: "1px solid #e5e5e7" }}>
              <p style={rowLabelStyle}>Fecha y hora</p>
              <p style={highlightRowStyle}>{fechaFormateada}</p>
            </div>
            <div style={rowStyle}>
              <p style={rowLabelStyle}>Servicio</p>
              <p style={rowValueStyle}>{servicioNombre}</p>
            </div>
            <div style={rowStyle}>
              <p style={rowLabelStyle}>Profesional</p>
              <p style={rowValueStyle}>{profesionalNombre}</p>
            </div>
            <div style={rowStyle}>
              <p style={rowLabelStyle}>Email paciente</p>
              <p style={rowValueStyle}>{pacienteEmail}</p>
            </div>
            {pacienteTelefono && (
              <div style={{ ...rowStyle, borderBottom: "none" }}>
                <p style={rowLabelStyle}>Teléfono</p>
                <p style={rowValueStyle}>{pacienteTelefono}</p>
              </div>
            )}
          </Section>

          <Hr style={{ margin: "24px 0 16px", borderColor: "#e5e5e7" }} />
          <Text style={footerStyle}>
            Este aviso se genera automáticamente cada vez que se confirma una reserva nueva. Revisa el detalle
            completo o gestiona la hora desde el panel de administrador.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default NuevaReservaAdminEmail;
