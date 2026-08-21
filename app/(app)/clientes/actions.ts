"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import type { OrigenCliente } from "@prisma/client";

function parseDate(value: FormDataEntryValue | null): Date | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export async function createClientAction(formData: FormData) {
  const razonSocial = String(formData.get("razonSocial") || "").trim();
  const contactoNombre = String(formData.get("contactoNombre") || "").trim();
  const telefono = String(formData.get("telefono") || "").trim();

  if (!razonSocial || !contactoNombre || !telefono) {
    throw new Error("Razón social, contacto y teléfono son obligatorios.");
  }

  const client = await prisma.client.create({
    data: {
      razonSocial,
      contactoNombre,
      telefono,
      cuitCuil: String(formData.get("cuitCuil") || "") || null,
      contactoCargo: String(formData.get("contactoCargo") || "") || null,
      email: String(formData.get("email") || "") || null,
      comportamientoNotas: String(formData.get("comportamientoNotas") || "") || null,
      internalRating: Number(formData.get("internalRating") || 3),
      origenCliente: (String(formData.get("origenCliente") || "OTRO") as OrigenCliente),
      proximaExpo: String(formData.get("proximaExpo") || "") || null,
      fechaProximaExpo: parseDate(formData.get("fechaProximaExpo")),
    },
  });

  revalidatePath("/clientes");
  redirect(`/clientes/${client.id}`);
}

export async function updateClientAction(id: string, formData: FormData) {
  const razonSocial = String(formData.get("razonSocial") || "").trim();
  const contactoNombre = String(formData.get("contactoNombre") || "").trim();
  const telefono = String(formData.get("telefono") || "").trim();

  if (!razonSocial || !contactoNombre || !telefono) {
    throw new Error("Razón social, contacto y teléfono son obligatorios.");
  }

  await prisma.client.update({
    where: { id },
    data: {
      razonSocial,
      contactoNombre,
      telefono,
      cuitCuil: String(formData.get("cuitCuil") || "") || null,
      contactoCargo: String(formData.get("contactoCargo") || "") || null,
      email: String(formData.get("email") || "") || null,
      comportamientoNotas: String(formData.get("comportamientoNotas") || "") || null,
      internalRating: Number(formData.get("internalRating") || 3),
      origenCliente: (String(formData.get("origenCliente") || "OTRO") as OrigenCliente),
      proximaExpo: String(formData.get("proximaExpo") || "") || null,
      fechaProximaExpo: parseDate(formData.get("fechaProximaExpo")),
    },
  });

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}
