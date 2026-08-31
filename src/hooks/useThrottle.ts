import { useState, useEffect, useRef } from "react";

export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(0);

  useEffect(() => {
    if (lastRan.current === 0) {
      lastRan.current = Date.now();
    }

    const elapsed = Date.now() - lastRan.current;
    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= delay) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      Math.max(delay - elapsed, 0),
    );

    return () => clearTimeout(handler);
  }, [value, delay]);

  return throttledValue;
}
