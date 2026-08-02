export const LEAD_TIME_MINUTOS_PACIENTE = 180; // 3 horas

export function puedeGestionarCita(fechaInicio: string, estado: string): boolean {
  if (estado === "cancelada" || estado === "completada") return false;
  const minutosParaLaCita = (new Date(fechaInicio).getTime() - Date.now()) / 60_000;
  return minutosParaLaCita >= LEAD_TIME_MINUTOS_PACIENTE;
}
