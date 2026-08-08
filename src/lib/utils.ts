import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Desenvuelve la forma T | T[] | null que devuelve Supabase para joins
// a-uno cuando no puede inferir la cardinalidad desde el tipo generado.
export function unico<T>(valor: T | T[] | null): T | null {
  if (!valor) return null;
  return Array.isArray(valor) ? (valor[0] ?? null) : valor;
}
