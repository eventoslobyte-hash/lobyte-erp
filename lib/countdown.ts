import { differenceInMinutes, isPast } from "date-fns";

export interface Countdown {
  label: string; // "Faltan 2 días y 5 horas"
  totalMinutes: number;
  isUrgent: boolean; // < 48hs
  isPast: boolean;
}

/**
 * Devuelve una cuenta regresiva legible en español hacia una fecha objetivo.
 * Ej: "Faltan 2 días y 5 horas", "Faltan 45 minutos", "Venció hace 3 horas".
 */
export function getCountdown(target: Date | string, now: Date = new Date()): Countdown {
  const targetDate = typeof target === "string" ? new Date(target) : target;
  const totalMinutes = differenceInMinutes(targetDate, now);
  const past = isPast(targetDate);
  const abs = Math.abs(totalMinutes);

  const days = Math.floor(abs / (60 * 24));
  const hours = Math.floor((abs % (60 * 24)) / 60);
  const minutes = abs % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} día${days !== 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hora${hours !== 1 ? "s" : ""}`);
  if (days === 0 && minutes > 0) parts.push(`${minutes} minuto${minutes !== 1 ? "s" : ""}`);

  const body = parts.length > 0 ? parts.join(" y ") : "menos de 1 minuto";
  const label = past ? `Venció hace ${body}` : `Faltan ${body}`;

  return {
    label,
    totalMinutes,
    isUrgent: !past && abs <= 48 * 60,
    isPast: past,
  };
}
