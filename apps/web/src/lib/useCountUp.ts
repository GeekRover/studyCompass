import { useEffect, useRef, useState } from "react";

/**
 * Counts from 0 to `end` once, the first time the element scrolls into view.
 * Respects prefers-reduced-motion (jumps straight to `end`).
 */
export function useCountUp<T extends HTMLElement = HTMLSpanElement>(end: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef<T>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(end);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(end * eased));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { value, ref };
}
