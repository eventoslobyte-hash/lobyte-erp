import { Boxes } from "lucide-react";

export function BrandMark({ dark = true }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white">
        <Boxes className="h-5 w-5" />
      </div>
      <div>
        <p className={dark ? "text-sm font-bold leading-tight tracking-wide text-white" : "text-sm font-bold leading-tight tracking-wide"}>
          LOBYTE
        </p>
        <p className={dark ? "text-[11px] leading-tight text-white/60" : "text-[11px] leading-tight text-muted-foreground"}>
          ERP de Alquileres
        </p>
      </div>
    </div>
  );
}

export function isNavItemActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
