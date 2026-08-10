const NUMERO_WHATSAPP = "56937381137";

export function whatsappLink(mensaje?: string) {
  const base = `https://wa.me/${NUMERO_WHATSAPP}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
