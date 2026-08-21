import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">No encontramos lo que buscabas</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          El recurso pudo haber sido eliminado o la URL es incorrecta.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Volver al Dashboard</Link>
      </Button>
    </div>
  );
}
