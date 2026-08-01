"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registrarYReservar, iniciarSesionYReservar } from "@/lib/citas/actions";
import { loginSchema, registroSchema, type LoginInput, type RegistroInput } from "@/lib/validaciones/auth";

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

  const registroForm = useForm<RegistroInput>({ resolver: zodResolver(registroSchema) });
  const loginForm = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  function onRegistro(data: RegistroInput) {
    setError(null);
    const formData = reservaFormData(reserva);
    formData.set("nombre", data.nombre);
    formData.set("telefono", data.telefono);
    formData.set("email", data.email);
    formData.set("password", data.password);
    startTransition(async () => {
      const result = await registrarYReservar(formData);
      if (result?.error) setError(result.error);
    });
  }

  function onLogin(data: LoginInput) {
    setError(null);
    const formData = reservaFormData(reserva);
    formData.set("email", data.email);
    formData.set("password", data.password);
    startTransition(async () => {
      const result = await iniciarSesionYReservar(formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <Tabs defaultValue="crear-cuenta">
      <TabsList className="w-full">
        <TabsTrigger value="crear-cuenta" className="flex-1">
          Crear cuenta
        </TabsTrigger>
        <TabsTrigger value="iniciar-sesion" className="flex-1">
          Iniciar sesión
        </TabsTrigger>
      </TabsList>

      <TabsContent value="crear-cuenta">
        <form onSubmit={registroForm.handleSubmit(onRegistro)} className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input id="nombre" autoComplete="name" {...registroForm.register("nombre")} />
            {registroForm.formState.errors.nombre && (
              <p className="text-sm text-red-600">{registroForm.formState.errors.nombre.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" type="tel" autoComplete="tel" {...registroForm.register("telefono")} />
            {registroForm.formState.errors.telefono && (
              <p className="text-sm text-red-600">{registroForm.formState.errors.telefono.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email-registro">Email</Label>
            <Input id="email-registro" type="email" autoComplete="email" {...registroForm.register("email")} />
            {registroForm.formState.errors.email && (
              <p className="text-sm text-red-600">{registroForm.formState.errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password-registro">Contraseña</Label>
            <Input
              id="password-registro"
              type="password"
              autoComplete="new-password"
              {...registroForm.register("password")}
            />
            {registroForm.formState.errors.password && (
              <p className="text-sm text-red-600">{registroForm.formState.errors.password.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Reservando..." : "Crear cuenta y reservar"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="iniciar-sesion">
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="flex flex-col gap-4 pt-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email-login">Email</Label>
            <Input id="email-login" type="email" autoComplete="email" {...loginForm.register("email")} />
            {loginForm.formState.errors.email && (
              <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password-login">Contraseña</Label>
            <Input
              id="password-login"
              type="password"
              autoComplete="current-password"
              {...loginForm.register("password")}
            />
            {loginForm.formState.errors.password && (
              <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
            )}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Reservando..." : "Iniciar sesión y reservar"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
