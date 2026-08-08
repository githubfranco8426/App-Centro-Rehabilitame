export const LEAD_TIME_MINUTOS_PACIENTE = 180; // 3 horas

export const ESTADOS_CITA = [
  { id: "pendiente", nombre: "Pendiente" },
  { id: "confirmada", nombre: "Confirmada" },
  { id: "completada", nombre: "Completada" },
  { id: "no_asistio", nombre: "No asistió" },
  { id: "cancelada", nombre: "Cancelada" },
];

export function puedeGestionarCita(fechaInicio: string, estado: string): boolean {
  if (estado === "cancelada" || estado === "completada") return false;
  const minutosParaLaCita = (new Date(fechaInicio).getTime() - Date.now()) / 60_000;
  return minutosParaLaCita >= LEAD_TIME_MINUTOS_PACIENTE;
}
