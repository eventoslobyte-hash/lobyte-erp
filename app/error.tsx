"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Algo salió mal</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {error.message || "Ocurrió un error inesperado. Probá de nuevo o volvé al dashboard."}
        </p>
      </div>
      <Button onClick={reset}>
        <RotateCcw className="h-4 w-4" />
        Reintentar
      </Button>
    </div>
  );
}
