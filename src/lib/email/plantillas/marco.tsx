import type { ReactNode } from "react";
import { Body, Container, Img, Section, Text } from "@react-email/components";
import {
  APP_URL,
  LOGO_URL,
  bandStyle,
  bandTextBoldStyle,
  bandTextStyle,
  bodyStyle,
  buttonStyle,
  buttonWrapStyle,
  containerStyle,
  footerBandStyle,
  footerStyle,
  headerCardStyle,
} from "./estilos";

export interface MarcoCorreoProps {
  saludoTitulo: string;
  saludoTexto: string;
  children: ReactNode;
}

/**
 * Layout compartido por los correos al paciente: card blanca con el logo
 * oficial, franja azul marino de saludo, card blanca con el detalle
 * (children) y franja azul marino de pie — replica la estructura del
 * modelo de correo de referencia con los colores corporativos Rehabilita.me.
 */
export function MarcoCorreo({ saludoTitulo, saludoTexto, children }: MarcoCorreoProps) {
  return (
    <Body style={bodyStyle}>
      <Container style={containerStyle}>
        <Section style={headerCardStyle}>
          <Img
            src={LOGO_URL}
            width="88"
            height="88"
            alt="Rehabilita.me"
            style={{ margin: "0 auto", borderRadius: "50%" }}
          />
        </Section>

        <Section style={bandStyle}>
          <Text style={bandTextBoldStyle}>{saludoTitulo}</Text>
          <Text style={{ ...bandTextStyle, marginTop: "4px" }}>{saludoTexto}</Text>
        </Section>

        {children}

        <Section style={{ ...footerBandStyle, marginTop: "8px" }}>
          <Text style={footerStyle}>Centro Rehabilita.me · Iquique, Tarapacá</Text>
          <Text style={{ ...footerStyle, marginTop: "4px" }}>
            ¿Dudas? Escríbenos por WhatsApp o desde &quot;Mis horas&quot; en la app.
          </Text>
        </Section>
      </Container>
    </Body>
  );
}

export function BotonAdministrar() {
  return (
    <div style={buttonWrapStyle}>
      <a href={`${APP_URL}/mis-horas`} style={buttonStyle}>
        Administrar mis citas
      </a>
    </div>
  );
}
