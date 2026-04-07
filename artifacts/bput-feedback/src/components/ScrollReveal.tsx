import { useScrollReveal, getRevealStyle } from "@/hooks/useScrollReveal";

type RevealDirection = "up" | "down" | "left" | "right" | "fade" | "scale";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: RevealDirection;
  delay?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  threshold?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
  as: Tag = "div",
  threshold,
  once,
}: ScrollRevealProps) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>({ threshold, once });

  return (
    <Tag
      ref={ref as any}
      className={className}
      style={getRevealStyle(isVisible, direction, delay)}
    >
      {children}
    </Tag>
  );
}

interface ScrollRevealGroupProps {
  children: React.ReactNode[];
  direction?: RevealDirection;
  stagger?: number;
  className?: string;
  itemClassName?: string;
}

export function ScrollRevealGroup({
  children,
  direction = "up",
  stagger = 60,
  className = "",
  itemClassName = "",
}: ScrollRevealGroupProps) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>();

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <div
          key={i}
          className={itemClassName}
          style={getRevealStyle(isVisible, direction, i * stagger)}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
