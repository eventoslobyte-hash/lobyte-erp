"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CalendarSyncButton({ action }: { action: () => Promise<{ skipped?: boolean; reason?: string }> }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            const result = await action();
            if (result?.skipped) {
              toast.warning(result.reason || "Google Calendar no está configurado todavía.");
            } else {
              toast.success("Sincronizado con Google Calendar.");
            }
          } catch (err: any) {
            toast.error(err?.message || "No se pudo sincronizar con Google Calendar.");
          }
        })
      }
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Sincronizar Calendar
    </Button>
  );
}
