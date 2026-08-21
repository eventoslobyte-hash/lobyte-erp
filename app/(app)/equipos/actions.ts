"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { EquipmentModel, EquipmentStatus } from "@prisma/client";

function friendlyPrismaError(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    throw new Error("Ya existe un equipo con ese código interno. Elegí uno distinto.");
  }
  throw err;
}

export async function createEquipmentAction(formData: FormData) {
  const codigoInterno = String(formData.get("codigoInterno") || "").trim();
  if (!codigoInterno) throw new Error("El código interno es obligatorio.");

  try {
    await prisma.equipment.create({
      data: {
        codigoInterno,
        modelo: String(formData.get("modelo") || "OTRO") as EquipmentModel,
        estado: String(formData.get("estado") || "DISPONIBLE") as EquipmentStatus,
        descripcion: String(formData.get("descripcion") || "") || null,
        especificacionesTecnicas: String(formData.get("especificacionesTecnicas") || "") || null,
      },
    });
  } catch (err) {
    friendlyPrismaError(err);
  }

  revalidatePath("/equipos");
  redirect("/equipos");
}

export async function updateEquipmentAction(id: string, formData: FormData) {
  const codigoInterno = String(formData.get("codigoInterno") || "").trim();
  if (!codigoInterno) throw new Error("El código interno es obligatorio.");

  try {
    await prisma.equipment.update({
      where: { id },
      data: {
        codigoInterno,
        modelo: String(formData.get("modelo") || "OTRO") as EquipmentModel,
        estado: String(formData.get("estado") || "DISPONIBLE") as EquipmentStatus,
        descripcion: String(formData.get("descripcion") || "") || null,
        especificacionesTecnicas: String(formData.get("especificacionesTecnicas") || "") || null,
      },
    });
  } catch (err) {
    friendlyPrismaError(err);
  }

  revalidatePath("/equipos");
  redirect("/equipos");
}
