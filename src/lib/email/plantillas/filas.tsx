import type { CSSProperties } from "react";
import { Text } from "@react-email/components";
import {
  avatarStyle,
  dashedHrStyle,
  especialidadStyle,
  highlightRowStyle,
  profesionalNombreStyle,
  rowLabelStyle,
  rowStyle,
  sectionTitleStyle,
} from "./estilos";

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes[1]?.[0] ?? "")).toUpperCase();
}

export function TarjetaProfesional({ nombre, especialidad }: { nombre: string; especialidad?: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={avatarStyle}>{iniciales(nombre)}</div>
      <p style={profesionalNombreStyle}>{nombre}</p>
      {especialidad && <p style={especialidadStyle}>{especialidad}</p>}
    </div>
  );
}

export function SeparadorPunteado() {
  return <hr style={dashedHrStyle} />;
}

export function TituloSeccion({ children }: { children: string }) {
  return <p style={sectionTitleStyle}>{children}</p>;
}

export function Fila({
  label,
  valor,
  destacado,
  ultimo,
  valorStyle,
}: {
  label: string;
  valor: string;
  destacado?: boolean;
  ultimo?: boolean;
  valorStyle?: CSSProperties;
}) {
  return (
    <div style={{ ...rowStyle, ...(ultimo ? { borderBottom: "none" } : {}) }}>
      <Text style={rowLabelStyle}>{label}</Text>
      <Text style={{ ...(destacado ? highlightRowStyle : { fontSize: "14px", fontWeight: 600, color: "#111111", margin: 0, textAlign: "right" as const }), ...valorStyle }}>
        {valor}
      </Text>
    </div>
  );
}
