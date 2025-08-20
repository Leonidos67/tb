"use client";

import * as React from "react";
import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";

const spinVariants: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: 360 },
};

interface AnimatedBoltProps {
  className?: string;
  isAnimating?: boolean;
}

const AnimatedBolt = ({ className, isAnimating = false }: AnimatedBoltProps) => {
  const controls = useAnimation();

  React.useEffect(() => {
    if (isAnimating) {
      controls.start("animate");
    } else {
      controls.start("normal");
    }
  }, [isAnimating, controls]);

  return (
    <div className={className}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
      >
        <motion.g
          variants={spinVariants}
          animate={controls}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
          }}
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <circle cx="12" cy="12" r="4" />
        </motion.g>
      </svg>
    </div>
  );
};

export { AnimatedBolt };
