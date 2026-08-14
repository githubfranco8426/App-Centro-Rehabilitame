"use client";

import { useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reservarConContacto } from "@/lib/citas/actions";
import type { ContactoReservaInput } from "@/lib/validaciones/auth";
import { whatsappLink } from "@/lib/whatsapp";

type ReservaInfo = {
  contacto: ContactoReservaInput;
  servicioId: string;
  profesionalId: string;
  fechaInicio: string;
  fechaFin: string;
};

function reservaFormData(reserva: Omit<ReservaInfo, "contacto">) {
  const formData = new FormData();
  formData.set("servicioId", reserva.servicioId);
  formData.set("profesionalId", reserva.profesionalId);
  formData.set("fechaInicio", reserva.fechaInicio);
  formData.set("fechaFin", reserva.fechaFin);
  return formData;
}

export function ConfirmarReservaForm({ contacto, ...reserva }: ReservaInfo) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmada, setConfirmada] = useState(false);

  function onConfirmar() {
    setError(null);
    startTransition(async () => {
      const result = await reservarConContacto(reservaFormData(reserva));
      if (result?.error) {
        setError(result.error);
        return;
      }
      setConfirmada(true);
    });
  }

  if (confirmada) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <div>
          <p className="font-heading text-lg font-medium">¡Reserva confirmada!</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Te mandamos los detalles a tu email, junto con un link para que puedas entrar a
            &quot;Mis horas&quot; cuando quieras, sin necesitar contraseña.
          </p>
        </div>
        <div className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
          <p>Sin costo por cancelar.</p>
          <p>
            También puedes ver o consultar tu hora luego por WhatsApp:{" "}
            <a
              href={whatsappLink("Hola, quiero ver los detalles de mi hora reservada.")}
              target="_blank"
              rel="noopener"
              className="font-medium text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
            >
              +56 9 3738 1137
            </a>
          </p>
        </div>
      </div>
    );
  }

  const datos: { etiqueta: string; valor: string }[] = [
    { etiqueta: "RUT", valor: contacto.rut },
    { etiqueta: "Nombre", valor: contacto.nombre },
    { etiqueta: "Teléfono", valor: contacto.telefono },
    { etiqueta: "Email", valor: contacto.email },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">Revisa tus datos antes de confirmar.</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-white/40 bg-white/40 p-4 text-sm dark:border-white/10 dark:bg-white/5">
        {datos.map(({ etiqueta, valor }) => (
          <div key={etiqueta} className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
            <dd className="font-medium">{valor}</dd>
          </div>
        ))}
      </dl>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="button" onClick={onConfirmar} disabled={pending}>
        {pending ? "Reservando..." : "Confirmar reserva"}
      </Button>
    </div>
  );
}
