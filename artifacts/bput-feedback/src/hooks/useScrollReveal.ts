import { useEffect, useRef, useState, type RefObject } from "react";

type RevealDirection = "up" | "down" | "left" | "right" | "fade" | "scale";

interface UseScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

type ObserverCallback = (isIntersecting: boolean) => void;

const observerRegistry = new Map<string, {
  observer: IntersectionObserver;
  callbacks: Map<Element, ObserverCallback>;
}>();

function getObserverKey(threshold: number, rootMargin: string): string {
  return `${threshold}|${rootMargin}`;
}

function getSharedObserver(threshold: number, rootMargin: string) {
  const key = getObserverKey(threshold, rootMargin);
  let entry = observerRegistry.get(key);
  if (!entry) {
    const callbacks = new Map<Element, ObserverCallback>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const cb = callbacks.get(e.target);
          if (cb) cb(e.isIntersecting);
        }
      },
      { threshold, rootMargin }
    );
    entry = { observer, callbacks };
    observerRegistry.set(key, entry);
  }
  return entry;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
): [RefObject<T | null>, boolean] {
  const { threshold = 0.12, rootMargin = "0px 0px -40px 0px", once = true } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { observer, callbacks } = getSharedObserver(threshold, rootMargin);

    const cb: ObserverCallback = (intersecting) => {
      if (intersecting) {
        setIsVisible(true);
        if (once) {
          observer.unobserve(el);
          callbacks.delete(el);
        }
      } else if (!once) {
        setIsVisible(false);
      }
    };

    callbacks.set(el, cb);
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      callbacks.delete(el);
    };
  }, [threshold, rootMargin, once]);

  return [ref, isVisible];
}

const TRANSFORMS: Record<RevealDirection, string> = {
  up: "translateY(32px)",
  down: "translateY(-32px)",
  left: "translateX(40px)",
  right: "translateX(-40px)",
  fade: "translateY(0px)",
  scale: "scale(0.92)",
};

const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function getRevealStyle(
  isVisible: boolean,
  direction: RevealDirection = "up",
  delay: number = 0
): React.CSSProperties {
  if (reducedMotion) {
    return { opacity: 1, transform: "none" };
  }
  return {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translate(0,0) scale(1)" : TRANSFORMS[direction],
    transition: `opacity 0.35s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.35s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    willChange: isVisible ? "auto" : "opacity, transform",
  };
}
