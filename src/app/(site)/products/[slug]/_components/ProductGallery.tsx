"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-accent-soft font-display text-5xl text-accent/40">
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-surface">
        <Image src={images[active]} alt={name} fill className="object-contain" priority sizes="(max-width: 1024px) 100vw, 50vw" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border transition-colors",
                active === i ? "border-accent" : "border-border opacity-70 hover:opacity-100",
              )}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
