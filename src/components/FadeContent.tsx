"use client";

import { useRef, useEffect, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface FadeContentProps {
  children: ReactNode;
  container?: string;
  blur?: boolean;
  duration?: number;
  ease?: string;
  delay?: number;
  threshold?: number;
  initialOpacity?: number;
  dissolveAfter?: number;
  dissolveDuration?: number;
  dissolveEase?: string;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const FadeContent = ({
  children,
  container,
  blur = false,
  duration = 1000,
  ease = "power2.out",
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  dissolveAfter = 0,
  dissolveDuration = 0.5,
  dissolveEase = "power2.in",
  onComplete,
  onDisappearanceComplete,
  className = "",
  style,
  ...props
}: FadeContentProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let scrollTarget: Element | null = container
      ? document.querySelector(container)
      : null;

    const startPct = (1 - threshold) * 100;
    const start = `top ${startPct}%`;

    const getSeconds = (val: number) => (val > 100 ? val / 1000 : val);

    const tl = gsap.timeline({ paused: true });

    gsap.set(el, {
      autoAlpha: initialOpacity,
      filter: blur ? "blur(10px)" : "blur(0px)",
    });

    tl.to(el, {
      autoAlpha: 1,
      filter: "blur(0px)",
      duration: getSeconds(duration),
      ease,
      onComplete: () => {
        onComplete?.();
        if (dissolveAfter > 0) {
          gsap.to(el, {
            autoAlpha: initialOpacity,
            filter: blur ? "blur(10px)" : "blur(0px)",
            delay: getSeconds(dissolveAfter),
            duration: getSeconds(dissolveDuration),
            ease: dissolveEase,
            onComplete: () => onDisappearanceComplete?.(),
          });
        }
      },
    });

    const st = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => tl.play(),
    } as ScrollTrigger.Vars);

    return () => {
      st.kill();
      tl.kill();
    };
  }, []);

  return (
    <div ref={ref} className={className} style={style} {...props}>
      {children}
    </div>
  );
};

export default FadeContent;
