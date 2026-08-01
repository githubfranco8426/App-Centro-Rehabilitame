"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth/actions";
import { loginSchema, type LoginInput } from "@/lib/validaciones/auth";

export default function LoginPage() {
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  function onSubmit(data: LoginInput) {
    setServerError(null);
    const formData = new FormData();
    formData.set("email", data.email);
    formData.set("password", data.password);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) setServerError(result.error);
    });
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Accedé para ver y gestionar tus horas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            {serverError && <p className="text-sm text-red-600">{serverError}</p>}
            <Button type="submit" disabled={pending}>
              {pending ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
            ¿No tenés cuenta?{" "}
            <Link href="/registro" className="font-medium underline">
              Registrate
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
