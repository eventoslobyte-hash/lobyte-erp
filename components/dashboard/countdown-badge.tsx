"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import { getCountdown } from "@/lib/countdown";
import { cn } from "@/lib/utils";

export function CountdownBadge({ target, className }: { target: string | Date; className?: string }) {
  const [label, setLabel] = useState(() => getCountdown(target).label);
  const [urgent, setUrgent] = useState(() => getCountdown(target).isUrgent);

  useEffect(() => {
    const update = () => {
      const c = getCountdown(target);
      setLabel(c.label);
      setUrgent(c.isUrgent);
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <span
      suppressHydrationWarning
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        urgent ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
        className
      )}
    >
      <Clock className="h-3 w-3" />
      {label}
    </span>
  );
}
