export function limpiarRut(rut: string): string {
  return rut.replace(/[.\s]/g, "").toUpperCase();
}

export function formatearRut(rut: string): string {
  const limpio = limpiarRut(rut).replace("-", "");
  if (limpio.length < 2) return limpio;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
}

/** Verifica el dígito verificador de un RUT chileno (módulo 11). */
export function validarRut(rut: string): boolean {
  const limpio = limpiarRut(rut).replace("-", "");
  if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false;

  const cuerpo = limpio.slice(0, -1);
  const dvIngresado = limpio.slice(-1);

  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const resto = 11 - (suma % 11);
  const dvCalculado = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
  return dvCalculado === dvIngresado;
}
