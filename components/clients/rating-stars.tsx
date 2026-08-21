"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({ value, size = "sm" }: { value: number; size?: "sm" | "md" }) {
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5" title={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(starSize, i <= value ? "fill-warning text-warning" : "fill-none text-muted-foreground/40")}
        />
      ))}
    </div>
  );
}

export function RatingStarsInput({
  name,
  defaultValue = 3,
}: {
  name: string;
  defaultValue?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <label key={i} className="flex cursor-pointer flex-col items-center gap-1">
          <input
            type="radio"
            name={name}
            value={i}
            defaultChecked={i === defaultValue}
            className="peer sr-only"
          />
          <Star className="h-6 w-6 text-muted-foreground/40 peer-checked:fill-warning peer-checked:text-warning" />
          <span className="text-[10px] text-muted-foreground">{i}</span>
        </label>
      ))}
    </div>
  );
}
