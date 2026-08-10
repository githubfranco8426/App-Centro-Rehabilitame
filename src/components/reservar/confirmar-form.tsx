"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reservarConContacto } from "@/lib/citas/actions";
import { contactoReservaSchema, type ContactoReservaInput } from "@/lib/validaciones/auth";
import { whatsappLink } from "@/lib/whatsapp";

type ReservaInfo = {
  servicioId: string;
  profesionalId: string;
  fechaInicio: string;
  fechaFin: string;
};

function reservaFormData(reserva: ReservaInfo) {
  const formData = new FormData();
  formData.set("servicioId", reserva.servicioId);
  formData.set("profesionalId", reserva.profesionalId);
  formData.set("fechaInicio", reserva.fechaInicio);
  formData.set("fechaFin", reserva.fechaFin);
  return formData;
}

export function ConfirmarReservaForm(reserva: ReservaInfo) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmada, setConfirmada] = useState(false);

  const form = useForm<ContactoReservaInput>({ resolver: zodResolver(contactoReservaSchema) });

  function onSubmit(data: ContactoReservaInput) {
    setError(null);
    const formData = reservaFormData(reserva);
    formData.set("nombre", data.nombre);
    formData.set("telefono", data.telefono);
    formData.set("email", data.email);
    startTransition(async () => {
      const result = await reservarConContacto(formData);
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

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Solo necesitamos tus datos de contacto — sin contraseña. Vas a poder gestionar tu hora
        luego con un link que te mandamos por email.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input id="nombre" autoComplete="name" {...form.register("nombre")} />
        {form.formState.errors.nombre && (
          <p className="text-sm text-red-600">{form.formState.errors.nombre.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input id="telefono" type="tel" autoComplete="tel" {...form.register("telefono")} />
        {form.formState.errors.telefono && (
          <p className="text-sm text-red-600">{form.formState.errors.telefono.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Reservando..." : "Confirmar reserva"}
      </Button>
    </form>
  );
}
