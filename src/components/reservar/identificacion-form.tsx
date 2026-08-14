"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { identificarPorRut, completarIdentificacion } from "@/lib/citas/actions";
import { rutSchema, datosContactoSchema, type RutInput, type DatosContactoInput } from "@/lib/validaciones/auth";
import { formatearRut } from "@/lib/validaciones/rut";

export function RutForm({ especialidadId }: { especialidadId?: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RutInput>({ resolver: zodResolver(rutSchema) });

  function onSubmit(data: RutInput) {
    setError(null);
    const formData = new FormData();
    formData.set("rut", data.rut);
    if (especialidadId) formData.set("especialidadId", especialidadId);
    startTransition(async () => {
      const result = await identificarPorRut(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Identifícate con tu RUT — si ya reservaste antes, no vas a necesitar escribir tus datos de
        nuevo.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="rut">RUT</Label>
        <Input
          id="rut"
          placeholder="Ej: 17605812-2"
          autoComplete="off"
          autoFocus
          {...form.register("rut", {
            onBlur: (e) => form.setValue("rut", formatearRut(e.target.value)),
          })}
        />
        {form.formState.errors.rut && (
          <p className="text-sm text-red-600">{form.formState.errors.rut.message}</p>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Buscando..." : "Continuar"}
      </Button>
    </form>
  );
}

export function DatosContactoForm({
  rut,
  especialidadId,
}: {
  rut: string;
  especialidadId?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<DatosContactoInput>({ resolver: zodResolver(datosContactoSchema) });

  function onSubmit(data: DatosContactoInput) {
    setError(null);
    const formData = new FormData();
    formData.set("nombre", data.nombre);
    formData.set("telefono", data.telefono);
    formData.set("email", data.email);
    if (especialidadId) formData.set("especialidadId", especialidadId);
    startTransition(async () => {
      const result = await completarIdentificacion(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        No encontramos una reserva anterior con el RUT <span className="font-medium">{rut}</span>.
        Contanos tus datos — sin contraseña.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre">Nombre completo</Label>
        <Input id="nombre" autoComplete="name" autoFocus {...form.register("nombre")} />
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
        {pending ? "Continuando..." : "Continuar"}
      </Button>
    </form>
  );
}
