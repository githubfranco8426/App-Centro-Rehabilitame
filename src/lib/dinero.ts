const formateadorCLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatCLP(valor: number) {
  return formateadorCLP.format(valor);
}
