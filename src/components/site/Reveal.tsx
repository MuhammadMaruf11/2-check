"use client";

import { ReactNode } from "react";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { cn } from "@/lib/utils";

export default function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms */
  delay?: number;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useRevealOnScroll<HTMLDivElement>();

  const Comp = Tag as React.ElementType;

  return (
    <Comp ref={ref} className={cn("reveal", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Comp>
  );
}
