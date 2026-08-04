import type { ComponentType } from "react";
import { Activity, AudioLines, HandHeart } from "lucide-react";

// Kinesiología usa el sky blue y Fonoaudiología el terracota del tema
// (--primary / --accent en globals.css); Terapia Ocupacional suma verde
// esmeralda como tercer color, solo para uso decorativo en UI.
export const iconoEspecialidad: Record<string, ComponentType<{ className?: string }>> = {
  Kinesiología: Activity,
  Fonoaudiología: AudioLines,
  "Terapia Ocupacional": HandHeart,
};

export const colorEspecialidad: Record<string, { text: string; badge: string; glow: string }> = {
  Kinesiología: {
    text: "text-primary",
    badge: "bg-primary/15 text-primary",
    glow: "from-primary/30",
  },
  Fonoaudiología: {
    text: "text-accent",
    badge: "bg-accent/15 text-accent",
    glow: "from-accent/30",
  },
  "Terapia Ocupacional": {
    text: "text-emerald-600 dark:text-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    glow: "from-emerald-500/30",
  },
};
