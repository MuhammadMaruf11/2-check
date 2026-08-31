"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight IntersectionObserver-based scroll reveal.
 * Adds the `reveal-in` class (see globals.css) once the element enters the
 * viewport. No animation library dependency, and automatically inert when
 * the user has `prefers-reduced-motion` set (handled purely in CSS).
 */
export function useRevealOnScroll<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-in");
          observer.unobserve(entry.target);
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
