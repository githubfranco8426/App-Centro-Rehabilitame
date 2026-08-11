// Colores corporativos Rehabilita.me, tomados directamente del logo oficial
// (public/images/logo-pagina.png en rehabilitame.cl).
export const NAVY = "#1F3B50";
export const NAVY_DARK = "#16293A";
export const GOLD = "#988757";

// Logo oficial, hosteado en el sitio público (rehabilitame.cl) — los clientes
// de correo no pueden cargar archivos locales, necesitan una URL absoluta.
export const LOGO_URL = "https://rehabilitame.cl/images/logo-email.png";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://rehabilitame.cl";

export const bodyStyle = {
  backgroundColor: "#eef1f4",
  fontFamily: "Helvetica, Arial, sans-serif",
  padding: "24px 0",
};

export const containerStyle = {
  maxWidth: "480px",
  margin: "0 auto",
};

export const headerCardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "20px",
  textAlign: "center" as const,
  marginBottom: "8px",
};

export const bandStyle = {
  backgroundColor: NAVY,
  borderRadius: "16px",
  padding: "18px 24px",
  marginBottom: "8px",
};

export const bandTextStyle = {
  color: "#ffffff",
  fontSize: "14px",
  lineHeight: "20px",
  margin: 0,
};

export const bandTextBoldStyle = {
  ...bandTextStyle,
  fontWeight: 700,
};

export const cardStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "24px",
  marginBottom: "8px",
};

export const avatarStyle = {
  display: "inline-block",
  width: "56px",
  height: "56px",
  lineHeight: "56px",
  borderRadius: "50%",
  backgroundColor: "#f1ece0",
  color: GOLD,
  fontSize: "20px",
  fontWeight: 700,
  textAlign: "center" as const,
  margin: "0 0 12px",
};

export const profesionalNombreStyle = {
  fontSize: "17px",
  fontWeight: 700,
  color: "#111111",
  margin: "0 0 2px",
  textAlign: "center" as const,
};

export const especialidadStyle = {
  fontSize: "13px",
  color: GOLD,
  fontWeight: 600,
  margin: 0,
  textAlign: "center" as const,
};

export const dashedHrStyle = {
  margin: "20px 0",
  border: "none",
  borderTop: "1px dashed #d8dce1",
};

export const sectionTitleStyle = {
  fontSize: "13px",
  fontWeight: 700,
  color: NAVY,
  textTransform: "uppercase" as const,
  letterSpacing: "0.03em",
  margin: "0 0 12px",
};

export const rowStyle = {
  display: "flex" as const,
  justifyContent: "space-between" as const,
  padding: "10px 0",
  borderBottom: "1px solid #eef1f4",
};

export const rowLabelStyle = { fontSize: "13px", color: "#666666", margin: 0 };
export const rowValueStyle = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#111111",
  margin: 0,
  textAlign: "right" as const,
};
export const highlightRowStyle = {
  fontSize: "15px",
  fontWeight: 700,
  color: NAVY,
  margin: 0,
  textAlign: "right" as const,
};

export const buttonWrapStyle = {
  textAlign: "center" as const,
  marginTop: "22px",
};

export const buttonStyle = {
  display: "inline-block",
  backgroundColor: NAVY,
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "0.02em",
  textTransform: "uppercase" as const,
  textDecoration: "none",
  padding: "12px 28px",
  borderRadius: "999px",
};

export const footerBandStyle = {
  backgroundColor: NAVY_DARK,
  borderRadius: "16px",
  padding: "16px 24px",
  textAlign: "center" as const,
};

export const footerStyle = {
  color: "#c7d0d9",
  fontSize: "12px",
  lineHeight: "18px",
  margin: 0,
};
