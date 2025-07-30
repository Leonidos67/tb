"use client";

import * as React from "react";
import { motion, useAnimation } from "motion/react";
import type { Variants } from "motion/react";

interface AnimatedChevronDownProps {
  className?: string;
  isAnimating?: boolean;
}

const chevronVariants: Variants = {
  normal: {
    y: 0,
    opacity: 1,
  },
  animate: {
    y: [4, 0],
    opacity: [0.3, 1],
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const AnimatedChevronDown = ({ className, isAnimating = false }: AnimatedChevronDownProps) => {
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
        <motion.path
          d="m6 9 6 6 6-6"
          variants={chevronVariants}
          animate={controls}
          initial="normal"
        />
      </svg>
    </div>
  );
};

export { AnimatedChevronDown }; 