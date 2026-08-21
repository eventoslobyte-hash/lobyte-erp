"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Ban, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CancelOrderButton({ action }: { action: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive">
          <Ban className="h-4 w-4" />
          Cancelar Alquiler
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Cancelar este alquiler?</DialogTitle>
          <DialogDescription>
            El evento va a pasar a estado "Cancelado" y se van a eliminar los eventos asociados en Google
            Calendar. Esta acción no borra los datos del alquiler.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Volver
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await action();
                  toast.success("Alquiler cancelado.");
                  setOpen(false);
                } catch (err: any) {
                  toast.error(err?.message || "No se pudo cancelar el alquiler.");
                }
              })
            }
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
            Sí, cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
