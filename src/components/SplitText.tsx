"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  splitType?: "chars" | "words" | "lines";
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  textAlign?: React.CSSProperties["textAlign"];
}

const SplitText = ({
  text,
  className = "",
  delay = 0.05,
  duration = 0.8,
  splitType = "chars",
  tag = "p",
  textAlign = "center",
}: SplitTextProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const split = (t: string) => {
    if (splitType === "words") return t.split(" ");
    return t.split("");
  };

  const items = split(text);

  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: delay,
      },
    },
  };

  const child = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: "easeOut" as const },
    },
  };

  const Tag = tag;

  return (
    <Tag ref={ref} style={{ textAlign, overflow: "hidden" }} className={className}>
      <motion.span
        className="split-parent"
        variants={container}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        style={{
          display: "inline-flex",
          flexWrap: "wrap",
          justifyContent: textAlign === "center" ? "center" : undefined,
          overflow: "hidden",
        }}
      >
        {items.map((item, i) => (
          <motion.span
            key={i}
            variants={child}
            style={{
              display: "inline-block",
              whiteSpace: splitType === "words" ? "pre" : "normal",
            }}
          >
            {item}
            {splitType === "lines" && i < items.length - 1 ? <br /> : null}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
};

export default SplitText;
